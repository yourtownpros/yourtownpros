-- v5.47 item 83 ranking overview: dataset_version bump to 20261120T165823Z. Re-keys D1-rendered pages onto the renderer bundle whose listing footer also links /how-pros-rank/. Ships after the Functions renderer copy is live on production (main ba7cc9d14d7).
INSERT INTO meta (key, value) VALUES ('dataset_version', '20261120T165823Z') ON CONFLICT (key) DO UPDATE SET value = excluded.value;
