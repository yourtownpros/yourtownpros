-- Denver 5 category pages crumb restore: dataset_version bump so cached
-- renders re-key onto the linked breadcrumbs. Applies last.
INSERT INTO meta (key, value) VALUES ('dataset_version', '20261123T043622Z') ON CONFLICT (key) DO UPDATE SET value = excluded.value;
