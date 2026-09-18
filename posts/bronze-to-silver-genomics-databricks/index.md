---
title: "Normalizing ~100 Bronze Tables into Silver on Databricks: Lessons from Genomics Data"
date: "2026-09-17"
excerpt: "How I approached turning roughly 100 raw bronze tables—VCFs, LIMS exports, sequencing run metadata, clinical annotations—into a small set of conformed silver tables in a genomics platform."
coverImage: "/images/posts/databricks.png"
alt: "Databricks logo"
coverImageFit: "contain"
---

# Normalizing ~100 Bronze Tables into Silver on Databricks: Lessons from Genomics Data

Bronze is easy to grow and hard to use. In a genomics platform, raw data arrives from sequencers, LIMS systems, variant callers, clinical systems, and a long tail of vendor exports—and before long you have **~100 bronze tables** that nobody can join without tribal knowledge.

The silver layer is where that sprawl becomes usable. This post covers how I approached that normalization: the entity model, the metadata-driven pipeline pattern that made 100 tables tractable, and the genomics-specific problems (variant representation, sample identity, PHI) that don't show up in a typical orders-and-customers example.

## What bronze actually looked like

Bronze was intentionally big: land the source as-is, append-only, with ingestion metadata attached. The ~100 tables broke down roughly into five families.

| Family | Examples | Typical shape |
| --- | --- | --- |
| Sequencing output | VCF/gVCF exports, BAM manifests, QC metrics | Wide, semi-structured, per-run |
| LIMS / lab ops | specimens, aliquots, plates, assay runs | Relational extracts, mutable source rows |
| Clinical / phenotype | diagnoses, phenotype terms, demographics | PHI-bearing, coded vocabularies |
| Reference / annotation | gene panels, transcript sets, ClinVar-style annotation snapshots | Versioned, slowly changing |
| Vendor drops | one-off CSVs from partner labs | Inconsistent headers, no contract |

The core problem isn't volume. It's that the same real-world entity—a subject, a specimen, a variant—appears in a dozen tables under a dozen different identifiers and conventions.

## The silver target: fewer tables, stronger contracts

The goal was never "one silver table per bronze table." That just relocates the mess. ~100 bronze tables collapsed into roughly a dozen conformed entities:

- `subject` — the person, with a stable surrogate key and de-identified attributes
- `specimen` and `aliquot` — physical sample lineage
- `sequencing_run` and `run_qc` — instrument output and quality metrics
- `sample_assay` — the bridge between a physical sample and an assay result
- `variant` — normalized, reference-anchored variant records
- `variant_call` — per-sample observations of a variant, with genotype and quality
- `phenotype_observation` — coded clinical observations
- `annotation_snapshot` — versioned reference annotations

Everything else became either a lookup, a view, or was dropped because no consumer used it. That last category was bigger than expected—about a fifth of bronze tables had no downstream reader at all.

## Making 100 tables tractable: metadata-driven normalization

Hand-writing 100 pipelines is how you end up with 100 slightly different bugs. Instead, most tables are described by config, and a small number of generic builders do the work.

A per-source config entry looks like this:

```yaml
- source: lims.specimens
  target: silver.specimen
  load_type: scd2
  business_key: [lims_specimen_id, source_system]
  column_map:
    SPECIMEN_ID: lims_specimen_id
    SUBJ_ID: lims_subject_id
    COLLECT_DT: collected_at
    SPEC_TYPE: specimen_type
  casts:
    collected_at: timestamp
  expectations:
    lims_specimen_id_not_null: "lims_specimen_id IS NOT NULL"
    collected_at_plausible: "collected_at > '1990-01-01'"
```

The generic builder reads the config, applies the mapping, and registers a Delta Live Tables definition. Roughly 80 of the 100 tables needed nothing beyond config; the remaining 20—mostly VCF and annotation sources—got bespoke code.

```python
import dlt
from pyspark.sql import functions as F

def build_silver_table(cfg):
    @dlt.table(name=cfg["target"], comment=f"Silver entity from {cfg['source']}")
    @dlt.expect_all_or_drop(cfg.get("expectations", {}))
    def _table():
        df = dlt.read_stream(cfg["source"])
        for src_col, tgt_col in cfg["column_map"].items():
            df = df.withColumnRenamed(src_col, tgt_col)
        for col, dtype in cfg.get("casts", {}).items():
            df = df.withColumn(col, F.col(col).cast(dtype))
        return df.withColumn(
            "business_key_hash",
            F.sha2(F.concat_ws("||", *[F.col(c) for c in cfg["business_key"]]), 256),
        )

for cfg in load_configs():
    build_silver_table(cfg)
```

