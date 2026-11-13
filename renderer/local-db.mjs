// Local D1 stand-in over node:sqlite, exposing the exact prepared-statement
// shape render.mjs uses against env.DB in production:
//   db.prepare(sql).bind(...params).first()  -> row object or null
//   db.prepare(sql).bind(...params).all()    -> { results: [rows] }
// The loader's ytp.db is a plain SQLite file with the D1 schema applied.
import { DatabaseSync } from "node:sqlite";

export function openLocalDb(file) {
  const raw = new DatabaseSync(file, { readOnly: true });
  return {
    prepare(sql) {
      const stmt = raw.prepare(sql);
      let params = [];
      const api = {
        bind(...p) { params = p; return api; },
        async first() { const row = stmt.get(...params); return row === undefined ? null : row; },
        async all() { return { results: stmt.all(...params) }; },
        async run() { return stmt.run(...params); },
      };
      return api;
    },
    close() { raw.close(); },
  };
}
