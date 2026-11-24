INSERT INTO meta (key, value) VALUES ('dataset_version', '20261124T214554Z') ON CONFLICT (key) DO UPDATE SET value = excluded.value;