The hashed business key matters more than it looks. It gives every silver row a deterministic identity that survives reprocessing, and it's what the merge logic keys on.

## Genomics-specific problems worth calling out

### Variant representation is not a string comparison

The same variant can be written several valid ways. A deletion can be left-aligned or not, multi-allelic sites arrive as one row with comma-separated alternates, and indels carry padding bases. If you key on `chrom:pos:ref:alt` as it arrives, you will silently create duplicate variants that never join.

Silver normalizes before keying: split multi-allelic sites into one row per alternate allele, left-align and trim indels against the reference, and standardize contig naming (`chr1` vs `1`). Only then compute the variant key.

```python
normalized = (
    raw_vcf
    .withColumn("alt", F.explode(F.split(F.col("alt_raw"), ",")))
    .withColumn("contig", F.regexp_replace("contig_raw", "^chr", ""))
    .transform(left_align_and_trim)  # reference-aware, genome build pinned
    .withColumn(
        "variant_key",
        F.sha2(F.concat_ws(":", "genome_build", "contig", "position", "ref", "alt"), 256),
    )
)
```

The genome build belongs in the key. Mixing GRCh37 and GRCh38 coordinates in one table is the kind of bug that produces plausible-looking wrong answers for months.

### Sample identity across systems

A specimen has a LIMS barcode, a sequencing sample name, and often a partner-lab identifier—none of which match. Silver holds a crosswalk table that maps every known external identifier to the internal surrogate key, and every entity table resolves through it. Unresolvable identifiers go to a quarantine table rather than being dropped, because in practice they signal a real upstream process problem.

### Mutable sources need SCD2, not overwrite

LIMS rows change: a specimen gets reclassified, a collection date gets corrected. Overwriting loses the ability to reproduce an analysis as it looked at the time. Entities sourced from mutable systems are tracked with slowly changing dimension type 2.

```python
dlt.create_streaming_table("silver.specimen")

dlt.apply_changes(
    target="silver.specimen",
    source="bronze.lims_specimens_clean",
    keys=["business_key_hash"],
    sequence_by=F.col("source_updated_at"),
    stored_as_scd_type=2,
)
```

Reproducibility isn't a nice-to-have in genomics. If a clinical interpretation was made in March, you need to be able to reconstruct the exact inputs.

### PHI stops at the silver boundary

Clinical and demographic sources carry protected health information. The rule I settled on: bronze retains the raw payload in a restricted catalog, and silver publishes de-identified entities—surrogate keys instead of MRNs, ages instead of birth dates, dates shifted per subject by a consistent offset. Unity Catalog enforces the split.

```sql
GRANT SELECT ON TABLE genomics.silver.subject TO `research_analysts`;
-- bronze stays restricted to the ingestion service principal and privileged roles
```

Consistent per-subject date shifting preserves intervals between events, which is what most analyses actually need, without exposing real dates.

## What made the migration survivable

**Migrate by consumer, not by table.** I started with the handful of downstream analyses that mattered most and pulled only the bronze tables they needed into silver. That surfaced the real entity model faster than any modeling exercise, and it meant every sprint delivered something usable.

**Quarantine instead of drop.** Rows that fail expectations land in a side table with the failure reason. The first weeks of quarantine volume told us more about upstream data quality than any profiling run.

**Pin reference data by version.** Annotations change. Silver stores the annotation source version alongside the records, so a result can always be traced to the reference snapshot that produced it.

**Delete aggressively.** Confirming that a bronze table has no readers, and then not modeling it, was the single biggest scope reduction available.

## Where it landed

The ~100 bronze tables now feed about a dozen silver entities with owners, expectations, and documented keys. The practical difference is that a new analysis starts by joining `subject`, `specimen`, and `variant_call`—not by asking someone which of four sample tables is the current one.

The normalization work itself is mostly unglamorous: mapping columns, resolving identifiers, agreeing on what a "sample" means. The genomics-specific parts—variant normalization, build pinning, de-identification—are where the real correctness risk lives, and they deserve bespoke code and tests rather than config.
