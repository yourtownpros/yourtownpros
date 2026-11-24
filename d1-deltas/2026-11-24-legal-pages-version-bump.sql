-- Legal pages ship v5.76 (2026-11-24): meta dataset_version bump. The legal
-- pages package changed the D1 renderer bundle (footer Legal links), which is
-- a template-only change with no listing data change, so this upsert flips
-- the renderer cache version after the new Function copy is live on
-- production, re-keying cached listing renders to the new footer.
INSERT INTO meta (key, value) VALUES ('dataset_version', '20261124T184055Z') ON CONFLICT (key) DO UPDATE SET value = excluded.value;
