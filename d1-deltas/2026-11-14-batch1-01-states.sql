-- Batch 1 delta (2026-11-14): states rows for the 19 states the mapping
-- pack spans beyond the live 31. The renderer reads the state row on
-- every render, so these land before the listings that need them.
INSERT INTO states (state, name, state_slug) VALUES ('AK', 'Alaska', 'alaska') ON CONFLICT (state) DO UPDATE SET name = excluded.name, state_slug = excluded.state_slug;
INSERT INTO states (state, name, state_slug) VALUES ('AL', 'Alabama', 'alabama') ON CONFLICT (state) DO UPDATE SET name = excluded.name, state_slug = excluded.state_slug;
INSERT INTO states (state, name, state_slug) VALUES ('CT', 'Connecticut', 'connecticut') ON CONFLICT (state) DO UPDATE SET name = excluded.name, state_slug = excluded.state_slug;
INSERT INTO states (state, name, state_slug) VALUES ('DE', 'Delaware', 'delaware') ON CONFLICT (state) DO UPDATE SET name = excluded.name, state_slug = excluded.state_slug;
INSERT INTO states (state, name, state_slug) VALUES ('FL', 'Florida', 'florida') ON CONFLICT (state) DO UPDATE SET name = excluded.name, state_slug = excluded.state_slug;
INSERT INTO states (state, name, state_slug) VALUES ('GA', 'Georgia', 'georgia') ON CONFLICT (state) DO UPDATE SET name = excluded.name, state_slug = excluded.state_slug;
INSERT INTO states (state, name, state_slug) VALUES ('HI', 'Hawaii', 'hawaii') ON CONFLICT (state) DO UPDATE SET name = excluded.name, state_slug = excluded.state_slug;
INSERT INTO states (state, name, state_slug) VALUES ('MA', 'Massachusetts', 'massachusetts') ON CONFLICT (state) DO UPDATE SET name = excluded.name, state_slug = excluded.state_slug;
INSERT INTO states (state, name, state_slug) VALUES ('MD', 'Maryland', 'maryland') ON CONFLICT (state) DO UPDATE SET name = excluded.name, state_slug = excluded.state_slug;
INSERT INTO states (state, name, state_slug) VALUES ('ME', 'Maine', 'maine') ON CONFLICT (state) DO UPDATE SET name = excluded.name, state_slug = excluded.state_slug;
INSERT INTO states (state, name, state_slug) VALUES ('NC', 'North Carolina', 'north-carolina') ON CONFLICT (state) DO UPDATE SET name = excluded.name, state_slug = excluded.state_slug;
INSERT INTO states (state, name, state_slug) VALUES ('NH', 'New Hampshire', 'new-hampshire') ON CONFLICT (state) DO UPDATE SET name = excluded.name, state_slug = excluded.state_slug;
INSERT INTO states (state, name, state_slug) VALUES ('NJ', 'New Jersey', 'new-jersey') ON CONFLICT (state) DO UPDATE SET name = excluded.name, state_slug = excluded.state_slug;
INSERT INTO states (state, name, state_slug) VALUES ('NY', 'New York', 'new-york') ON CONFLICT (state) DO UPDATE SET name = excluded.name, state_slug = excluded.state_slug;
INSERT INTO states (state, name, state_slug) VALUES ('PA', 'Pennsylvania', 'pennsylvania') ON CONFLICT (state) DO UPDATE SET name = excluded.name, state_slug = excluded.state_slug;
INSERT INTO states (state, name, state_slug) VALUES ('RI', 'Rhode Island', 'rhode-island') ON CONFLICT (state) DO UPDATE SET name = excluded.name, state_slug = excluded.state_slug;
INSERT INTO states (state, name, state_slug) VALUES ('SC', 'South Carolina', 'south-carolina') ON CONFLICT (state) DO UPDATE SET name = excluded.name, state_slug = excluded.state_slug;
INSERT INTO states (state, name, state_slug) VALUES ('VA', 'Virginia', 'virginia') ON CONFLICT (state) DO UPDATE SET name = excluded.name, state_slug = excluded.state_slug;
INSERT INTO states (state, name, state_slug) VALUES ('WV', 'West Virginia', 'west-virginia') ON CONFLICT (state) DO UPDATE SET name = excluded.name, state_slug = excluded.state_slug;
