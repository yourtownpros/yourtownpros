-- v5.69 DesignTimes test block (route A, decided Nov 22, 2026): additive
-- schema step for D1-rendered fleet topic blocks. Adds the nullable
-- topic_html column to listings; the v5.69 renderer renders it as the
-- Before you hire block when present. Same additive ALTER pattern as the
-- indexable column (Batch publish gate 2026-11-14).
ALTER TABLE listings ADD COLUMN topic_html TEXT;
