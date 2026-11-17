-- City-path fix (2026-11-16), part 5: second dataset_version bump so the
-- 18 crumb_linked corrections from part 04 re-render under a fresh key
-- (same double-bump pattern as the matchfix ship).
INSERT INTO meta (key, value) VALUES ('dataset_version', '20261117T030551Z') ON CONFLICT (key) DO UPDATE SET value = excluded.value;
