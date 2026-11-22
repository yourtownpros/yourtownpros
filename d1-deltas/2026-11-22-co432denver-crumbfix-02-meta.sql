-- Colorado 432 tranche 1 (Denver) crumb fix: dataset_version bump so
-- cached renders re-key onto the un-linked breadcrumbs. Applies last.
INSERT INTO meta (key, value) VALUES ('dataset_version', '20261122T225714Z') ON CONFLICT (key) DO UPDATE SET value = excluded.value;
