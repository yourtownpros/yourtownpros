-- Recrawl pin lifts delta (2026-11-15): meta dataset_version. Applies LAST on
-- purpose: the cache-aware Worker versions every cache key with this value,
-- so the version flips only after all data deltas above have applied.
INSERT INTO meta (key, value) VALUES ('dataset_version', '20261115T171933Z') ON CONFLICT (key) DO UPDATE SET value = excluded.value;
