-- Colorado 432 tranche 1 (Denver) sheet-sourced promotions publish delta (staged 2026-11-22): category_towns rows for the
-- new town+trade pairs at least one published listing sits in.
INSERT INTO category_towns (trade_slug, state_slug, city_slug) VALUES ('concrete-contractors', 'colorado', 'denver') ON CONFLICT (trade_slug, state_slug, city_slug) DO NOTHING;
INSERT INTO category_towns (trade_slug, state_slug, city_slug) VALUES ('home-builders', 'colorado', 'denver') ON CONFLICT (trade_slug, state_slug, city_slug) DO NOTHING;
INSERT INTO category_towns (trade_slug, state_slug, city_slug) VALUES ('locksmiths', 'colorado', 'denver') ON CONFLICT (trade_slug, state_slug, city_slug) DO NOTHING;
INSERT INTO category_towns (trade_slug, state_slug, city_slug) VALUES ('paving-and-asphalt', 'colorado', 'denver') ON CONFLICT (trade_slug, state_slug, city_slug) DO NOTHING;
INSERT INTO category_towns (trade_slug, state_slug, city_slug) VALUES ('pest-control', 'colorado', 'denver') ON CONFLICT (trade_slug, state_slug, city_slug) DO NOTHING;
