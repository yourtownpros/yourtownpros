-- Colorado 432 tranche 1 (Denver) sheet-sourced promotions publish delta (staged 2026-11-22): towns rows for the towns this
-- publish touches. New towns carry listing_count = the listings this
-- set publishes there; existing towns carry the absolute recomputed
-- count (live count plus this set's listings in the town).
INSERT INTO towns (state, city_slug, city, state_slug, lat, lng, tz, listing_count) VALUES ('CO', 'denver', 'Denver', 'colorado', 39.73915, -104.9847, 'America/Denver', 269) ON CONFLICT (state, city_slug) DO UPDATE SET city = excluded.city, state_slug = excluded.state_slug, lat = excluded.lat, lng = excluded.lng, tz = excluded.tz, listing_count = excluded.listing_count;
