-- Places promotions publish delta (staged 2026-11-16): meta dataset_version. Applies LAST
-- on purpose: the cache-aware Worker versions every cache key with
-- this value, so the version flips only after all data has applied.
INSERT INTO meta (key, value) VALUES ('dataset_version', '20261117T020617Z') ON CONFLICT (key) DO UPDATE SET value = excluded.value;
