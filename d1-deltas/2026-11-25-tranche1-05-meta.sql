-- Tranche 1 delta (staged 2026-11-25, v2 publish tranche 1, Option D indexable-only per the Nov 14 2026 ruling): meta dataset_version. Applies LAST on purpose: the cache-aware
-- renderer versions every cache key with this value, so the version flips
-- only after all tranche data has applied.
INSERT INTO meta (key, value) VALUES ('dataset_version', '20261125T185121Z') ON CONFLICT (key) DO UPDATE SET value = excluded.value;
