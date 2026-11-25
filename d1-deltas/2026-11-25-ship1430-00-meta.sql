-- Ship 1430 renderer bump (2026-11-25): dataset_version flip after the functions/_renderer.mjs copy went live, so cached D1 renders re-key with the Featured spot link fix.
INSERT INTO meta (key, value) VALUES ('dataset_version', '20261125T193001Z') ON CONFLICT (key) DO UPDATE SET value = excluded.value;
