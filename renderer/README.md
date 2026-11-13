# Listing renderer, preview build (gate d, started early)

One Worker template rendering listing pages from D1, at the same URLs, per
`rankly-plan/cloudflare-migration-brief-2026-11-13.md`. Nothing here is
deployed. Listings stay static until the renderer proves out in shadow mode.

## Files

- `schema.sql` — D1 schema: listings (keyed on full path), trades, states,
  towns, similar_pros (precomputed edges), partner_cards (per partner and
  trade), listing_partner_cards, redirects, meta.
- `load.py` — builds `ytp.db` (SQLite, same schema) from the repo data files.
  Re-runnable, prints counts against the sources.
- `build-template.py` — extracts `template.mjs` (the static shell with slot
  tokens, the open-now script, the Renaud tracking script) from reference
  pages. Re-run after any static template version ships.
- `render.mjs` — the renderer. Pure over a D1-shaped db interface; reads
  about 10 rows per render (brief budget: 30).
- `worker.mjs` — the Cloudflare entry: redirect lookup, path shape check,
  pass-through for anything not a known listing, page headers.
- `local-db.mjs` — the same db interface over node:sqlite for local runs.
- `shadow-diff.mjs` — renders a stratified Colorado sample and byte-diffs
  against the static files; names the differing elements per page.
- `radius-demo.mjs` — proof of the bounding-box design (below).
- `ACCOUNT-STEPS.md` — the Cloudflare account steps for go-live, one line
  each, none performed by this build.
- `shadow-report.md` — the latest shadow-diff output.

## Run it

```
python3 build-template.py        # only after a static shell change
python3 load.py                  # rebuild ytp.db (about 70 seconds)
node shadow-diff.mjs             # 50-page Colorado sample diff
node radius-demo.mjs             # bounding-box proof
```

## Bounding-box design (brief risk 1)

Listings carry lat/lng (pin coordinates when pinned, town center otherwise)
plus a precomputed 0.05 degree grid `cell`. Radius search converts its box
to the overlapping cells and filters on the `(cell, trade_slug)` index, then
runs exact distances on the candidates only. Proof on today's data
(`radius-demo.mjs`): a 10 mile plumbers search at Westminster reads 31
candidate rows of 10,529 (query plan: SEARCH on idx_listings_cell_trade);
a 25 mile hair-salons search at Denver reads 190. The naive alternative
scans the whole table per search and dies at scale; this one scales with
density inside the box, not with table size.

## Loader sources, honestly

biz-data.json is the spine (name, trade, city, state, phone, address,
website) and verify-data.json, search-index.json, cities-index.json join by
path. Rating, review count, hours, pin coordinates, the per-listing hero
image, the printed title/description/og:title, the website-link flag, the
breadcrumb-link flag, the owner "From this business" copy, the amenity
chips, and the similar-pros rail exist only inside the static pages, so the
loader harvests them mechanically from each listing's own page. Two
consequences worth knowing:

- The similar-pros rail is harvested as printed, not computed, because the
  rails were written by different build versions over mixed-era datasets
  and no rule over today's data reproduces them. When data versions move
  to D1, edges get computed by the current People Also Viewed rule.
- The printed rating string is per-listing data (`5` on some pages, `5.0`
  on others), stored as `rating_text` and emitted verbatim.

## Shadow result at this commit

50 Colorado listings (all 31 trades, rated and unrated, pinned and
town-center, with and without hours, cards, and enrichment): **48 byte
identical**. The 2 differing pages are the hand-built profiles
(natural-skincare/renaud-naturals-loveland and
website-design/rankly-design-westminster), which were never on the standard
template and will need their own templates before cutover. Local render
time averaged about 7 ms per page in Node on this VM; that is not a
Workers CPU measurement. The brief's p95 7 ms gate gets its real reading
in shadow mode on the deployed Worker (step 4), and cutover does not
proceed above it.

## Known gaps before cutover

- The two profile pages above need their own templates.
- Trades natural-skincare and website-design have no match form or
  featured slot on their static pages, so the trades table has no phrase,
  singular, or placeholder for them; the standard template cannot render
  their listings (there is exactly one listing in website-design).
- New listings in a future data version need their harvested fields
  (rail, title, description, image) supplied by the version's generator;
  the loader's harvest only covers pages that exist statically today.
- Response headers, fail-open routes, and the crawler access check are
  account-side and listed in ACCOUNT-STEPS.md.
