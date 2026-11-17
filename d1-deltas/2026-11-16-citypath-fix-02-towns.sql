-- City-path fix (2026-11-16), part 2: towns and category_towns.
-- The same intake defect created four suffixed towns rows (city_slug
-- 'pensacola-fl' etc., city 'Pensacola, FL') and 28 suffixed category_towns
-- rows. Clean towns rows already exist for Pensacola, Harrisburg and
-- High Point: their listing_count is recomputed after the part 1 fix and
-- the suffixed rows are deleted by primary key. Albany NY has no clean
-- towns row, so the clean row is inserted from the suffixed row's own
-- coordinates before the suffixed row is deleted. category_towns suffixed
-- rows are re-keyed to the clean slug (dedupe on the primary key), then
-- deleted by full primary key.

DELETE FROM towns WHERE state = 'FL' AND city_slug = 'pensacola-fl';
DELETE FROM towns WHERE state = 'PA' AND city_slug = 'harrisburg-pa';
DELETE FROM towns WHERE state = 'NY' AND city_slug = 'albany-ny';
DELETE FROM towns WHERE state = 'NC' AND city_slug = 'high-point-nc';
INSERT INTO towns (state, city_slug, city, state_slug, lat, lng, tz, listing_count) VALUES ('FL', 'pensacola', 'Pensacola', 'florida', 30.461055, -87.216503, NULL, 22) ON CONFLICT (state, city_slug) DO UPDATE SET listing_count = excluded.listing_count;
INSERT INTO towns (state, city_slug, city, state_slug, lat, lng, tz, listing_count) VALUES ('PA', 'harrisburg', 'Harrisburg', 'pennsylvania', 40.308162, -76.845529, NULL, 16) ON CONFLICT (state, city_slug) DO UPDATE SET listing_count = excluded.listing_count;
INSERT INTO towns (state, city_slug, city, state_slug, lat, lng, tz, listing_count) VALUES ('NY', 'albany', 'Albany', 'new-york', 42.655523, -73.764613, NULL, 9) ON CONFLICT (state, city_slug) DO UPDATE SET listing_count = excluded.listing_count;
INSERT INTO towns (state, city_slug, city, state_slug, lat, lng, tz, listing_count) VALUES ('NC', 'high-point', 'High Point', 'north-carolina', 36.035208, -79.965794, NULL, 8) ON CONFLICT (state, city_slug) DO UPDATE SET listing_count = excluded.listing_count;

