-- Item 89 (v5.48) architects: meta dataset_version bump to 20261121T112431Z. Ships AFTER the
-- Function copy is live (production commit f60969fa911 verified rendering), per the
-- standing renderer ship lesson: the version flips only after the new bundle serves.
INSERT INTO meta (key, value) VALUES ('dataset_version', '20261121T112431Z') ON CONFLICT (key) DO UPDATE SET value = excluded.value;
