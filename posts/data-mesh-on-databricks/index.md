---
title: "Data Mesh on Databricks: Data Products, Domains, and a Practical Example"
date: "2026-01-29"
excerpt: "A clear explanation of data mesh (what it is and what it isn’t), plus a concrete Databricks example using Unity Catalog, Delta, and Delta Live Tables to publish domain-owned data products."
coverImage: "/images/posts/databricks.png"
alt: "Databricks logo"
coverImageFit: "contain"
---

# Data Mesh on Databricks: Data Products, Domains, and a Practical Example

Data mesh is an operating model for analytics and data platforms. It’s not “a tool you buy” and it’s not “everyone does their own thing.” The idea is to scale data work by **shifting ownership closer to the domains that know the data best**, while still keeping **shared standards, governance, and a self-serve platform**.

If you’ve ever had a central data team drowning in requests (“please add this field”, “why is the metric wrong?”, “who owns this table?”), data mesh is one of the most practical responses.

## What data mesh is ?

In a data mesh, each business domain (e.g., Orders, Marketing, Finance) owns and publishes **data products**—well-defined, discoverable datasets with SLAs, documentation, quality checks, and access policies. A platform team provides shared infrastructure (compute, storage, orchestration, observability). Governance becomes **federated**: domains ship fast, but within guardrails.

## The four principles (and what they look like in practice)

### 1) Domain-oriented ownership

- The Orders domain owns the “orders” data product end-to-end.
- They are accountable for definitions, freshness, and incident response.

### 2) Data as a product

A “table” becomes a product when it has:

- A **clear contract** (schema, semantics, usage)
- **Quality guarantees** (tests/expectations)
- **Operational SLOs** (freshness, availability)
- **An owner** and a support path
- **Governed access** (who can see what)

### 3) Self-serve data platform

Domains shouldn’t need to reinvent pipelines, access controls, or monitoring. The platform provides a paved road:

- Standard ingestion patterns
- Managed pipelines / workflows
- CI/CD and environments
- Observability, lineage, cost controls

### 4) Federated computational governance

“Federated” means policies are shared and enforced consistently, but authored collaboratively:

- Central standards (naming, PII policy, retention)
- Domain-specific implementation (what’s PII, who can access)

## A practical Databricks mapping

Databricks maps nicely to data mesh because it can combine **storage (Delta Lake)**, **governance (Unity Catalog)**, and **pipelines (DLT / Workflows)** under one control plane.

Here’s a useful mental model:

- **Domain** → a Unity Catalog **catalog** (or schema), owned by a domain team
- **Data product** → a curated **Gold table/view** (plus docs, checks, and grants)
- **Platform** → shared Databricks workspaces, clusters/warehouses, Workflows, DLT, monitoring
- **Governance** → Unity Catalog permissions, lineage, tags, masking/row filters (where used)

## Example: “Orders” domain publishes an Orders data product

Let’s say you want:

- Bronze: raw events and operational extracts
- Silver: cleaned, standardized entities
- Gold: business-ready product for consumers

### Step 1: Create a domain-owned catalog + schemas (Unity Catalog)

This example uses a catalog per domain and schemas per layer.

```sql
-- Domain boundary
CREATE CATALOG IF NOT EXISTS orders;

-- Layers (you can also align to teams/products instead of medallion)
CREATE SCHEMA IF NOT EXISTS orders.bronze;
CREATE SCHEMA IF NOT EXISTS orders.silver;
CREATE SCHEMA IF NOT EXISTS orders.gold;

-- Optional: make ownership explicit
ALTER CATALOG orders OWNER TO `orders-domain-owners`;
ALTER SCHEMA orders.gold OWNER TO `orders-domain-owners`;
```

### Step 2: Build and validate the product with Delta Live Tables (DLT)

In DLT, you can express transformations and basic quality expectations. The exact code style varies, but this pattern is common: ingest → clean → publish.

```python
import dlt
from pyspark.sql.functions import col, to_timestamp

@dlt.table(
  name="orders_silver",
  comment="Cleaned Orders entity (domain-owned)."
)
@dlt.expect("order_id_is_not_null", "order_id IS NOT NULL")
@dlt.expect("amount_is_positive", "amount >= 0")
def orders_silver():
  df = spark.table("orders.bronze.orders_raw")
  return (
    df
    .withColumn("order_ts", to_timestamp(col("order_ts")))
    .select("order_id", "customer_id", "order_ts", "amount", "currency", "status")
  )

@dlt.table(
  name="orders_gold",
  comment="Orders data product: analytics-ready, stable schema, governed access."
)
def orders_gold():
  df = dlt.read("orders_silver")
  return df.filter(col("status").isin("PAID", "SHIPPED", "REFUNDED"))
```

What makes this a “product” is not the code alone—it’s that `orders.gold.orders_gold` has **an owner**, a **contract**, **quality checks**, and **access policies**.

### Step 3: Document the product (make it discoverable)

At minimum, add descriptions and column comments for the “Gold” surface. Consumers should not guess what fields mean.

```sql
COMMENT ON TABLE orders.gold.orders_gold IS
  'Orders data product (Gold). Use for revenue, cohort, and fulfillment analytics.';
```

### Step 4: Govern access (Unity Catalog grants)

Publish a stable consumption surface and grant access intentionally (by group).

```sql
-- Example: analysts can query the Gold product
GRANT USAGE ON CATALOG orders TO `analytics`;
GRANT USAGE ON SCHEMA orders.gold TO `analytics`;
GRANT SELECT ON TABLE orders.gold.orders_gold TO `analytics`;

-- Example: broader BI access only to an aggregated view
CREATE OR REPLACE VIEW orders.gold.orders_daily_revenue AS
SELECT
  date(order_ts) AS order_date,
  currency,
  sum(amount) AS revenue
FROM orders.gold.orders_gold
GROUP BY 1, 2;

GRANT SELECT ON VIEW orders.gold.orders_daily_revenue TO `bi_consumers`;
```

If you need stricter governance (PII masking, row filters, etc.), Unity Catalog provides patterns for column masking and policy-based access depending on your setup and requirements.

### Step 5: Optional sharing across domains or external consumers

If another domain or an external partner needs access, you can share a governed product rather than copying data around. One option is **Delta Sharing** (where appropriate).

The goal remains the same: consumers get access to the product surface, not to a pile of raw tables.

## What “good” looks like after a few weeks

If you implement data mesh well on Databricks, you’ll notice:

- **Fewer ad-hoc, one-off tables** and more curated product surfaces
- Clear ownership (“who do I page when this breaks?”)
- Better consistency because “Gold” becomes the contract
- Governance becomes scalable (central policies + domain execution)

## Common mistakes to avoid

- **Calling every table a data product**: if it has no owner, docs, and SLOs, it’s not a product.
- **No platform paved road**: domains shouldn’t have to invent orchestration, patterns, or monitoring.
- **Over-centralizing governance**: if every grant and schema change needs a central team, you’ll recreate the bottleneck.
- **No “golden path”**: data mesh succeeds when building the *next* product is easier than building a snowflake.

## A small starting checklist

- [ ] Define your first 2–3 domains and domain owners
- [ ] Pick 1–2 “must-have” data products and publish them as curated Gold tables/views
- [ ] Enforce a minimum contract (schema, docs, expectations, freshness target)
- [ ] Use Unity Catalog for consistent access control and discovery
- [ ] Create a lightweight governance council (standards + exceptions process)

