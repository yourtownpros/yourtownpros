# D1 deltas: the per-ship data convention

From Nov 14, 2026 on, every YourTownPros data ship that changes listing
data also emits one SQL delta file into this folder. The workflow
`.github/workflows/deploy-and-delta.yml` applies new files to the D1
database `yourtownpros-listings` on push to main, in name order, and
records each applied file in a ledger table in D1 (`_applied_deltas`).
Applied files are never applied again, and the workflow fails loudly on
any SQL error.

## File rules

- One file per ship. Name it `YYYY-MM-DD-<slug>.sql`, for example
  `2026-11-16-iowa-hours.sql`. Name order is apply order, so the date
  prefix matters.
- Upserts only. Every statement must be safe to run against a database
  that may already hold the row: use `INSERT ... ON CONFLICT (<key>)
  DO UPDATE SET ...` or `INSERT OR REPLACE INTO ...`. Plain `INSERT`
  belongs only in the one-time baseline under `d1-import/`.
- Data only. No `CREATE`, no `DROP`, no schema changes in a delta.
  Schema changes ship as a separate, reviewed step.
- No `BEGIN`, no `COMMIT`, no `PRAGMA`. The D1 console rejects
  transaction statements, and the workflow applies each file as one
  unit; a file that errors partway stops the run and is not recorded,
  so it is retried in full on the next run. Upserts make that retry
  safe.
- Under 500 KB per file. Split a large ship into dated part files
  (`YYYY-MM-DD-<slug>-1.sql`, `-2.sql`, and so on).
- Deletes, when a ship truly removes rows, go in the same file as
  explicit `DELETE FROM <table> WHERE <key> = ...` statements keyed on
  the primary key, never unkeyed deletes.

## Conflict keys (from renderer/schema.sql)

| Table | Primary key |
|---|---|
| listings | `path` |
| similar_pros | `path, rank` |
| listing_partner_cards | `path, partner_id` |
| partner_cards | `partner_id, trade_slug` |
| towns | `state, city_slug` |
| states | `state` |
| trades | `trade_slug` |
| redirects | `from_path` |
| meta | `key` |

Example, a listing update:

```sql
INSERT INTO listings (path, trade_slug, slug, name, city, state, state_slug, city_slug, phone)
VALUES ('plumbers/example-plumbing-denver', 'plumbers', 'example-plumbing-denver', 'Example Plumbing', 'Denver', 'CO', 'colorado', 'denver', '(303) 555-0100')
ON CONFLICT (path) DO UPDATE SET phone = excluded.phone;
```

## Never edit an applied delta

Once a file is in the ledger it is history. To fix a mistake, write a
new delta with a later date that corrects the rows. Editing an applied
file changes nothing in D1, because the workflow will skip it forever.

## The baseline

The one-time baseline import lives in `d1-import/` at the repo root:
44 numbered files plus a manifest, generated from the repo at head
f2f520f8 (v5.17.1), 59,994 rows. Those files are plain `INSERT`s, not
upserts, because they load an empty database. They are applied once,
either through the D1 console by hand or by a manual run of the deploy
workflow with its `apply_baseline` input set to true. The ledger
records them the same way, under their `d1-import/` paths. Never run
the baseline twice, and never copy baseline style (plain inserts) into
this folder.
