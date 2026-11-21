-- v5.51 home builders: meta dataset_version bump to 20261121T155107Z. Ships AFTER the
-- Function copy is live (production commit 486594c4ab0 verified rendering), per the
-- standing renderer ship lesson: the version flips only after the new bundle serves.
INSERT INTO meta (key, value) VALUES ('dataset_version', '20261121T155107Z') ON CONFLICT (key) DO UPDATE SET value = excluded.value;
