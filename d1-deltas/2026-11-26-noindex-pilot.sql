-- STAGED ONLY. DO NOT APPLY until the pilot ship is called.
-- Noindex pilot, Colorado N1 set (12 listings). Prepared Nov 26, 2026.
-- Sets the D1 indexable flag to 0 for the 12 Colorado listings that fail
-- the firm N1 leg (no resolved street address AND no website), derived
-- from tranche12-build/expected.db, not from the D1 flag itself.
-- The live renderer bundle (functions/_renderer.mjs, head function) already
-- prints <meta name="robots" content="noindex"> when indexable = 0.
-- For the 6 pilot listings served by a static file, this flag changes
-- nothing served today (the static file wins); it keeps the rendered
-- fallback consistent if a static file is ever removed. The served change
-- for those 6 comes from the static head edits in the same ship.
-- Apply through the established D1 delta route, in this order:
--   1. This UPDATE.
--   2. The meta dataset_version bump BELOW, with 20261126T185258Z
--      replaced at ship time by a fresh UTC stamp in the same format as
--      prior deltas (example 20261126T041935Z). The bump must land in the
--      same delta run, after the UPDATE: rendered pages are cached under
--      a key that includes dataset_version, so without the bump the edge
--      keeps serving the old head for up to the 30 day s-maxage window.

UPDATE listings SET indexable = 0 WHERE path IN (
  'auto-repair/moonlight-customs-del-norte',
  'bakeries-and-cafes/coffeegraph-denver',
  'bakeries-and-cafes/st-marks-coffee-house-denver',
  'barbers/edens-edge-barber-shop-and-salon-grand-junction',
  'florists/harrington-smith-floral-aspen',
  'florists/susans-flowers-and-gifts-basalt',
  'locksmiths/car-key-replacement-mobile-locksmith-denver',
  'locksmiths/cheap-and-quick-locksmith-denver',
  'locksmiths/state-wide-lock-and-safe-inc-denver',
  'locksmiths/united-expert-locksmith-denver',
  'nails/le-slay-nail-spa-elizabeth',
  'spas/two-pretty-girls-spa-fort-morgan'
);

-- Pre-apply assertion (run first, expect 12): every pilot path exists and
-- currently carries indexable = 1.
--   SELECT COUNT(*) FROM listings WHERE indexable = 1 AND path IN ( ... );
-- Post-apply assertion (expect 12):
--   SELECT COUNT(*) FROM listings WHERE indexable = 0 AND path IN ( ... );
-- Guard assertion: the four guard rows keep their exact pre-ship flag
-- values (verified in tranche12-build/expected.db on Nov 26, 2026).
-- Expect exactly these pairs back, before and after this delta runs:
--   movers/herrens-twin-city-moving-and-storage-lafayette        0
--   bars/blue-moon-country-bar-and-patio-laredo                   1
--   optometrists/billings-eyecare-associates-sanchez-ruben-c-od-billings  1
--   natural-skincare/renaud-naturals-loveland                     1
--   SELECT path, indexable FROM listings WHERE path IN (
--     'movers/herrens-twin-city-moving-and-storage-lafayette',
--     'bars/blue-moon-country-bar-and-patio-laredo',
--     'optometrists/billings-eyecare-associates-sanchez-ruben-c-od-billings',
--     'natural-skincare/renaud-naturals-loveland');

INSERT INTO meta (key, value) VALUES ('dataset_version', '20261126T211219Z')
ON CONFLICT(key) DO UPDATE SET value = excluded.value;
