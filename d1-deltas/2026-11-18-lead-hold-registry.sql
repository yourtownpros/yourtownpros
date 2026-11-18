-- Lead hold registry (the kill switch), entry 1: Auntie Jen's Pet Grooming.
-- Trigger: the business declined Rankly website services on a call
-- (owner order, Nov 18, 2026). Demotion is data, never a code change.
--
-- The registry is the single source for the DEMOTED class: the renderer
-- reads meta['lead_hold'] at render time, and the search page HOLD57 map
-- plus the generator hold set are produced from the same list. To hold
-- another business, add its path to this JSON array in a new dated
-- delta. To restore a business, ship a new dated delta with its path
-- removed from the array. Never edit an applied delta.
INSERT INTO meta (key, value)
VALUES ('lead_hold', '["pet-grooming/auntie-jens-pet-grooming-lakewood"]')
ON CONFLICT (key) DO UPDATE SET value = excluded.value;

-- Take the held listing out of every D1 Similar pros rail, so she is
-- not surfaced on competitors' pages either. Keyed on the target path:
-- this deletes exactly the rows that point at her listing, and nothing
-- else. Her own rail (competitors shown on her page) is untouched.
-- Before applying, export the rows this deletes
--   SELECT * FROM similar_pros WHERE similar_path = 'pet-grooming/auntie-jens-pet-grooming-lakewood';
-- and file the export in the ship note, so a restoration can re-insert
-- them with a later dated delta instead of waiting for a similar rebuild.
DELETE FROM similar_pros WHERE similar_path = 'pet-grooming/auntie-jens-pet-grooming-lakewood';
