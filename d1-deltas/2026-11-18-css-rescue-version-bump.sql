-- CSS rescue 2026-11-18: bump dataset_version so D1-rendered listings re-render
-- with the versioned asset URLs (?v=20261118c1) from commit 886f3ab59c3.
INSERT INTO meta (key, value) VALUES ('dataset_version', '20261118T185735Z') ON CONFLICT (key) DO UPDATE SET value = excluded.value;
