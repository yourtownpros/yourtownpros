-- v5.69 DesignTimes test block: dataset_version bump to 20261122T203716Z. Ships AFTER the
-- Function copy is live (production commit fd571da5fc9 verified rendering the
-- Sweet Bay Design topic block), per the standing renderer ship lesson: the
-- version flips only after the new bundle serves.
INSERT INTO meta (key, value) VALUES ('dataset_version', '20261122T203716Z') ON CONFLICT (key) DO UPDATE SET value = excluded.value;
