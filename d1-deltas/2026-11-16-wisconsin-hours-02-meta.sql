-- Wisconsin hours delta (2026-11-16): dataset_version bump, so the version
-- flips only after all data deltas above have applied. Regenerated at push time.
INSERT INTO meta (key, value) VALUES ('dataset_version', '20261117T014814Z') ON CONFLICT (key) DO UPDATE SET value = excluded.value;
