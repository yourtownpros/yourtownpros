-- YourTownPros D1 schema for the listing renderer (gate d, preview build).
-- Source brief: rankly-plan/cloudflare-migration-brief-2026-11-13.md, step 1 and risk 1.
-- Apply locally:  sqlite3 ytp.db < schema.sql        (loader does this itself)
-- Apply on D1 later: see ACCOUNT-STEPS.md (account step, not done by this build).

-- One row per listing, keyed on the full listing path (the URL is the database
-- key; paths never change). Render reads: this row by PK, one similar_pros
-- lookup, one listing_partner_cards lookup, one redirects lookup. Budget: the
-- brief caps a render at about 30 rows read; this design reads about 8.
CREATE TABLE listings (
  path          TEXT PRIMARY KEY,          -- 'plumbers/cuevas-brothers-plumbers-westminster'
  trade_slug    TEXT NOT NULL,             -- 'plumbers'
  slug          TEXT NOT NULL,             -- 'cuevas-brothers-plumbers-westminster'
  name          TEXT NOT NULL,
  city          TEXT NOT NULL,
  state         TEXT NOT NULL,             -- 'CO'
  state_slug    TEXT NOT NULL,             -- 'colorado'
  city_slug     TEXT NOT NULL,             -- 'westminster'
  phone         TEXT,                      -- display form '(970) 367-1649'
  phone_digits  TEXT,                      -- '+19703671649' for tel: and JSON-LD
  address       TEXT,                      -- street address or NULL
  website       TEXT,
  website_domain TEXT,
  email         TEXT,
  facebook      TEXT,
  rating        REAL,                      -- NULL when the listing has no rating
  rating_text   TEXT,                      -- rating exactly as printed ('5' on some, '5.0' on others)
  review_count  INTEGER,                   -- NULL when rating is NULL
  rating_source TEXT,                      -- 'Google' as labelled on the static page
  hours_json    TEXT,                      -- JSON array of 'Mon: 9 AM-6 PM' strings, or NULL
  hours_tz      TEXT,                      -- IANA tz for the open-now element, or NULL
  lat           REAL,                      -- pin coords when pinned, else town center
  lng           REAL,
  pin_source    TEXT,                      -- 'pin' or 'town_center'
  cell          INTEGER,                   -- grid cell, see bounding-box design below
  image_url     TEXT,                      -- per-listing hero/og image (rotates per trade pool)
  page_title    TEXT,                      -- harvested verbatim: <title> text
  meta_desc     TEXT,                      -- harvested verbatim: meta description content
  og_title      TEXT,                      -- harvested verbatim: og:title content
  show_website_link INTEGER NOT NULL DEFAULT 0, -- contact card carries a website link
  crumb_linked  INTEGER NOT NULL DEFAULT 1,    -- category-in-town page exists (crumb links to it)
  from_business TEXT,                          -- owner/Places description; replaces the About block
  amen_html     TEXT,                          -- harvested amen57 chips (attrs + services + since)
  services_json TEXT,                      -- from search-index.json services[]
  attrs_json    TEXT,                      -- from search-index.json attrs[]
  dnc           INTEGER NOT NULL DEFAULT 0,
  updated_at    TEXT
);

-- Bounding-box design for radius search (brief risk 1: a naive radius query
-- scans all ~117k rows and about 42 searches a day would exhaust the free
-- 5M rows-read allowance). Instead:
--   * lat/lng are indexed, and a coarse grid cell is precomputed per listing:
--     0.05 degree cells (about 5.5 km north-south). cell packs the cell row
--     and column into one integer: cell = lat_cell * 7200 + lng_cell, where
--     lat_cell = floor((lat + 90) * 20), lng_cell = floor((lng + 180) * 20).
--   * A radius query converts its bounding box to the small set of cells the
--     box overlaps (a 25 mile box overlaps at most a few hundred cells, most
--     of them empty), filters WHERE cell IN (...) AND trade matches, and runs
--     the exact haversine only on the candidate rows that come back.
--   * Rows scanned per search is therefore bounded by the listings inside the
--     box (hundreds in the densest Front Range cells), never by table size.
-- The loader computes cell; any future write path must compute it the same way.
CREATE INDEX idx_listings_cell_trade ON listings (cell, trade_slug);
CREATE INDEX idx_listings_lat ON listings (lat);
CREATE INDEX idx_listings_lng ON listings (lng);
CREATE INDEX idx_listings_town_trade ON listings (state, city_slug, trade_slug);
CREATE INDEX idx_listings_trade_state ON listings (trade_slug, state);

