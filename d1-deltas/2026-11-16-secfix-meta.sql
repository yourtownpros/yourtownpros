-- Secfix ship (2026-11-16), meta part: dataset_version bump so D1-rendered
-- listings re-render under a fresh cache key with the security-hardened
-- template (Turnstile shell tag, esc upgrades, outbound rel) after the
-- Pages Function renderer copy went live in 7bcac1b19d.
INSERT INTO meta (key, value) VALUES ('dataset_version', '20261117T040412Z') ON CONFLICT (key) DO UPDATE SET value = excluded.value;
