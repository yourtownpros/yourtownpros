-- Payload refresh schema delta (2026-11-14). Apply FIRST, before or with the
-- refreshed Worker code deploy, never after: the refreshed render queries
-- category_towns and listings.hours_checked, and a render against a database
-- without them throws. Both changes are additive only; no existing table or
-- column changes shape. Column shape copied from renderer/schema.sql
-- (refreshed, 2026-11-14). Note: the ALTER appends hours_checked as the last
-- listings column on D1; the loader's fresh-built database carries it after
-- hours_tz. Columns are addressed by name everywhere, so position differs
-- and nothing else does.
ALTER TABLE listings ADD COLUMN hours_checked TEXT;
CREATE TABLE category_towns (
  trade_slug TEXT NOT NULL,
  state_slug TEXT NOT NULL,
  city_slug  TEXT NOT NULL,
  PRIMARY KEY (trade_slug, state_slug, city_slug)
);
