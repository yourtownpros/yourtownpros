-- v5.50 hotels and lodging: meta dataset_version bump to 20261121T152235Z. Ships AFTER the
-- Function copy is live (production commit b03e07c6fdc verified rendering), per the
-- standing renderer ship lesson: the version flips only after the new bundle serves.
INSERT INTO meta (key, value) VALUES ('dataset_version', '20261121T152235Z') ON CONFLICT (key) DO UPDATE SET value = excluded.value;
