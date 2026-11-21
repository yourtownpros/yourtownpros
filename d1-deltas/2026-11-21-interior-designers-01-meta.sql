-- v5.49 interior designers: meta dataset_version bump to 20261121T145708Z. Ships AFTER the
-- Function copy is live (production commit 0e13d2a417f verified rendering), per the
-- standing renderer ship lesson: the version flips only after the new bundle serves.
INSERT INTO meta (key, value) VALUES ('dataset_version', '20261121T145708Z') ON CONFLICT (key) DO UPDATE SET value = excluded.value;
