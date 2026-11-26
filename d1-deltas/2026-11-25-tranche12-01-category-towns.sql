-- Tranche 12 delta (staged 2026-11-25, v2 publish tranche 12, Option D gate with Census pin first and town-center fallback): category_towns rows for the new town plus trade pairs at
-- least one published listing sits in (the roster refresh builds these
-- category pages right behind the tranche).
INSERT INTO category_towns (trade_slug, state_slug, city_slug) VALUES ('lawn-and-landscaping', 'texas', 'killeen') ON CONFLICT (trade_slug, state_slug, city_slug) DO NOTHING;
INSERT INTO category_towns (trade_slug, state_slug, city_slug) VALUES ('pest-control', 'texas', 'amarillo') ON CONFLICT (trade_slug, state_slug, city_slug) DO NOTHING;
INSERT INTO category_towns (trade_slug, state_slug, city_slug) VALUES ('pest-control', 'texas', 'belton') ON CONFLICT (trade_slug, state_slug, city_slug) DO NOTHING;
INSERT INTO category_towns (trade_slug, state_slug, city_slug) VALUES ('pest-control', 'texas', 'crowley') ON CONFLICT (trade_slug, state_slug, city_slug) DO NOTHING;
INSERT INTO category_towns (trade_slug, state_slug, city_slug) VALUES ('pest-control', 'texas', 'harker-heights') ON CONFLICT (trade_slug, state_slug, city_slug) DO NOTHING;
INSERT INTO category_towns (trade_slug, state_slug, city_slug) VALUES ('pest-control', 'texas', 'jarrell') ON CONFLICT (trade_slug, state_slug, city_slug) DO NOTHING;
INSERT INTO category_towns (trade_slug, state_slug, city_slug) VALUES ('pest-control', 'texas', 'la-porte') ON CONFLICT (trade_slug, state_slug, city_slug) DO NOTHING;
INSERT INTO category_towns (trade_slug, state_slug, city_slug) VALUES ('pest-control', 'texas', 'mansfield') ON CONFLICT (trade_slug, state_slug, city_slug) DO NOTHING;
INSERT INTO category_towns (trade_slug, state_slug, city_slug) VALUES ('pest-control', 'texas', 'mission') ON CONFLICT (trade_slug, state_slug, city_slug) DO NOTHING;
INSERT INTO category_towns (trade_slug, state_slug, city_slug) VALUES ('pest-control', 'texas', 'pharr') ON CONFLICT (trade_slug, state_slug, city_slug) DO NOTHING;
INSERT INTO category_towns (trade_slug, state_slug, city_slug) VALUES ('pest-control', 'texas', 'sugar-land') ON CONFLICT (trade_slug, state_slug, city_slug) DO NOTHING;
