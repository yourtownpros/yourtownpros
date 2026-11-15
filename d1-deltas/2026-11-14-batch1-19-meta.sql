-- Batch 1 delta (2026-11-14): meta dataset_version. Applies LAST on
-- purpose: the cache-aware Worker versions every cache key with this
-- value, so the version flips only after all batch data has applied.
INSERT INTO meta (key, value) VALUES ('dataset_version', '20261115T040606Z') ON CONFLICT (key) DO UPDATE SET value = excluded.value;
