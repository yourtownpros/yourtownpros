-- Tranche 5 delta (staged 2026-11-25, v2 publish tranche 5, Option D gate with Census pin first and town-center fallback): similar_pros edges computed over the union of the live set
-- and this tranche (same rule as batch 1: same trade, same town first,
-- then nearest within 10 mi, top 5), filtered to edges whose both
-- endpoints exist after this publish and that touch at least one
-- published listing. Original ranks kept.
INSERT INTO similar_pros (path, similar_path, rank, distance_mi) VALUES ('towing/eagle-wing-towing-aurora', 'towing/eagle-wing-towing-services-aurora-co-aurora', 1, 0.0) ON CONFLICT (path, rank) DO UPDATE SET similar_path = excluded.similar_path, distance_mi = excluded.distance_mi;
INSERT INTO similar_pros (path, similar_path, rank, distance_mi) VALUES ('towing/eagle-wing-towing-services-aurora-co-aurora', 'towing/eagle-wing-towing-aurora', 1, 0.0) ON CONFLICT (path, rank) DO UPDATE SET similar_path = excluded.similar_path, distance_mi = excluded.distance_mi;
INSERT INTO similar_pros (path, similar_path, rank, distance_mi) VALUES ('towing/eagle-wing-towing-services-aurora-co-aurora', 'towing/avila-towing-l-l-c-aurora', 2, 2.9) ON CONFLICT (path, rank) DO UPDATE SET similar_path = excluded.similar_path, distance_mi = excluded.distance_mi;
INSERT INTO similar_pros (path, similar_path, rank, distance_mi) VALUES ('towing/eagle-wing-towing-services-aurora-co-aurora', 'towing/aandg-towing-and-recovery-llc-aurora', 3, 4.6) ON CONFLICT (path, rank) DO UPDATE SET similar_path = excluded.similar_path, distance_mi = excluded.distance_mi;
INSERT INTO similar_pros (path, similar_path, rank, distance_mi) VALUES ('towing/eagle-wing-towing-services-aurora-co-aurora', 'towing/absolute-towing-llc-denver', 4, 6.4) ON CONFLICT (path, rank) DO UPDATE SET similar_path = excluded.similar_path, distance_mi = excluded.distance_mi;
INSERT INTO similar_pros (path, similar_path, rank, distance_mi) VALUES ('towing/eagle-wing-towing-services-aurora-co-aurora', 'towing/blue-diamond-towing-inc-commerce-city', 5, 6.4) ON CONFLICT (path, rank) DO UPDATE SET similar_path = excluded.similar_path, distance_mi = excluded.distance_mi;
