-- Recrawl pin lifts delta (2026-11-15): fresh Census batch geocode pass on the
-- 62 staged recrawl pin-lift addresses matched 1 (Grin Dentistry PC, Fishers IN,
-- the one address genuinely new to us). This file promotes that listing: Census
-- pin (lat, lng, pin_source, cell) and indexable = 1, per the Option D
-- re-evaluation in rankly-plan/recrawl-ship-staging-2026-11-15.md. The other 61
-- staged addresses returned Census No_Match again and do not ship; they fall
-- back to the enrichment queue. Provenance: recrawl-2026-11-15, carried in
-- updated_at on the row (the column is unused by the renderer) and here.
INSERT INTO listings (path, trade_slug, slug, name, city, state, state_slug, city_slug, lat, lng, pin_source, cell, indexable, updated_at) VALUES ('dentists/grin-dentistry-pc-fishers', 'dentists', 'grin-dentistry-pc-fishers', 'Grin Dentistry PC', 'Fishers', 'IN', 'indiana', 'fishers', 39.935986188729, -86.013821481581, 'pin', 18707479, 1, 'recrawl-2026-11-15') ON CONFLICT (path) DO UPDATE SET lat = excluded.lat, lng = excluded.lng, pin_source = excluded.pin_source, cell = excluded.cell, indexable = excluded.indexable, updated_at = excluded.updated_at;
