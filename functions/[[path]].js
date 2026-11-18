// YourTownPros Pages Function adapter. Renderer rollout plan 2026-11-15,
// section 1.2. This file is the only new logic in the serving change; the
// render core lives in ./_renderer.mjs (generated, do not edit there).
//
// Behavior, in order:
//   1. Non-GET/HEAD requests delegate to the Pages asset store (ASSETS).
//   2. Paths with 3 or more segments (category pages and deeper) delegate
//      to ASSETS. D1 is never read for them.
//   3. An exactly-2-segment path under an included vertical first asks
//      ASSETS. An existing static file is returned byte-identical and D1
//      is never touched. Only on an ASSETS 404 is the render core called.
//   4. A renderer 404 (slug not in D1) and any renderer error both return
//      the ASSETS 404 outcome: the site's not-found page. The render layer
//      can never take a static path down with it.
//   5. Every other path shape delegates to ASSETS. (_routes.json already
//      scopes invocation to the vertical prefixes below; the segment and
//      vertical checks here are the same rules enforced in code.)
//
// The vertical list is generated from the generator's TAXONOMY plus its
// HOUSE_VERTS (package of record: ytpgen s02_data_tables.py) and the
// mapping pack's 10 new verticals (vertical-mapping-pack-2026-11-14),
// identical to _routes.json. Never hand-maintain it in either file.

import renderer from "./_renderer.mjs";

const VERTICALS = new Set([
  "auto-glass",
  "auto-repair",
  "bakeries-and-cafes",
  "barbers",
  "bars",
  "bookstores",
  "chiropractors",
  "cleaners",
  "concrete-contractors",
  "dance-studios",
  "dentists",
  "electricians",
  "fitness",
  "flooring",
  "florists",
  "hair-salons",
  "handyman",
  "hvac",
  "jewelry",
  "kitchen-remodelers",
  "lawn-and-landscaping",
  "locksmiths",
  "massage",
  "med-spas",
  "movers",
  "nails",
  "natural-skincare",
  "optometrists",
  "painting",
  "paving-and-asphalt",
  "pawn-shops",
  "pest-control",
  "pet-boarding",
  "pet-grooming",
  "photographers",
  "plumbers",
  "roofing",
  "spas",
  "tanning",
  "tattoo",
  "towing",
  "tree-service",
  "veterinary",
  "website-design",
]);

export async function onRequest(context) {
  const { request, env } = context;
  const segments = new URL(request.url).pathname
    .split("/")
    .filter((s) => s.length > 0);

  const isListingShape =
    (request.method === "GET" || request.method === "HEAD") &&
    segments.length === 2 &&
    VERTICALS.has(segments[0]);

  if (!isListingShape) {
    return env.ASSETS.fetch(request);
  }

  const assetResponse = await env.ASSETS.fetch(request);
  if (assetResponse.status !== 404) {
    return assetResponse;
  }

  try {
    const rendered = await renderer.fetch(request, env, context);
    if (rendered.status === 404) {
      return assetResponse;
    }
    return rendered;
  } catch (err) {
    return assetResponse;
  }
}
