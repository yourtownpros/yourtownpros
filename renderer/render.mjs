// YourTownPros listing renderer: one template, one D1 row, byte-close to the
// static page for the same business. Pure functions over a D1-shaped db
// interface (prepare(sql).bind(...).first() / .all()), so the same code runs
// in the Worker (env.DB) and locally (local-db.mjs over node:sqlite).
//
// Render read budget (brief section 3): redirect lookup 1, listing 1, trade 1,
// state 1, similar up to 5, partner card up to 1. About 10 rows, under the 30
// row cap. No query in this file scans: every lookup is a PK or index hit,
// and radius search never happens at render time (similar_pros is precomputed
// by the loader using the cell index design in schema.sql).

import { TEMPLATE, OPENNOW_SCRIPT, RENTRACK_SCRIPT } from "./template.mjs";

// The static generator serialises JSON the Python way: ", " between items and
// ": " after keys. Match it exactly or every JSON block diffs.
function pyJson(v) {
  if (v === null || v === undefined) return "null";
  if (typeof v === "number" || typeof v === "boolean") return JSON.stringify(v);
  if (typeof v === "string") return JSON.stringify(v);
  if (Array.isArray(v)) return "[" + v.map(pyJson).join(", ") + "]";
  return "{" + Object.entries(v).map(([k, x]) => `${JSON.stringify(k)}: ${pyJson(x)}`).join(", ") + "}";
}

