-- Tranche 8 delta (staged 2026-11-25, v2 publish tranche 8, Option D gate with Census pin first and town-center fallback): category_towns rows for the new town plus trade pairs at
-- least one published listing sits in (the roster refresh builds these
-- category pages right behind the tranche).
INSERT INTO category_towns (trade_slug, state_slug, city_slug) VALUES ('architects', 'colorado', 'durango') ON CONFLICT (trade_slug, state_slug, city_slug) DO NOTHING;
INSERT INTO category_towns (trade_slug, state_slug, city_slug) VALUES ('architects', 'colorado', 'evergreen') ON CONFLICT (trade_slug, state_slug, city_slug) DO NOTHING;
INSERT INTO category_towns (trade_slug, state_slug, city_slug) VALUES ('architects', 'colorado', 'greeley') ON CONFLICT (trade_slug, state_slug, city_slug) DO NOTHING;
INSERT INTO category_towns (trade_slug, state_slug, city_slug) VALUES ('architects', 'texas', 'dallas') ON CONFLICT (trade_slug, state_slug, city_slug) DO NOTHING;
INSERT INTO category_towns (trade_slug, state_slug, city_slug) VALUES ('architects', 'texas', 'san-antonio') ON CONFLICT (trade_slug, state_slug, city_slug) DO NOTHING;
INSERT INTO category_towns (trade_slug, state_slug, city_slug) VALUES ('barbers', 'texas', 'killeen') ON CONFLICT (trade_slug, state_slug, city_slug) DO NOTHING;
INSERT INTO category_towns (trade_slug, state_slug, city_slug) VALUES ('hair-salons', 'texas', 'aubrey') ON CONFLICT (trade_slug, state_slug, city_slug) DO NOTHING;
INSERT INTO category_towns (trade_slug, state_slug, city_slug) VALUES ('hair-salons', 'texas', 'benbrook') ON CONFLICT (trade_slug, state_slug, city_slug) DO NOTHING;
INSERT INTO category_towns (trade_slug, state_slug, city_slug) VALUES ('hair-salons', 'texas', 'farmers-branch') ON CONFLICT (trade_slug, state_slug, city_slug) DO NOTHING;
INSERT INTO category_towns (trade_slug, state_slug, city_slug) VALUES ('home-builders', 'colorado', 'centennial') ON CONFLICT (trade_slug, state_slug, city_slug) DO NOTHING;
INSERT INTO category_towns (trade_slug, state_slug, city_slug) VALUES ('home-builders', 'colorado', 'durango') ON CONFLICT (trade_slug, state_slug, city_slug) DO NOTHING;
INSERT INTO category_towns (trade_slug, state_slug, city_slug) VALUES ('home-builders', 'colorado', 'fort-collins') ON CONFLICT (trade_slug, state_slug, city_slug) DO NOTHING;
INSERT INTO category_towns (trade_slug, state_slug, city_slug) VALUES ('interior-designers', 'colorado', 'durango') ON CONFLICT (trade_slug, state_slug, city_slug) DO NOTHING;
INSERT INTO category_towns (trade_slug, state_slug, city_slug) VALUES ('interior-designers', 'colorado', 'fort-collins') ON CONFLICT (trade_slug, state_slug, city_slug) DO NOTHING;
INSERT INTO category_towns (trade_slug, state_slug, city_slug) VALUES ('interior-designers', 'colorado', 'littleton') ON CONFLICT (trade_slug, state_slug, city_slug) DO NOTHING;
INSERT INTO category_towns (trade_slug, state_slug, city_slug) VALUES ('lawn-and-landscaping', 'colorado', 'brighton') ON CONFLICT (trade_slug, state_slug, city_slug) DO NOTHING;
INSERT INTO category_towns (trade_slug, state_slug, city_slug) VALUES ('lawn-and-landscaping', 'colorado', 'broomfield') ON CONFLICT (trade_slug, state_slug, city_slug) DO NOTHING;
INSERT INTO category_towns (trade_slug, state_slug, city_slug) VALUES ('lawn-and-landscaping', 'colorado', 'lafayette') ON CONFLICT (trade_slug, state_slug, city_slug) DO NOTHING;
INSERT INTO category_towns (trade_slug, state_slug, city_slug) VALUES ('lawn-and-landscaping', 'colorado', 'wheat-ridge') ON CONFLICT (trade_slug, state_slug, city_slug) DO NOTHING;
INSERT INTO category_towns (trade_slug, state_slug, city_slug) VALUES ('locksmiths', 'colorado', 'bayfield') ON CONFLICT (trade_slug, state_slug, city_slug) DO NOTHING;
INSERT INTO category_towns (trade_slug, state_slug, city_slug) VALUES ('locksmiths', 'texas', 'richardson') ON CONFLICT (trade_slug, state_slug, city_slug) DO NOTHING;
INSERT INTO category_towns (trade_slug, state_slug, city_slug) VALUES ('med-spas', 'texas', 'fairview') ON CONFLICT (trade_slug, state_slug, city_slug) DO NOTHING;
INSERT INTO category_towns (trade_slug, state_slug, city_slug) VALUES ('med-spas', 'texas', 'hewitt') ON CONFLICT (trade_slug, state_slug, city_slug) DO NOTHING;
INSERT INTO category_towns (trade_slug, state_slug, city_slug) VALUES ('pest-control', 'texas', 'aubrey') ON CONFLICT (trade_slug, state_slug, city_slug) DO NOTHING;
INSERT INTO category_towns (trade_slug, state_slug, city_slug) VALUES ('pest-control', 'texas', 'corpus-christi') ON CONFLICT (trade_slug, state_slug, city_slug) DO NOTHING;
INSERT INTO category_towns (trade_slug, state_slug, city_slug) VALUES ('pest-control', 'texas', 'little-elm') ON CONFLICT (trade_slug, state_slug, city_slug) DO NOTHING;
INSERT INTO category_towns (trade_slug, state_slug, city_slug) VALUES ('pest-control', 'texas', 'rowlett') ON CONFLICT (trade_slug, state_slug, city_slug) DO NOTHING;
INSERT INTO category_towns (trade_slug, state_slug, city_slug) VALUES ('pest-control', 'texas', 'the-colony') ON CONFLICT (trade_slug, state_slug, city_slug) DO NOTHING;
INSERT INTO category_towns (trade_slug, state_slug, city_slug) VALUES ('spas', 'texas', 'alvin') ON CONFLICT (trade_slug, state_slug, city_slug) DO NOTHING;
INSERT INTO category_towns (trade_slug, state_slug, city_slug) VALUES ('spas', 'texas', 'league-city') ON CONFLICT (trade_slug, state_slug, city_slug) DO NOTHING;
