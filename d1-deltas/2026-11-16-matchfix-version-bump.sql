-- Matchfix ship (2026-11-16): meta dataset_version bump so the renderer cache re-renders every D1 listing with the fixed match form template. No listing data changes.
INSERT INTO meta (key, value) VALUES ('dataset_version', '20261117T010838Z') ON CONFLICT (key) DO UPDATE SET value = excluded.value;
