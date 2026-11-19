-- v5.26 item 59 count unification: dataset_version bump to 20261119T214632Z. Re-keys D1-rendered pages onto the v5.26 renderer bundle (asset query 20261119a59 only; no listing data change). Ships after the Functions renderer copy is live on production.
INSERT INTO meta (key, value) VALUES ('dataset_version', '20261119T214632Z') ON CONFLICT (key) DO UPDATE SET value = excluded.value;
