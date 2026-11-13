# Shadow diff, local sample (renderer preview build)

Sample: 50 Colorado listings rendered from the local D1-shaped database and byte-diffed against the static files in this repo.
Identical: 48 of 50. Differing: 2.
Average local render time: 8.03 ms per page (Node on this VM; Workers CPU is measured in shadow mode later, brief step 4).

## Differing elements, by frequency

- hero image: 2 pages
- h1, pills, stars line: 2 pages
- other body content: 2 pages
- about paragraph: 2 pages
- map, address and hours block: 2 pages
- highlights and suggest-an-edit slugs: 2 pages
- featured spot slot: 2 pages
- match form opening: 2 pages
- match form service placeholder: 2 pages
- contact card: 2 pages
- claim strip: 2 pages
- LocalBusiness JSON-LD: 2 pages
- CSS block: 2 pages
- per-page JS config: 2 pages
- other script block: 2 pages
- partner card: 1 pages

## Per page

- IDENTICAL plumbers/cuevas-brothers-plumbers-westminster (required)
- IDENTICAL cleaners/fox-cleaners-lone-tree (required)
- IDENTICAL med-spas/18-spa-johnstown (required)
- DIFFERS natural-skincare/renaud-naturals-loveland (required): static 96112 B, rendered 96004 B, 218 changed lines; elements: hero image; h1, pills, stars line; other body content; about paragraph; map, address and hours block; highlights and suggest-an-edit slugs; featured spot slot; match form opening; match form service placeholder; contact card; claim strip; LocalBusiness JSON-LD; CSS block; per-page JS config; other script block; partner card
- DIFFERS website-design/rankly-design-westminster (required): static 90751 B, rendered 95486 B, 88 changed lines; elements: hero image; h1, pills, stars line; other body content; about paragraph; map, address and hours block; highlights and suggest-an-edit slugs; featured spot slot; match form opening; match form service placeholder; contact card; claim strip; LocalBusiness JSON-LD; CSS block; per-page JS config; other script block
- IDENTICAL auto-glass/austin-auto-glass-canon-city (stratified)
- IDENTICAL auto-glass/american-pride-auto-glass-milliken (stratified)
- IDENTICAL auto-repair/1-off-auto-center-steamboat-springs (stratified)
- IDENTICAL auto-repair/360-diesel-and-auto-repair-elizabeth (stratified)
- IDENTICAL bakeries-and-cafes/aspen-street-coffee-fruita (stratified)
- IDENTICAL bakeries-and-cafes/3-bs-bakery-carbondale (stratified)
- IDENTICAL barbers/1013-barbershop-greenwood-village (stratified)
- IDENTICAL barbers/10th-street-barbershop-steamboat-springs (stratified)
- IDENTICAL bookstores/the-eclectic-reader-fort-collins (stratified)
- IDENTICAL cleaners/acme-cleaners-pueblo (stratified)
- IDENTICAL cleaners/4th-avenue-cleaners-brighton (stratified)
- IDENTICAL dance-studios/dance-dimensions-longmont (stratified)
- IDENTICAL dance-studios/anita-mccoy-dance-studio-canon-city (stratified)
- IDENTICAL electricians/aanda-electrical-services-llc-rifle (stratified)
- IDENTICAL electricians/1st-due-voltage-company-thornton (stratified)
- IDENTICAL fitness/adventure-fitness-athletic-club-thornton (stratified)
- IDENTICAL fitness/5280-fitness-consulting-westminster (stratified)
- IDENTICAL florists/a-florae-longmont (stratified)
- IDENTICAL florists/acscents-floral-thornton (stratified)
- IDENTICAL hair-salons/a-beautiful-you-edwards (stratified)
- IDENTICAL hair-salons/2nd-nature-hair-lounge-niwot (stratified)
- IDENTICAL handyman/choice-green-handyman-services-llc-northglenn (stratified)
- IDENTICAL handyman/afgh-handyman-service-mead (stratified)
- IDENTICAL hvac/1st-action-plumbing-heating-and-air-loveland (stratified)
- IDENTICAL hvac/360-hvac-pro-heating-and-cooling-commerce-city (stratified)
- IDENTICAL jewelry/canon-city-coins-and-collectibles-canon-city (stratified)
- IDENTICAL jewelry/adornable-permanent-jewelry-and-ear-piercing-parker (stratified)
- IDENTICAL lawn-and-landscaping/aanda-tree-service-westminster (stratified)
- IDENTICAL lawn-and-landscaping/101-landscaping-elizabeth (stratified)
- IDENTICAL locksmiths/dc-lock-inc-grand-junction (stratified)
- IDENTICAL locksmiths/1-of-those-locksmith-guys-fruita (stratified)
- IDENTICAL massage/a-most-kneaded-massage-steamboat-springs (stratified)
- IDENTICAL massage/aligned-therapeutic-massage-erie (stratified)
- IDENTICAL med-spas/align-medical-center-wellington (stratified)
- IDENTICAL nails/3-d-nails-brighton (stratified)
- IDENTICAL nails/1st-nail-bar-erie (stratified)
- IDENTICAL painting/a-new-view-painting-erie (stratified)
- IDENTICAL painting/4-k-painting-and-drywall-wellington (stratified)
- IDENTICAL pet-boarding/cozy-little-kennel-rifle (stratified)
- IDENTICAL pet-boarding/altitude-pet-co-elizabeth (stratified)
- IDENTICAL pet-grooming/4-paws-pet-grooming-castle-rock (stratified)
- IDENTICAL pet-grooming/17th-and-pawlished-greeley (stratified)
- IDENTICAL plumbers/5280-drain-westminster (stratified)
- IDENTICAL plumbers/1st-choice-pro-services-parker (stratified)
- IDENTICAL roofing/3-kings-roofing-wheat-ridge (stratified)

Known special pages in the sample: natural-skincare/renaud-naturals-loveland and website-design/rankly-design-westminster are hand-built profiles without the standard match form or featured slot (their trades have no harvested phrase or placeholder), so they are expected to differ until their profiles get their own templates.