INSERT INTO category_towns (trade_slug, state_slug, city_slug) VALUES ('bakeries-and-cafes', 'florida', 'pensacola') ON CONFLICT (trade_slug, state_slug, city_slug) DO NOTHING;
INSERT INTO category_towns (trade_slug, state_slug, city_slug) VALUES ('bars', 'florida', 'pensacola') ON CONFLICT (trade_slug, state_slug, city_slug) DO NOTHING;
INSERT INTO category_towns (trade_slug, state_slug, city_slug) VALUES ('dentists', 'florida', 'pensacola') ON CONFLICT (trade_slug, state_slug, city_slug) DO NOTHING;
INSERT INTO category_towns (trade_slug, state_slug, city_slug) VALUES ('fitness', 'florida', 'pensacola') ON CONFLICT (trade_slug, state_slug, city_slug) DO NOTHING;
INSERT INTO category_towns (trade_slug, state_slug, city_slug) VALUES ('hair-salons', 'florida', 'pensacola') ON CONFLICT (trade_slug, state_slug, city_slug) DO NOTHING;
INSERT INTO category_towns (trade_slug, state_slug, city_slug) VALUES ('jewelry', 'florida', 'pensacola') ON CONFLICT (trade_slug, state_slug, city_slug) DO NOTHING;
INSERT INTO category_towns (trade_slug, state_slug, city_slug) VALUES ('locksmiths', 'florida', 'pensacola') ON CONFLICT (trade_slug, state_slug, city_slug) DO NOTHING;
INSERT INTO category_towns (trade_slug, state_slug, city_slug) VALUES ('tattoo', 'florida', 'pensacola') ON CONFLICT (trade_slug, state_slug, city_slug) DO NOTHING;
INSERT INTO category_towns (trade_slug, state_slug, city_slug) VALUES ('veterinary', 'florida', 'pensacola') ON CONFLICT (trade_slug, state_slug, city_slug) DO NOTHING;
INSERT INTO category_towns (trade_slug, state_slug, city_slug) VALUES ('bakeries-and-cafes', 'pennsylvania', 'harrisburg') ON CONFLICT (trade_slug, state_slug, city_slug) DO NOTHING;
INSERT INTO category_towns (trade_slug, state_slug, city_slug) VALUES ('bars', 'pennsylvania', 'harrisburg') ON CONFLICT (trade_slug, state_slug, city_slug) DO NOTHING;
INSERT INTO category_towns (trade_slug, state_slug, city_slug) VALUES ('bookstores', 'pennsylvania', 'harrisburg') ON CONFLICT (trade_slug, state_slug, city_slug) DO NOTHING;
INSERT INTO category_towns (trade_slug, state_slug, city_slug) VALUES ('fitness', 'pennsylvania', 'harrisburg') ON CONFLICT (trade_slug, state_slug, city_slug) DO NOTHING;
INSERT INTO category_towns (trade_slug, state_slug, city_slug) VALUES ('spas', 'pennsylvania', 'harrisburg') ON CONFLICT (trade_slug, state_slug, city_slug) DO NOTHING;
INSERT INTO category_towns (trade_slug, state_slug, city_slug) VALUES ('tattoo', 'pennsylvania', 'harrisburg') ON CONFLICT (trade_slug, state_slug, city_slug) DO NOTHING;
INSERT INTO category_towns (trade_slug, state_slug, city_slug) VALUES ('veterinary', 'pennsylvania', 'harrisburg') ON CONFLICT (trade_slug, state_slug, city_slug) DO NOTHING;
INSERT INTO category_towns (trade_slug, state_slug, city_slug) VALUES ('bookstores', 'new-york', 'albany') ON CONFLICT (trade_slug, state_slug, city_slug) DO NOTHING;
INSERT INTO category_towns (trade_slug, state_slug, city_slug) VALUES ('chiropractors', 'new-york', 'albany') ON CONFLICT (trade_slug, state_slug, city_slug) DO NOTHING;
INSERT INTO category_towns (trade_slug, state_slug, city_slug) VALUES ('cleaners', 'new-york', 'albany') ON CONFLICT (trade_slug, state_slug, city_slug) DO NOTHING;
INSERT INTO category_towns (trade_slug, state_slug, city_slug) VALUES ('fitness', 'new-york', 'albany') ON CONFLICT (trade_slug, state_slug, city_slug) DO NOTHING;
INSERT INTO category_towns (trade_slug, state_slug, city_slug) VALUES ('hair-salons', 'new-york', 'albany') ON CONFLICT (trade_slug, state_slug, city_slug) DO NOTHING;
INSERT INTO category_towns (trade_slug, state_slug, city_slug) VALUES ('pest-control', 'new-york', 'albany') ON CONFLICT (trade_slug, state_slug, city_slug) DO NOTHING;
INSERT INTO category_towns (trade_slug, state_slug, city_slug) VALUES ('bars', 'north-carolina', 'high-point') ON CONFLICT (trade_slug, state_slug, city_slug) DO NOTHING;
INSERT INTO category_towns (trade_slug, state_slug, city_slug) VALUES ('dentists', 'north-carolina', 'high-point') ON CONFLICT (trade_slug, state_slug, city_slug) DO NOTHING;
INSERT INTO category_towns (trade_slug, state_slug, city_slug) VALUES ('hvac', 'north-carolina', 'high-point') ON CONFLICT (trade_slug, state_slug, city_slug) DO NOTHING;
INSERT INTO category_towns (trade_slug, state_slug, city_slug) VALUES ('nails', 'north-carolina', 'high-point') ON CONFLICT (trade_slug, state_slug, city_slug) DO NOTHING;
INSERT INTO category_towns (trade_slug, state_slug, city_slug) VALUES ('tanning', 'north-carolina', 'high-point') ON CONFLICT (trade_slug, state_slug, city_slug) DO NOTHING;
INSERT INTO category_towns (trade_slug, state_slug, city_slug) VALUES ('veterinary', 'north-carolina', 'high-point') ON CONFLICT (trade_slug, state_slug, city_slug) DO NOTHING;
DELETE FROM category_towns WHERE trade_slug = 'bakeries-and-cafes' AND state_slug = 'florida' AND city_slug = 'pensacola-fl';
DELETE FROM category_towns WHERE trade_slug = 'bars' AND state_slug = 'florida' AND city_slug = 'pensacola-fl';
DELETE FROM category_towns WHERE trade_slug = 'dentists' AND state_slug = 'florida' AND city_slug = 'pensacola-fl';
DELETE FROM category_towns WHERE trade_slug = 'fitness' AND state_slug = 'florida' AND city_slug = 'pensacola-fl';
DELETE FROM category_towns WHERE trade_slug = 'hair-salons' AND state_slug = 'florida' AND city_slug = 'pensacola-fl';
DELETE FROM category_towns WHERE trade_slug = 'jewelry' AND state_slug = 'florida' AND city_slug = 'pensacola-fl';
DELETE FROM category_towns WHERE trade_slug = 'locksmiths' AND state_slug = 'florida' AND city_slug = 'pensacola-fl';
DELETE FROM category_towns WHERE trade_slug = 'tattoo' AND state_slug = 'florida' AND city_slug = 'pensacola-fl';
DELETE FROM category_towns WHERE trade_slug = 'veterinary' AND state_slug = 'florida' AND city_slug = 'pensacola-fl';
DELETE FROM category_towns WHERE trade_slug = 'bakeries-and-cafes' AND state_slug = 'pennsylvania' AND city_slug = 'harrisburg-pa';
DELETE FROM category_towns WHERE trade_slug = 'bars' AND state_slug = 'pennsylvania' AND city_slug = 'harrisburg-pa';
DELETE FROM category_towns WHERE trade_slug = 'bookstores' AND state_slug = 'pennsylvania' AND city_slug = 'harrisburg-pa';
DELETE FROM category_towns WHERE trade_slug = 'fitness' AND state_slug = 'pennsylvania' AND city_slug = 'harrisburg-pa';
DELETE FROM category_towns WHERE trade_slug = 'spas' AND state_slug = 'pennsylvania' AND city_slug = 'harrisburg-pa';
DELETE FROM category_towns WHERE trade_slug = 'tattoo' AND state_slug = 'pennsylvania' AND city_slug = 'harrisburg-pa';
DELETE FROM category_towns WHERE trade_slug = 'veterinary' AND state_slug = 'pennsylvania' AND city_slug = 'harrisburg-pa';
DELETE FROM category_towns WHERE trade_slug = 'bookstores' AND state_slug = 'new-york' AND city_slug = 'albany-ny';
DELETE FROM category_towns WHERE trade_slug = 'chiropractors' AND state_slug = 'new-york' AND city_slug = 'albany-ny';
DELETE FROM category_towns WHERE trade_slug = 'cleaners' AND state_slug = 'new-york' AND city_slug = 'albany-ny';
DELETE FROM category_towns WHERE trade_slug = 'fitness' AND state_slug = 'new-york' AND city_slug = 'albany-ny';
DELETE FROM category_towns WHERE trade_slug = 'hair-salons' AND state_slug = 'new-york' AND city_slug = 'albany-ny';
DELETE FROM category_towns WHERE trade_slug = 'pest-control' AND state_slug = 'new-york' AND city_slug = 'albany-ny';
DELETE FROM category_towns WHERE trade_slug = 'bars' AND state_slug = 'north-carolina' AND city_slug = 'high-point-nc';
DELETE FROM category_towns WHERE trade_slug = 'dentists' AND state_slug = 'north-carolina' AND city_slug = 'high-point-nc';
DELETE FROM category_towns WHERE trade_slug = 'hvac' AND state_slug = 'north-carolina' AND city_slug = 'high-point-nc';
DELETE FROM category_towns WHERE trade_slug = 'nails' AND state_slug = 'north-carolina' AND city_slug = 'high-point-nc';
DELETE FROM category_towns WHERE trade_slug = 'tanning' AND state_slug = 'north-carolina' AND city_slug = 'high-point-nc';
DELETE FROM category_towns WHERE trade_slug = 'veterinary' AND state_slug = 'north-carolina' AND city_slug = 'high-point-nc';