-- Per-trade display constants the template needs. biz-data.json carries only
-- the short trade name, so the loader harvests these from one static page per
-- trade (label, phrases, schema.org type, hero image, form placeholder).
CREATE TABLE trades (
  trade_slug    TEXT PRIMARY KEY,          -- 'cleaners'
  label         TEXT NOT NULL,             -- 'Cleaners & Laundry'
  short_name    TEXT,                      -- biz-data.json trade field, 'Cleaners'
  phrase        TEXT,                      -- 'cleaners and laundry' (about, featured, match)
  singular      TEXT,                      -- 'cleaner' (meta description 'is a cleaner in')
  schema_type   TEXT,                      -- schema.org @type, 'DryCleaningOrLaundry' etc.
  og_image      TEXT,                      -- per-trade hero / og:image URL
  service_placeholder TEXT                 -- match form example text for this trade
);

CREATE TABLE states (
  state     TEXT PRIMARY KEY,              -- 'CO'
  name      TEXT NOT NULL,                 -- 'Colorado'
  state_slug TEXT NOT NULL
);

-- Town centers from cities-index.json: the fallback coordinates for unpinned
-- listings and the distance basis for similar-pros fill.
CREATE TABLE towns (
  state     TEXT NOT NULL,
  city_slug TEXT NOT NULL,
  city      TEXT NOT NULL,
  state_slug TEXT NOT NULL,
  lat       REAL,
  lng       REAL,
  tz        TEXT,                          -- IANA tz (per-town field; state default today)
  listing_count INTEGER,
  PRIMARY KEY (state, city_slug)
);

-- Precomputed similar-pros edges, so a render never scans neighbours.
-- Rule mirrors the static rail: same trade, same town first, then nearest
-- towns until the floor is met; the loader writes at most 5 per listing.
CREATE TABLE similar_pros (
  path         TEXT NOT NULL,
  similar_path TEXT NOT NULL,
  rank         INTEGER NOT NULL,           -- 1..5, display order
  distance_mi  REAL,                       -- town-center distance; 0 within a town
  PRIMARY KEY (path, rank)
);
CREATE INDEX idx_similar_path ON similar_pros (path);

-- Partner (featured) cards. partner_cards holds the card content per partner;
-- listing_partner_cards is the eligibility join the render reads (max 1 row).
-- Card copy varies by the host listing's trade (a salon pattern and a med
-- spa pattern exist), so content is keyed per partner and trade.
CREATE TABLE partner_cards (
  partner_id   TEXT NOT NULL,              -- 'renaud-naturals'
  trade_slug   TEXT NOT NULL,
  profile_path TEXT NOT NULL,              -- 'natural-skincare/renaud-naturals-loveland'
  name         TEXT NOT NULL,
  blurb        TEXT NOT NULL,
  link_text    TEXT NOT NULL,
  active       INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (partner_id, trade_slug)
);

CREATE TABLE listing_partner_cards (
  path       TEXT NOT NULL,
  partner_id TEXT NOT NULL,
  surface    TEXT NOT NULL DEFAULT 'ytp-card-listing',
  PRIMARY KEY (path, partner_id)
);

-- True 301s for listing-level moves (brief section 5). Empty at first load;
-- the Worker checks this table before the listings lookup.
CREATE TABLE redirects (
  from_path TEXT PRIMARY KEY,
  to_path   TEXT NOT NULL,
  status    INTEGER NOT NULL DEFAULT 301
);

CREATE TABLE meta (
  key   TEXT PRIMARY KEY,
  value TEXT
);
