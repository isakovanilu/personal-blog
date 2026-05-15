---
title: "Database Indexing: How It Works, When to Use It, and Practical Examples"
date: "2026-01-30"
excerpt: "A practical guide to database indexes—what they do, how they speed up queries, common index types, and how to choose the right index without slowing down writes."
coverImage: "/images/posts/data-engineering.jpg"
alt: "Abstract data engineering illustration"
---

# Database Indexing: How It Works, When to Use It, and Practical Examples

Indexes are one of the highest-leverage performance tools in a database—and one of the easiest ways to accidentally make things worse. The short version:

- **Reads get faster** (less data scanned, fewer pages touched)
- **Writes get slower** (every insert/update/delete may need index maintenance)
- The “right” index depends on **your queries**, not your tables

This post explains how indexing works, what kinds of indexes exist, and how to design indexes that match real workloads.

## What an index really is

At a high level, an index is a data structure that maps from a **search key** to the **location of rows**. Instead of scanning an entire table, the database can traverse the index and jump directly to matching rows.

Think of it like a book index:

- Without an index, you flip every page (table scan).
- With an index, you jump to a page range (index seek) and then read only what’s needed.

## The most common index: B-tree

Most relational databases (Postgres, MySQL/InnoDB, SQL Server, Oracle) default to **B-tree** style indexes for general-purpose workloads.

B-trees are good at:

- Equality filters: `WHERE user_id = 123`
- Range filters: `WHERE created_at >= ... AND created_at < ...`
- Sorting: `ORDER BY created_at` (sometimes “free” if it matches the index order)

## What makes an index “usable” for a query

An index is useful when the database can use it to **avoid scanning lots of rows**.

The main factors:

- **Selectivity**: how much the filter reduces rows (e.g., `user_id` is usually selective, `status='ACTIVE'` might not be)
- **Access pattern**: equality vs range vs prefix matches
- **Return columns**: can the query be satisfied from the index alone?

## Index design basics

### 1) Index the columns you filter on (WHERE)

If this query is common:

```sql
SELECT *
FROM orders
WHERE customer_id = 42;
```

Then this is a typical index:

```sql
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
```

### 2) Composite indexes: order matters

If you often filter by both `customer_id` and `created_at`:

```sql
SELECT *
FROM orders
WHERE customer_id = 42
  AND created_at >= '2026-01-01'
ORDER BY created_at DESC
LIMIT 50;
```

This composite index can help:

```sql
CREATE INDEX idx_orders_customer_created_at
  ON orders(customer_id, created_at DESC);
```

Why ordering matters:

- Most databases use the **leftmost prefix** of a composite index.
- An index on `(customer_id, created_at)` helps queries filtering on `customer_id` alone.
- But it usually won’t help a query filtering only on `created_at` (because `created_at` isn’t the leftmost column).

### 3) Covering indexes (index-only queries)

Sometimes the fastest query is the one that never touches the table at all.

Example:

```sql
SELECT order_id, created_at
FROM orders
WHERE customer_id = 42
ORDER BY created_at DESC
LIMIT 50;
```

If your index contains all required columns, the database can sometimes do an **index-only scan** (engine-dependent and requires visibility/heap rules in some systems).

Postgres-style example:

```sql
CREATE INDEX idx_orders_customer_created
  ON orders(customer_id, created_at DESC)
  INCLUDE (order_id);
```

### 4) Partial indexes (when you query a subset a lot)

If most queries focus on “active” records:

```sql
SELECT *
FROM users
WHERE is_active = true
  AND email = 'a@b.com';
```

A partial index can be smaller and faster:

```sql
CREATE INDEX idx_users_active_email
  ON users(email)
  WHERE is_active = true;
```

Partial indexes are especially powerful when the predicate matches a frequent access pattern.

## Indexes for joins

Joins are often where performance problems show up.

If you join on `orders.customer_id = customers.id`, the common rule is:

- Ensure the **join keys** are indexed (often primary key on one side, foreign key index on the other).

Example:

```sql
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
```

## Why indexes slow down writes

Every additional index is another structure the database must maintain:

- Insert row → insert index entries
- Update indexed column → update index entry (may cause page splits)
- Delete row → remove index entry

This is why “index everything” is rarely the right answer. Indexes are a trade-off.

## How to tell if an index is being used

Use the query planner:

- Postgres: `EXPLAIN (ANALYZE, BUFFERS) ...`
- MySQL: `EXPLAIN ...`
- SQL Server: actual execution plan

In general, you’re looking for:

- **Index Seek / Index Scan** instead of **Sequential/Table Scan**
- Lower estimated/actual rows
- Lower buffers/pages read

Example (Postgres):

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT *
FROM orders
WHERE customer_id = 42
ORDER BY created_at DESC
LIMIT 50;
```

If you see a sequential scan on a large table for a highly selective filter, it’s a sign either:

- The right index doesn’t exist, or
- Statistics are stale, or
- The filter isn’t selective enough to justify index traversal.

## Common indexing mistakes

- **Indexing low-selectivity columns**: e.g., `status` with only a few values, unless paired with a selective column or used as a partial index.
- **Wrong composite order**: putting range columns first can block use of later equality conditions.
- **Too many indexes**: great read performance, terrible write performance.
- **Indexing columns that change frequently**: updates become expensive.
- **Assuming an index helps every query**: it must match the query shape (filters, joins, sort).

## A simple “index decision” checklist

- [ ] Is the table big enough that scans are expensive?
- [ ] Is the filter/join selective enough?
- [ ] Does the index match the query’s filters and sort order?
- [ ] Do we need a covering index (avoid table lookups)?
- [ ] Are we okay paying the write cost?
- [ ] Do we have evidence from `EXPLAIN`?

## Final thought

Indexing is best treated as a feedback loop:

1. Identify slow queries
2. Read the plan
3. Add (or adjust) one index at a time
4. Measure again

That discipline keeps you from accumulating “mystery indexes” that nobody remembers but everyone pays for.
