// YourTownPros web staging Worker entry (migration branch only).
//
// Staging copy of the production Pages adapter in functions/[[path]].js,
// reshaped as a Worker default export. Behavior is identical, in order:
//   1. Non-GET/HEAD requests delegate to the static asset store (ASSETS).
//   2. Paths with 3 or more segments (category pages and deeper) delegate
//      to ASSETS. D1 is never read for them.
//   3. An exactly-2-segment path under an included vertical first asks
//      ASSETS. An existing static file is returned byte-identical and D1
//      is never touched. Only on an ASSETS 404 is the render core called.
//   4. A renderer 404 (slug not in D1) and any renderer error both return
//      the ASSETS 404 outcome: the site's not-found page. The render layer
//      can never take a static path down with it.
//   5. Every other path shape delegates to ASSETS. (The wrangler assets
//      run_worker_first list in wrangler.web-staging.toml scopes Worker
//      invocation to the vertical prefixes below, the same role
//      _routes.json plays for the Pages Function; the segment and
//      vertical checks here are the same rules enforced in code.)
//
// The render core is the production bundle, imported unchanged from
// functions/_renderer.mjs (generated; regenerate there, never edit here).
// The vertical list is identical to functions/[[path]].js and
// _routes.json. Never hand-maintain it in one place only.

import renderer from "../functions/_renderer.mjs";

const VERTICALS = new Set([
  "auto-glass",
  "auto-repair",
  "bakeries-and-cafes",
  "barbers",
  "bars",
  "bookstores",
  "chiropractors",
  "cleaners",
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
  "lawn-and-landscaping",
  "locksmiths",
  "massage",
  "med-spas",
  "movers",
  "nails",
  "natural-skincare",
  "optometrists",
  "painting",
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

export default {
  async fetch(request, env, ctx) {
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
      const rendered = await renderer.fetch(request, env, ctx);
      if (rendered.status === 404) {
        return assetResponse;
      }
      return rendered;
    } catch (err) {
      return assetResponse;
    }
  },
};
