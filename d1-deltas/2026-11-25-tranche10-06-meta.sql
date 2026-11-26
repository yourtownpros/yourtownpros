-- Tranche 10 delta (staged 2026-11-25, v2 publish tranche 10, Option D gate with Census pin first and town-center fallback): meta dataset_version. Applies LAST on purpose: the cache-aware
-- renderer versions every cache key with this value, so the version flips
-- only after all tranche data has applied.
INSERT INTO meta (key, value) VALUES ('dataset_version', '20261126T040234Z') ON CONFLICT (key) DO UPDATE SET value = excluded.value;
