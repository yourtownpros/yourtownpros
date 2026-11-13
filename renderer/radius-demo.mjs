// Radius search proof for the schema's bounding-box design (brief risk 1).
// A radius query enumerates the grid cells its bounding box overlaps, reads
// only the candidate rows in those cells through the (cell, trade_slug)
// index, and runs the exact haversine on the candidates. Rows scanned is
// bounded by the box, never by the 10,529 row table (117k at full build).
//
// Usage: node radius-demo.mjs [lat] [lng] [miles] [trade_slug]
import { DatabaseSync } from "node:sqlite";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const [lat, lng, miles, trade] = [
  Number(process.argv[2]) || 39.863501744037,   // Cuevas Brothers Plumbers pin
  Number(process.argv[3]) || -105.051030997115,
  Number(process.argv[4]) || 10,
  process.argv[5] || "plumbers",
];

export function cellsForBox(latMin, latMax, lngMin, lngMax) {
  const cells = [];
  const la0 = Math.floor((latMin + 90) * 20), la1 = Math.floor((latMax + 90) * 20);
  const lo0 = Math.floor((lngMin + 180) * 20), lo1 = Math.floor((lngMax + 180) * 20);
  for (let a = la0; a <= la1; a++) for (let o = lo0; o <= lo1; o++) cells.push(a * 7200 + o);
  return cells;
}

const dLat = miles / 69.0;
const dLng = miles / (69.0 * Math.cos((lat * Math.PI) / 180));
const cells = cellsForBox(lat - dLat, lat + dLat, lng - dLng, lng + dLng);

const db = new DatabaseSync(join(HERE, "ytp.db"), { readOnly: true });
const total = db.prepare("SELECT COUNT(*) n FROM listings").get().n;
const plan = db.prepare(
  `EXPLAIN QUERY PLAN SELECT path FROM listings WHERE cell IN (${cells.map(() => "?").join(",")}) AND trade_slug = ?`)
  .all(...cells, trade).map((r) => r.detail).join(" | ");
const candidates = db.prepare(
  `SELECT path, name, city, lat, lng FROM listings WHERE cell IN (${cells.map(() => "?").join(",")}) AND trade_slug = ?`)
  .all(...cells, trade);

const R = 3958.8;
const hav = (a, b) => {
  const p1 = (a[0] * Math.PI) / 180, p2 = (b[0] * Math.PI) / 180;
  const dp = ((b[0] - a[0]) * Math.PI) / 180, dl = ((b[1] - a[1]) * Math.PI) / 180;
  const h = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};
const hits = candidates
  .map((c) => ({ ...c, mi: hav([lat, lng], [c.lat, c.lng]) }))
  .filter((c) => c.mi <= miles)
  .sort((a, b) => a.mi - b.mi);

console.log(`center ${lat}, ${lng}; radius ${miles} mi; trade ${trade}`);
console.log(`bounding box overlaps ${cells.length} grid cells`);
console.log(`query plan: ${plan}`);
console.log(`candidate rows read: ${candidates.length} of ${total} total listings`);
console.log(`within ${miles} mi after exact distance check: ${hits.length}`);
for (const h of hits.slice(0, 8)) console.log(`  ${h.mi.toFixed(2)} mi  ${h.name} (${h.city})`);
db.close();
