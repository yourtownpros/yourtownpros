-- FORMS/PAGES ship (Nov 18, 2026): Renaud relevance tightening on
-- D1-rendered listings. Removes the Renaud partner-card mapping
-- for hair-salons and nails listings, mirroring the static-tree
-- removal under the tightened relevance config (hair-salons and
-- nails moved to unrelated). Med-spas and spas mappings stay.
DELETE FROM listing_partner_cards
WHERE partner_id = 'renaud-naturals'
  AND path IN (SELECT path FROM listings
               WHERE trade_slug IN ('hair-salons', 'nails'));
