// Shadow-diff harness: render Colorado listings from the local D1-shaped
// database and byte-diff them against the static files in the repo.
// This is the local, small version of brief step 4 (shadow mode): the full
// 500-page diff runs later against the deployed Worker on a shadow hostname.
//
// Usage: node shadow-diff.mjs [--limit 50] [--report shadow-report.md]
// Writes the report and prints a summary. Differing regions are named by the
// page element they belong to, never just counted.

import { DatabaseSync } from "node:sqlite";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { openLocalDb } from "./local-db.mjs";
import { renderListing } from "./render.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = dirname(HERE);
const args = process.argv.slice(2);
const limit = Number(args[args.indexOf("--limit") + 1]) || 50;
const reportPath = args.includes("--report") ? args[args.indexOf("--report") + 1] : join(HERE, "shadow-report.md");

const MUST = [
  "plumbers/cuevas-brothers-plumbers-westminster",   // rated, pinned, no hours
  "cleaners/fox-cleaners-lone-tree",                 // unrated, hours, town-center map
  "med-spas/18-spa-johnstown",                       // carries the Renaud partner card
  "natural-skincare/renaud-naturals-loveland",       // partner profile (special page)
  "website-design/rankly-design-westminster",        // hand-built page (special)
];

function pickSample(raw) {
  const picked = new Map();
  for (const p of MUST) picked.set(p, "required");
  const trades = raw.prepare("SELECT DISTINCT trade_slug FROM listings WHERE state='CO' ORDER BY trade_slug").all();
  for (const { trade_slug } of trades) {
    for (const cond of ["rating IS NOT NULL", "rating IS NULL"]) {
      const row = raw.prepare(
        `SELECT path FROM listings WHERE state='CO' AND trade_slug=? AND ${cond} ORDER BY path LIMIT 1`)
        .get(trade_slug);
      if (row && !picked.has(row.path)) picked.set(row.path, "stratified");
    }
  }
  const fill = raw.prepare(
    "SELECT path FROM listings WHERE state='CO' ORDER BY (hours_json IS NOT NULL) DESC," +
    " (rating IS NOT NULL) DESC, path").all();
  for (const { path } of fill) {
    if (picked.size >= limit) break;
    if (!picked.has(path)) picked.set(path, "variety fill");
  }
  return [...picked.entries()].slice(0, Math.max(limit, MUST.length));
}

const ELEMENTS = [
  [/<title>/, "head (title, meta description, og)"],
  [/^<main /, "breadcrumb"],
  [/bizhero57/, "hero image"],
  [/^<h1>/, "h1, pills, stars line"],
  [/About this listing/, "about paragraph"],
  [/lochrs57|ytp-lmap-data|hourslist|hoursnone/, "map, address and hours block"],
  [/class="feat"/, "featured spot slot"],
  [/class="match"|data-match-slug|name="_subject"/, "match form opening"],
  [/m-service/, "match form service placeholder"],
  [/bizcard57/, "contact card"],
  [/claimstrip/, "claim strip"],
  [/BreadcrumbList/, "breadcrumb JSON-LD and similar pros rail"],
  [/partnercard/, "partner card"],
  [/"@id"/, "LocalBusiness JSON-LD"],
  [/v5\.4-open-now/, "open-now script"],
  [/var slug=|vertical:|business_slug/, "per-page JS config"],
  [/ytp-highlights|suggestbox|data-slug/, "highlights and suggest-an-edit slugs"],
  [/<script/, "other script block"],
  [/<style|\{/, "CSS block"],
];
function elementOf(line) {
  for (const [re, name] of ELEMENTS) if (re.test(line)) return name;
  return "other body content";
}

// Small LCS line diff; pages are about 1,200 lines, so the table is fine.
function diffLines(a, b) {
  const n = a.length, m = b.length;
  const dp = new Uint32Array((n + 1) * (m + 1));
  for (let i = n - 1; i >= 0; i--)
    for (let j = m - 1; j >= 0; j--)
      dp[i * (m + 1) + j] = a[i] === b[j] ? dp[(i + 1) * (m + 1) + j + 1] + 1
        : Math.max(dp[(i + 1) * (m + 1) + j], dp[i * (m + 1) + j + 1]);
  const changed = [];
  let i = 0, j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) { i++; j++; }
    else if (dp[(i + 1) * (m + 1) + j] >= dp[i * (m + 1) + j + 1]) { changed.push(a[i]); i++; }
    else { changed.push(b[j]); j++; }
  }
  while (i < n) changed.push(a[i++]);
  while (j < m) changed.push(b[j++]);
  return changed;
}

const raw = new DatabaseSync(join(HERE, "ytp.db"), { readOnly: true });
const sample = pickSample(raw);
raw.close();
const db = openLocalDb(join(HERE, "ytp.db"));

const results = [];
let totalMs = 0;
for (const [path, why] of sample) {
  const t0 = performance.now();
  const rendered = await renderListing(db, path);
  totalMs += performance.now() - t0;
  const staticHtml = readFileSync(join(REPO, path, "index.html"), "utf8");
  if (rendered === staticHtml) {
    results.push({ path, why, identical: true, elements: [] });
    continue;
  }
  const changed = diffLines(staticHtml.split("\n"), rendered.split("\n"));
  const elements = [...new Set(changed.map(elementOf))];
  results.push({ path, why, identical: false, elements,
    staticBytes: Buffer.byteLength(staticHtml), renderedBytes: Buffer.byteLength(rendered),
    changedLines: changed.length });
}
db.close();

const identical = results.filter((r) => r.identical);
const differing = results.filter((r) => !r.identical);
const freq = {};
for (const r of differing) for (const e of r.elements) freq[e] = (freq[e] || 0) + 1;

const out = [];
out.push("# Shadow diff, local sample (renderer preview build)");
out.push("");
out.push(`Sample: ${results.length} Colorado listings rendered from the local D1-shaped database and byte-diffed against the static files in this repo.`);
out.push(`Identical: ${identical.length} of ${results.length}. Differing: ${differing.length}.`);
out.push(`Average local render time: ${(totalMs / results.length).toFixed(2)} ms per page (Node on this VM; Workers CPU is measured in shadow mode later, brief step 4).`);
out.push("");
out.push("## Differing elements, by frequency");
out.push("");
for (const [e, n] of Object.entries(freq).sort((a, b) => b[1] - a[1])) out.push(`- ${e}: ${n} pages`);
out.push("");
out.push("## Per page");
out.push("");
for (const r of results) {
  if (r.identical) { out.push(`- IDENTICAL ${r.path} (${r.why})`); continue; }
  out.push(`- DIFFERS ${r.path} (${r.why}): static ${r.staticBytes} B, rendered ${r.renderedBytes} B, ${r.changedLines} changed lines; elements: ${r.elements.join("; ")}`);
}
out.push("");
out.push("Known special pages in the sample: natural-skincare/renaud-naturals-loveland and website-design/rankly-design-westminster are hand-built profiles without the standard match form or featured slot (their trades have no harvested phrase or placeholder), so they are expected to differ until their profiles get their own templates.");
writeFileSync(reportPath, out.join("\n") + "\n");

console.log(`sample ${results.length}: identical ${identical.length}, differing ${differing.length}`);
console.log(`avg render ${(totalMs / results.length).toFixed(2)} ms`);
for (const [e, n] of Object.entries(freq).sort((a, b) => b[1] - a[1])) console.log(`  differs in ${e}: ${n}`);
console.log(`report: ${reportPath}`);