// Python html.escape(quote=True) and urllib.parse.quote(safe="") semantics,
// which is what the static generator uses for names in text, attributes and
// claim links (apostrophes become &#x27; in HTML and %27 in URLs).
const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;").replace(/'/g, "&#x27;");
const escAttr = esc;
const enc = (s) => encodeURIComponent(String(s ?? ""))
  .replace(/'/g, "%27").replace(/\(/g, "%28").replace(/\)/g, "%29").replace(/\*/g, "%2A").replace(/!/g, "%21");
const fmtRating = (r) => Number(r).toFixed(1); // hero stars always print one decimal
const fmtRatingCard = (r) => String(Number(r)); // rail cards print 5, not 5.0
// Five-glyph star display rounded to the nearest half: 4.2 prints four full
// and one empty, 4.5 four full and one half, 4.8 five full.
const stars = (r) => {
  const halves = Math.round(r * 2);
  const full = Math.floor(halves / 2), half = halves % 2;
  return "★".repeat(full) + (half ? "⯨" : "") + "☆".repeat(5 - full - half);
};

// Street address as the meta description prints it: unit dropped, trailing
// street-type word dropped ('5040 W 92nd Ave #8600' becomes '5040 W 92nd').
const STREET_SUFFIX = new Set(["Ave", "Avenue", "St", "Street", "Blvd", "Boulevard", "Dr", "Drive",
  "Rd", "Road", "Ln", "Lane", "Ct", "Court", "Way", "Pl", "Place", "Cir", "Circle", "Hwy", "Highway",
  "Pkwy", "Parkway", "Trl", "Trail"]);
function descAddress(address) {
  if (!address) return null;
  const noUnit = address.split("#")[0].trim().replace(/,$/, "");
  const words = noUnit.split(/\s+/);
  if (words.length > 3 && STREET_SUFFIX.has(words[words.length - 1])) words.pop();
  return words.join(" ");
}

function head(l, t, st) {
  // Title, description and og:title are listing data (their wording depends
  // on rating, address and phone in ways the data files do not fully
  // determine), so the loader harvests them verbatim from the static page.
  const base = `${esc(l.name)} in ${esc(l.city)}, ${l.state}`;
  const title = l.page_title || (l.rating != null ? base : `${base}: Phone Number | YourTownPros`);
  const ogTitle = l.og_title || (l.rating != null ? base : `${base}: Phone Number`);
  let desc = l.meta_desc;
  if (!desc) {
    desc = `${l.name} is a ${t.singular} in ${l.city}, ${st.name}.`;
    if (l.rating != null) {
      desc += ` It has a ${fmtRating(l.rating)}-star Google rating from ${l.review_count} reviews.`;
      desc += ` Call ${l.phone} or visit ${descAddress(l.address)}.`;
    } else if (l.phone) {
      desc += ` Call ${l.phone}. Owners can claim this free listing.`;
    }
  }
  const url = `https://yourtownpros.com/${l.path}/`;
  return `<title>${title}</title><meta name="description" content="${desc}">` +
    `<link rel="canonical" href="${url}">` +
    `<link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="icon" href="/favicon.ico" sizes="32x32">` +
    `<link rel="apple-touch-icon" href="/apple-touch-icon.png">` +
    `<meta property="og:type" content="website"><meta property="og:site_name" content="YourTownPros">` +
    `<meta property="og:title" content="${ogTitle}"><meta property="og:description" content="${desc}">` +
    `<meta property="og:url" content="${url}"><meta property="og:image" content="${l.image_url || t.og_image}">` +
    `<meta name="twitter:card" content="summary_large_image">` +
    `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="">`;
}

function crumb(l, t, st) {
  const head = `<main class="wrap"><div class="crumb"><a href="/">Home</a> / <a href="/${l.trade_slug}/">${esc(t.label)}</a> / ` +
    `<a href="/${l.trade_slug}/${l.state_slug}/">${esc(st.name)}</a> / `;
  if (!l.crumb_linked) return head + `${esc(l.city)}</div>`;
  return head +
    `<a href="/${l.trade_slug}/${l.state_slug}/${l.city_slug}/" title="${escAttr(t.label)} in ${escAttr(st.name)}">${esc(t.label)} in ${esc(l.city)}</a></div>`;
}

function hero(l, t) {
  const base = String(l.image_url || t.og_image).split("?")[0];
  const img = (w) => `${base}?auto=format&amp;fit=crop&amp;w=${w}&amp;q=60`;
  return `<div class="bizhero57"><img class="photoband-img" src="${img(1200)}" ` +
    `srcset="${img(480)} 480w, ${img(828)} 828w, ${img(1200)} 1200w" sizes="100vw" width="1200" height="180" ` +
    `fetchpriority="high" alt="Stock photo: ${escAttr(t.phrase)} in ${escAttr(l.city)}, ${l.state}"></div>`;
}

function h1block(l, t) {
  let s = `<h1>${esc(l.name)}</h1><span class="pill">${esc(t.label)}</span><span class="pill">${esc(l.city)}, ${l.state}</span>`;
  if (l.rating != null) s += `<p class="stars">${stars(l.rating)} ${l.rating_text || fmtRatingCard(l.rating)} · ${l.review_count} reviews</p>`;
  else if (l.review_count != null) s += `<p class="stars">${l.review_count} reviews</p>`;
  return s;
}

function about(l, t, st) {
  // Enriched listings replace the About block with owner/Places copy and,
  // when chips exist, the amenities block. Both are harvested verbatim.
  if (l.from_business) {
    return `<h2>From this business</h2><p>${l.from_business}</p>` +
      `<p class="listed">Listed in the YourTownPros directory with publicly available information. To book, call the number above.</p>`;
  }
  return `<h2>About this listing</h2><p>${esc(l.name)} is a ${esc(t.phrase)} business in ${esc(l.city)}, ${esc(st.name)}, ` +
    `listed in the YourTownPros directory with publicly available information. To book, call the number above.</p>`;
}

function amen(l) {
  return l.amen_html ? `<h2>Amenities and services</h2><div class="amen57">${l.amen_html}</div>` : "";
}

// biz-data addresses sometimes already end with ', City, ST' or ', City, ST ZIP'.
// fullAddress never duplicates the suffix; streetParts splits it back out for
// the JSON-LD streetAddress and postalCode fields.
// The location block's directions link tolerates a trailing ZIP in the
// stored suffix; the contact card's link appends the suffix unconditionally
// (it visibly duplicates on addresses that already carry it; that is what
// the static pages print). Two rules, two links, both intentional here.
function fullAddress(l) {
  if (!l.address) return null;
  const suf = `, ${l.city}, ${l.state}`;
  if (l.address.endsWith(suf)) return l.address;
  if (new RegExp(`, ${l.city}, ${l.state} \\d{5}$`).test(l.address)) return l.address;
  return l.address + suf;
}
// The map block prints the address without its ZIP. Its suffix rule differs
// from the directions link in one case: an address ending in just ', City'
// takes only ', ST' here, while the directions link appends ', City, ST'.
function lmapAddress(l) {
  const a = l.address.replace(/, ([A-Z]{2}) \d{5}$/, ", $1");
  const suf = `, ${l.city}, ${l.state}`;
  if (a.endsWith(suf)) return a;
  if (a.endsWith(`, ${l.city}`)) return `${a}, ${l.state}`;
  return a + suf;
}
function streetParts(l) {
  if (!l.address) return { street: null, zip: null };
  if (l.address === `${l.city}, ${l.state}`) return { street: null, zip: null };
  const m = new RegExp(`^(.*), ${l.city}(?:, ${l.state}(?: (\\d{5}))?)?$`).exec(l.address);
  if (!m) return { street: l.address, zip: null };
  return { street: m[1], zip: m[2] || null };
}
function directionsUrl(l) {
  const dest = l.address ? fullAddress(l) : `${l.city}, ${l.state}`;
  return `https://www.google.com/maps/dir/?api=1&destination=${enc(dest)}`;
}
function contactDirectionsUrl(l) {
  return `https://www.google.com/maps/dir/?api=1&destination=${enc(`${l.address}, ${l.city}, ${l.state}`)}`;
}

function lochrs(l) {
  let left;
  if (l.pin_source === "pin") {
    const data = { mode: "pin", lat: l.lat, lng: l.lng, name: l.name, addr: lmapAddress(l) };
    left = `<div><div class="lmapwrap"><div id="ytp-lmap" class="lmap"></div></div>` +
      `<p><a href="${directionsUrl(l)}">Get directions</a></p>` +
      `<script type="application/json" id="ytp-lmap-data">${pyJson(data)}</script></div>`;
  } else {
    const data = { mode: "city", lat: l.lat, lng: l.lng, city: `${l.city}, ${l.state}` };
    left = `<div><div class="lmapwrap"><div id="ytp-lmap" class="lmap"></div>` +
      `<p class="mapcap">Business pins appear here as addresses are verified.</p></div>` +
      (l.address ? `<p><a href="https://www.google.com/maps/dir/?api=1&destination=${enc(l.address)}">Get directions</a></p>` : "") +
      `<script type="application/json" id="ytp-lmap-data">${pyJson(data)}</script></div>`;
  }
  let right = `<div><p>${l.address ? esc(l.address) : `${esc(l.city)}, ${l.state}`}</p>`;
  if (l.hours_json) {
    const items = JSON.parse(l.hours_json).map((h) => `<li>${esc(h)}</li>`).join("");
    right += `<p class="opennow" id="ytp-opennow" data-tz="${l.hours_tz}" hidden></p><ul class="hourslist">${items}</ul>`;
  } else {
    right += `<p class="hoursnone"><strong>Hours not listed yet</strong></p>` +
      `<p class="listed">Is this your business? <a href="/claim/?business=${l.path}&name=${enc(l.name)}">Claim this free listing</a> to add your hours.</p>`;
  }
  right += `</div>`;
  return `<div class="lochrs57">${left}${right}</div>`;
}

function feat(l, t) {
  return `<div class="feat"><div class="k">Sponsored · Featured spot open</div>` +
    `<h2>One ${esc(t.phrase)} business in ${esc(l.city)} gets this spot</h2>` +
    `<p style="margin:0">The featured business in ${esc(l.city)} appears first here, and gets an online booking button on its listing so customers can book without calling. This placement is exclusive to one business per town.</p></div>`;
}

function matchopen(l, t) {
  return `<div class="match" id="match"><h2>Get matched with a ${esc(l.city)} ${esc(t.phrase)} pro</h2>` +
    `<p style="margin:0">Tell us what you need. Your request comes to YourTownPros first: we contact ${esc(l.name)} about it, and if they cannot take the job, we match you with another ${esc(l.city)} ${esc(t.phrase)} pro instead. Free for customers, and no obligation.</p>\n` +
    `<form action="https://formsubmit.co/yourtownpros@gmail.com" method="POST" id="ytp-match-form" data-match-slug="${l.path}" data-match-source="listing">\n` +
    `<input type="hidden" name="_subject" value="Match request: ${escAttr(t.label)}, ${escAttr(l.city)} (via ${escAttr(l.name)} listing)"><input type="hidden" name="_template" value="table"><input type="hidden" name="_next" value="https://yourtownpros.com/match-thanks/"><div class="hpf" aria-hidden="true"><label>Company website<input type="text" name="company_website" tabindex="-1" autocomplete="off"></label></div>`;
}

function contact(l) {
  let s = `<div class="bizcard57"><h2>Contact</h2>`;
  if (l.phone) s += `<p><a class="tel" href="tel:${l.phone_digits}">Call ${esc(l.phone)}</a></p>`;
  if (l.show_website_link && l.website)
    s += `<a class="act57" href="${escAttr(l.website)}" target="_blank" rel="noopener">Visit their website</a>`;
  if (l.address)
    s += `<a class="act57" href="${contactDirectionsUrl(l)}" target="_blank" rel="noopener">Get directions</a>`;
  s += `<a class="act57" href="#match">Request a match</a></div>`;
  return s;
}

function claimstrip(l) {
  return `<div class="claimstrip">Is this your business? <a href="/claim/?business=${l.path}&name=${enc(l.name)}">Claim this free listing</a> to keep your hours, services and photos current.</div>`;
}

function jsonld(l, t) {
  const o = { "@context": "https://schema.org", "@type": t.schema_type,
    "@id": `https://yourtownpros.com/${l.path}/#business`, name: l.name,
    url: `https://yourtownpros.com/${l.path}/` };
  if (l.phone_digits) o.telephone = l.phone_digits;
  const addr = { "@type": "PostalAddress", addressLocality: l.city, addressRegion: l.state, addressCountry: "US" };
  const sp = streetParts(l);
  if (sp.street) addr.streetAddress = sp.street;
  if (sp.zip) addr.postalCode = sp.zip;
  o.address = addr;
  if (l.website && l.show_website_link) o.sameAs = [l.website];
  return `<script type="application/ld+json">${pyJson(o)}</script>`;
}

function breadcrumbSimilar(l, t, st, similars, partner) {
  const items = [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://yourtownpros.com/" },
    { "@type": "ListItem", position: 2, name: t.label, item: `https://yourtownpros.com/${l.trade_slug}/` },
    { "@type": "ListItem", position: 3, name: st.name, item: `https://yourtownpros.com/${l.trade_slug}/${l.state_slug}/` },
    l.crumb_linked
      ? { "@type": "ListItem", position: 4, name: `${t.label} in ${l.city}`, item: `https://yourtownpros.com/${l.trade_slug}/${l.state_slug}/${l.city_slug}/` }
      : { "@type": "ListItem", position: 4, name: `${t.label} in ${l.city}` },
    { "@type": "ListItem", position: 5, name: l.name },
  ];
  const bc = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: items };
  let s = `<script type="application/ld+json">${pyJson(bc)}</script>`;
  if (similars.length === 0) {
    // An empty rail omits the whole similar block on the static pages.
    if (partner) s += partnerCard(partner);
    return s;
  }
  const cards = similars.map((x) => {
    let c = `<div class="card"><h3><a href="/${x.path}/">${esc(x.name)}</a></h3>`;
    if (x.rating != null) c += `<div class="stars">${stars(x.rating)} ${x.rating_text || fmtRatingCard(x.rating)} · ${x.review_count} reviews</div>`;
    else if (x.review_count != null) c += `<div class="stars">${x.review_count} reviews</div>`;
    c += `<div class="listed">Listed in ${esc(x.city)}</div>`;
    if (x.address) c += `<div class="meta">${esc(x.address)}</div>`;
    else c += `<div class="meta">${esc(x.city)}, ${x.state}</div>`;
    if (x.phone) c += `<div class="meta">${esc(x.phone)}</div>`;
    c += `<div class="meta cardreq"><a href="/${x.path}/?src=card#match">Request this pro</a></div></div>`;
    return c;
  }).join("");
  s += `<div class="similar"><h2>Similar pros nearby</h2><div class="grid">${cards}</div>` +
    `<p><a href="/${l.trade_slug}/${l.state_slug}/">More ${esc(t.label)} in ${esc(st.name)}</a> · ` +
    `<a href="/${l.state_slug}/${l.city_slug}/">All local businesses in ${esc(l.city)}, ${l.state}</a></p></div>`;
  if (partner) s += partnerCard(partner);
  return s;
}

