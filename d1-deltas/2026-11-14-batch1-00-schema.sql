-- Batch 1 delta (2026-11-14): schema. Applies FIRST in the batch-1 set.
-- Adds listings.indexable (the quality-gate flag): 1 = indexable,
-- 0 = serves with a noindex robots meta and no sitemap entry. Existing
-- rows default to 1, so no live page changes. The renderer patch that
-- reads the flag treats an absent column as indexable, so this file is
-- safe before or after the code deploy. Additive only.
ALTER TABLE listings ADD COLUMN indexable INTEGER NOT NULL DEFAULT 1;
