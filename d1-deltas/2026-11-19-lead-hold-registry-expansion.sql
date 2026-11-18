-- Lead hold registry (the kill switch), expansion batch: 18 more businesses.
-- Trigger: owner order, Nov 18, 2026: every Rankly prospect marked
-- "not interested" or "do not call" gets the full hold treatment.
-- Source manifest: rankly-plan/kill-switch-expansion-manifest-2026-11-18.md
-- (Rankly Prospect Tracker, Call Sheet "Call result" column, full scan).
-- Demotion is data, never a code change. This delta rewrites
-- meta['lead_hold'] with the full registry (entry 1 plus the 18 below),
-- so it is idempotent and self-contained, per the registry convention.
-- All 18 entries are level "full" in lead-hold-registry.json.
INSERT INTO meta (key, value)
VALUES ('lead_hold', '["pet-grooming/auntie-jens-pet-grooming-lakewood","jewelry/king-brothers-jewelers-thornton","massage/coco-massage-englewood","florists/floreria-flor-de-luna-federal-heights","painting/super-painting-lafayette","cleaners/mayfair-cleaners-centennial","handyman/centennial-ignition-switch-repair-and-replacement-centennial","bakeries-and-cafes/gargaros-italian-bakery-arvada","veterinary/aspen-park-vet-hospital-conifer","auto-repair/t-and-f-motorsports-hudson","barbers/city-barber-shop-and-color-parlor-brush","hair-salons/la-boheme-salon-and-boutique-alamosa","tattoo/sacred-pain-san-juan","plumbers/american-plumbing-and-heating-casper","auto-repair/cheyenne-auto-repair-and-services-cheyenne","tattoo/electric-tattoo-longmont","auto-repair/wheat-ridge-auto-service-wheat-ridge","pet-grooming/arks-pet-grooming-englewood","pet-grooming/the-hydrant-boulder"]')
ON CONFLICT (key) DO UPDATE SET value = excluded.value;

-- Take each held listing out of every D1 Similar pros rail, so none of
-- them is surfaced on other listings' pages either. Keyed on the target
-- path, as in the entry 1 delta: this deletes exactly the rows pointing
-- at these listings, and nothing else. Their own rails (the single
-- competitor shown on each held page) are untouched.
-- Before applying, export the rows these deletes remove
--   SELECT * FROM similar_pros WHERE similar_path IN ('jewelry/king-brothers-jewelers-thornton','massage/coco-massage-englewood','florists/floreria-flor-de-luna-federal-heights','painting/super-painting-lafayette','cleaners/mayfair-cleaners-centennial','handyman/centennial-ignition-switch-repair-and-replacement-centennial','bakeries-and-cafes/gargaros-italian-bakery-arvada','veterinary/aspen-park-vet-hospital-conifer','auto-repair/t-and-f-motorsports-hudson','barbers/city-barber-shop-and-color-parlor-brush','hair-salons/la-boheme-salon-and-boutique-alamosa','tattoo/sacred-pain-san-juan','plumbers/american-plumbing-and-heating-casper','auto-repair/cheyenne-auto-repair-and-services-cheyenne','tattoo/electric-tattoo-longmont','auto-repair/wheat-ridge-auto-service-wheat-ridge','pet-grooming/arks-pet-grooming-englewood','pet-grooming/the-hydrant-boulder');
-- and file the export in the ship note, so a restoration can re-insert
-- them with a later dated delta instead of waiting for a similar rebuild.
DELETE FROM similar_pros WHERE similar_path IN ('jewelry/king-brothers-jewelers-thornton','massage/coco-massage-englewood','florists/floreria-flor-de-luna-federal-heights','painting/super-painting-lafayette','cleaners/mayfair-cleaners-centennial','handyman/centennial-ignition-switch-repair-and-replacement-centennial','bakeries-and-cafes/gargaros-italian-bakery-arvada','veterinary/aspen-park-vet-hospital-conifer','auto-repair/t-and-f-motorsports-hudson','barbers/city-barber-shop-and-color-parlor-brush','hair-salons/la-boheme-salon-and-boutique-alamosa','tattoo/sacred-pain-san-juan','plumbers/american-plumbing-and-heating-casper','auto-repair/cheyenne-auto-repair-and-services-cheyenne','tattoo/electric-tattoo-longmont','auto-repair/wheat-ridge-auto-service-wheat-ridge','pet-grooming/arks-pet-grooming-englewood','pet-grooming/the-hydrant-boulder');
