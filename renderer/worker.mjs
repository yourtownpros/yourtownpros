// Cloudflare Worker entry for listing pages (gate d). NOT deployed by this
// build; deployment is an account step listed in ACCOUNT-STEPS.md.
//
// Routing contract (brief sections 1 and 2): one Worker route per trade
// matches the two-segment listing pattern /<trade>/<business-slug>-<town>/.
// The Worker re-checks the path shape itself and passes anything that is not
// a true listing straight through to the static origin, so a misfire costs
// one pass-through, never a wrong page. Every route is set FAIL OPEN in the
// dashboard, so hitting the daily request cap bypasses the Worker instead of
// erroring (brief section 3). Bot features stay OFF on the zone (brief
// section 6); nothing in this Worker challenges any user agent.

import { renderListing, lookupRedirect } from "./render.mjs";

const LISTING_PATH = /^\/([a-z0-9-]+)\/([a-z0-9-]+)\/?$/;

// The _headers general rule for rendered pages (the Pages _headers file does
// not apply to Worker responses, so the Worker sets the same values itself).
const PAGE_HEADERS = {
  "Content-Type": "text/html; charset=utf-8",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Frame-Options": "SAMEORIGIN",
  "Cache-Control": "public, max-age=0, must-revalidate",
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const m = LISTING_PATH.exec(url.pathname);
    if (!m) return fetch(request); // not listing-shaped: static origin serves it
    const path = `${m[1]}/${m[2]}`;

    const redirect = await lookupRedirect(env.DB, path);
    if (redirect) {
      return Response.redirect(`https://${url.host}/${redirect.to_path}/`, redirect.status || 301);
    }
    const html = await renderListing(env.DB, path);
    if (html === null) return fetch(request); // unknown slug: pass through (static 404 there)
    return new Response(html, { headers: PAGE_HEADERS });
  },
};
