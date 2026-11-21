-- Item 89 (v5.48) architects: trades phrase fix. The renderer About line reads
-- "is a {phrase} business"; "architects and architectural designers" produced
-- "a architects...", so the phrase becomes "design" (accurate for the
-- designer-track firms in this category and grammatical in every template use).
INSERT INTO trades (trade_slug, phrase) VALUES ('architects', 'design')
ON CONFLICT (trade_slug) DO UPDATE SET phrase = excluded.phrase;
