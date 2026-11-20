-- v5.29 item 62 card and profile polish: dataset_version bump to 20261120T051518Z. Re-keys D1-rendered pages onto the v5.29 renderer bundle (asset query 20261119a62 only; no listing data change). Ships after the Functions renderer copy is live on production.
INSERT INTO meta (key, value) VALUES ('dataset_version', '20261120T051518Z') ON CONFLICT (key) DO UPDATE SET value = excluded.value;
