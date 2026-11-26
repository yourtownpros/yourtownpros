-- Tranche 9 delta (staged 2026-11-25, v2 publish tranche 9, Option D gate with Census pin first and town-center fallback): category_towns rows for the new town plus trade pairs at
-- least one published listing sits in (the roster refresh builds these
-- category pages right behind the tranche).
INSERT INTO category_towns (trade_slug, state_slug, city_slug) VALUES ('architects', 'texas', 'austin') ON CONFLICT (trade_slug, state_slug, city_slug) DO NOTHING;
INSERT INTO category_towns (trade_slug, state_slug, city_slug) VALUES ('architects', 'texas', 'houston') ON CONFLICT (trade_slug, state_slug, city_slug) DO NOTHING;
INSERT INTO category_towns (trade_slug, state_slug, city_slug) VALUES ('bakeries-and-cafes', 'new-york', 'auburn') ON CONFLICT (trade_slug, state_slug, city_slug) DO NOTHING;
INSERT INTO category_towns (trade_slug, state_slug, city_slug) VALUES ('bakeries-and-cafes', 'new-york', 'buffalo') ON CONFLICT (trade_slug, state_slug, city_slug) DO NOTHING;
INSERT INTO category_towns (trade_slug, state_slug, city_slug) VALUES ('bakeries-and-cafes', 'pennsylvania', 'easton') ON CONFLICT (trade_slug, state_slug, city_slug) DO NOTHING;
INSERT INTO category_towns (trade_slug, state_slug, city_slug) VALUES ('bakeries-and-cafes', 'virginia', 'alexandria') ON CONFLICT (trade_slug, state_slug, city_slug) DO NOTHING;
INSERT INTO category_towns (trade_slug, state_slug, city_slug) VALUES ('florists', 'pennsylvania', 'allentown') ON CONFLICT (trade_slug, state_slug, city_slug) DO NOTHING;
INSERT INTO category_towns (trade_slug, state_slug, city_slug) VALUES ('florists', 'pennsylvania', 'easton') ON CONFLICT (trade_slug, state_slug, city_slug) DO NOTHING;
INSERT INTO category_towns (trade_slug, state_slug, city_slug) VALUES ('hair-salons', 'florida', 'orange-park') ON CONFLICT (trade_slug, state_slug, city_slug) DO NOTHING;
INSERT INTO category_towns (trade_slug, state_slug, city_slug) VALUES ('hair-salons', 'florida', 'sunny-isles-beach') ON CONFLICT (trade_slug, state_slug, city_slug) DO NOTHING;
INSERT INTO category_towns (trade_slug, state_slug, city_slug) VALUES ('hair-salons', 'texas', 'harker-heights') ON CONFLICT (trade_slug, state_slug, city_slug) DO NOTHING;
INSERT INTO category_towns (trade_slug, state_slug, city_slug) VALUES ('hair-salons', 'texas', 'keller') ON CONFLICT (trade_slug, state_slug, city_slug) DO NOTHING;
INSERT INTO category_towns (trade_slug, state_slug, city_slug) VALUES ('hvac', 'colorado', 'pueblo-west') ON CONFLICT (trade_slug, state_slug, city_slug) DO NOTHING;
INSERT INTO category_towns (trade_slug, state_slug, city_slug) VALUES ('interior-designers', 'colorado', 'boulder') ON CONFLICT (trade_slug, state_slug, city_slug) DO NOTHING;
INSERT INTO category_towns (trade_slug, state_slug, city_slug) VALUES ('interior-designers', 'colorado', 'westminster') ON CONFLICT (trade_slug, state_slug, city_slug) DO NOTHING;
INSERT INTO category_towns (trade_slug, state_slug, city_slug) VALUES ('nails', 'texas', 'friendswood') ON CONFLICT (trade_slug, state_slug, city_slug) DO NOTHING;
INSERT INTO category_towns (trade_slug, state_slug, city_slug) VALUES ('pest-control', 'texas', 'colleyville') ON CONFLICT (trade_slug, state_slug, city_slug) DO NOTHING;
INSERT INTO category_towns (trade_slug, state_slug, city_slug) VALUES ('spas', 'texas', 'belton') ON CONFLICT (trade_slug, state_slug, city_slug) DO NOTHING;
INSERT INTO category_towns (trade_slug, state_slug, city_slug) VALUES ('spas', 'texas', 'richmond') ON CONFLICT (trade_slug, state_slug, city_slug) DO NOTHING;
INSERT INTO category_towns (trade_slug, state_slug, city_slug) VALUES ('veterinary', 'maryland', 'odenton') ON CONFLICT (trade_slug, state_slug, city_slug) DO NOTHING;
INSERT INTO category_towns (trade_slug, state_slug, city_slug) VALUES ('veterinary', 'new-york', 'new-hyde-park') ON CONFLICT (trade_slug, state_slug, city_slug) DO NOTHING;
INSERT INTO category_towns (trade_slug, state_slug, city_slug) VALUES ('veterinary', 'new-york', 'tonawanda') ON CONFLICT (trade_slug, state_slug, city_slug) DO NOTHING;
INSERT INTO category_towns (trade_slug, state_slug, city_slug) VALUES ('veterinary', 'pennsylvania', 'bethlehem') ON CONFLICT (trade_slug, state_slug, city_slug) DO NOTHING;
INSERT INTO category_towns (trade_slug, state_slug, city_slug) VALUES ('veterinary', 'pennsylvania', 'easton') ON CONFLICT (trade_slug, state_slug, city_slug) DO NOTHING;
INSERT INTO category_towns (trade_slug, state_slug, city_slug) VALUES ('veterinary', 'pennsylvania', 'lebanon') ON CONFLICT (trade_slug, state_slug, city_slug) DO NOTHING;
INSERT INTO category_towns (trade_slug, state_slug, city_slug) VALUES ('veterinary', 'pennsylvania', 'phoenixville') ON CONFLICT (trade_slug, state_slug, city_slug) DO NOTHING;
INSERT INTO category_towns (trade_slug, state_slug, city_slug) VALUES ('veterinary', 'pennsylvania', 'state-college') ON CONFLICT (trade_slug, state_slug, city_slug) DO NOTHING;
INSERT INTO category_towns (trade_slug, state_slug, city_slug) VALUES ('veterinary', 'pennsylvania', 'york') ON CONFLICT (trade_slug, state_slug, city_slug) DO NOTHING;
