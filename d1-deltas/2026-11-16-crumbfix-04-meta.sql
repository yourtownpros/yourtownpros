-- Crumb fix (2026-11-16), meta part: dataset_version bump so the corrected
-- listings re-render under a fresh cache key after the data deltas apply.
INSERT INTO meta (key, value) VALUES ('dataset_version', '20261117T031930Z') ON CONFLICT (key) DO UPDATE SET value = excluded.value;
