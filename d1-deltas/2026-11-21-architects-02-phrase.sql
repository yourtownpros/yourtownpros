-- Item 89 (v5.48) architects: trades phrase fix. The renderer About line reads
-- "is a {phrase} business"; "architects and architectural designers" produced
-- "a architects...", so the phrase becomes "design" (accurate for the
-- designer-track firms in this category and grammatical in every template use).
-- Full-row upsert form: trades.label is NOT NULL, so the insert side carries it.
INSERT INTO trades (trade_slug, label, short_name, phrase, singular, schema_type, og_image, service_placeholder)
VALUES ('architects', 'Architects', 'Architects', 'design', 'design firm', 'ProfessionalService',
        'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1200&h=630&q=70',
        'Example: drawings for a home addition')
ON CONFLICT (trade_slug) DO UPDATE SET phrase = excluded.phrase;