function partnerCard(partner) {
  return `<article class="partnercard" data-profile="${partner.partner_id}" data-slug="${partner.profile_path}" data-surface="ytp-card-listing">` +
    `<p class="sponline">Sponsored · Featured partner</p><h3>${esc(partner.name)}</h3><p>${esc(partner.blurb)}</p>` +
    `<p><a href="/${partner.profile_path}/?src=ytp-card-listing">${esc(partner.link_text)}</a></p></article>`;
}

export async function renderListing(db, path) {
  const l = await db.prepare("SELECT * FROM listings WHERE path = ?").bind(path).first();
  if (!l) return null;
  const t = await db.prepare("SELECT * FROM trades WHERE trade_slug = ?").bind(l.trade_slug).first();
  const st = await db.prepare("SELECT * FROM states WHERE state = ?").bind(l.state).first();
  const sim = await db.prepare(
    "SELECT x.* FROM similar_pros s JOIN listings x ON x.path = s.similar_path WHERE s.path = ? ORDER BY s.rank")
    .bind(path).all();
  const pc = await db.prepare(
    "SELECT p.* FROM listing_partner_cards c JOIN partner_cards p ON p.partner_id = c.partner_id" +
    " WHERE c.path = ? AND p.trade_slug = ? AND p.active = 1 LIMIT 1").bind(path, l.trade_slug).first();

  let html = TEMPLATE;
  const slots = {
    "{{HEAD}}": head(l, t, st),
    "{{CRUMB}}": crumb(l, t, st),
    "{{HERO}}": hero(l, t),
    "{{H1BLOCK}}": h1block(l, t),
    "{{ABOUT}}": about(l, t, st),
    "{{AMEN}}": amen(l),
    "{{LOCHRS}}": lochrs(l),
    "{{FEAT}}": feat(l, t),
    "{{MATCHOPEN}}": matchopen(l, t),
    "{{PLACEHOLDER}}": escAttr(t.service_placeholder || ""),
    "{{CONTACT}}": contact(l),
    "{{CLAIMSTRIP}}": claimstrip(l),
    "{{JSONLD}}": jsonld(l, t),
    "{{BREADCRUMB_SIMILAR}}": breadcrumbSimilar(l, t, st, sim.results || [], pc),
    "{{OPENNOW}}": l.hours_json ? OPENNOW_SCRIPT : "",
    "{{RENTRACK}}": pc ? RENTRACK_SCRIPT : "",
  };
  for (const [k, v] of Object.entries(slots)) html = html.split(k).join(v);
  html = html.split("{{PATH}}").join(l.path);
  html = html.split("{{TRADE_SLUG}}").join(l.trade_slug);
  html = html.split("{{CITY}}").join(l.city);
  return html;
}

export async function lookupRedirect(db, path) {
  const r = await db.prepare("SELECT to_path, status FROM redirects WHERE from_path = ?").bind(path).first();
  return r || null;
}
