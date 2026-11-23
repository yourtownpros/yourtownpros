-- DesignTimes fleet blocks 2 and 3: dataset_version bump to 20261123T093302Z. Ships in
-- the same push as the content delta above it in name order and applies last,
-- re-keying rendered pages so the two new topic blocks serve fresh. The
-- renderer bundle already carries the topic_html slot from v5.69, so no
-- renderer or Function change is part of this ship.
INSERT INTO meta (key, value) VALUES ('dataset_version', '20261123T093302Z') ON CONFLICT (key) DO UPDATE SET value = excluded.value;
