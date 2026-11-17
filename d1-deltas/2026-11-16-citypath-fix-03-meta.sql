-- City-path fix (2026-11-16), part 3: dataset_version bump so rendered
-- pages re-key under the corrected data (renderer cache is keyed on
-- dataset_version). Applies after parts 01 and 02 in name order.
INSERT INTO meta (key, value) VALUES ('dataset_version', '20261117T025429Z') ON CONFLICT (key) DO UPDATE SET value = excluded.value;
