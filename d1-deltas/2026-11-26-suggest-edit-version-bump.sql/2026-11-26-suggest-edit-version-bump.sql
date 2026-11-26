-- Suggest-an-edit widget fix: meta dataset_version bump, applied after the fixed functions/_renderer.mjs is live in production.
INSERT INTO meta (key, value) VALUES ('dataset_version', '20261126T212157Z') ON CONFLICT (key) DO UPDATE SET value = excluded.value;
