INSERT INTO meta (key, value) VALUES ('dataset_version', '20261119T022853Z') ON CONFLICT (key) DO UPDATE SET value = excluded.value;
