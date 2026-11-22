-- v5.64 website design: meta dataset_version bump to 20261122T024553Z. Ships AFTER the
-- Function copy is live (production commit 156aebabad3 verified rendering), per the
-- standing renderer ship lesson: the version flips only after the new bundle serves.
INSERT INTO meta (key, value) VALUES ('dataset_version', '20261122T024553Z') ON CONFLICT (key) DO UPDATE SET value = excluded.value;
