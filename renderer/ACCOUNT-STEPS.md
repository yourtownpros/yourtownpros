# Cloudflare account steps to take the listing renderer live

Every step below is an account action on the **Cloudflare** account. None of
them has been performed by this build. The main agent relays them one at a
time; each names the exact screen and value. Free tier only; no step spends
money, and the $5 Workers Paid decision stays flagged until a brief section 4
trigger fires.

Preparation that happens on our side first (no account needed): the
renderer-preview branch is pushed, `python3 renderer/load.py` has produced a
fresh ytp.db, and the local shadow diff is clean on the agreed sample.

1. Cloudflare: Workers & Pages, create a D1 database named `yourtownpros-listings` (D1, Create database, name it exactly that) and report the database ID shown on its page.
2. Cloudflare: in that D1 database, open Console and run the full contents of `renderer/schema.sql` (paste the file, Execute) so all tables and indexes exist empty.
3. Cloudflare: load the data with wrangler from the repo checkout (the main agent gives the exact command at the time: it exports the local ytp.db tables and imports them into the D1 database from step 1), then report the row counts the import prints.
4. Cloudflare: Workers & Pages, Create application, Workers, create a Worker named `yourtownpros-listings` (deploy the placeholder once so it exists), and report its workers.dev URL.
5. Cloudflare: in that Worker's Settings, Variables and bindings, add a D1 database binding with variable name `DB` pointing at the database from step 1 (the main agent then deploys `renderer/worker.mjs` code over it with wrangler).
6. Cloudflare: in the yourtownpros.com zone, Workers tab, Worker Routes, add one route per trade in the form `yourtownpros.com/<trade>/*` assigned to the `yourtownpros-listings` Worker, with the route's failure mode set to **Fail open**; pilot with one low-traffic trade first (brief step 2 of cutover), the rest after its verification battery passes.
7. Cloudflare: confirm on the zone that Bot Fight Mode (Security, Bots), AI bot blocking (AI Crawl Control), and I'm Under Attack mode are all **Off**, and report the three states (standing guardrail, brief section 6).
8. Cloudflare: after the 48 hour watch passes, nothing further is needed for the renderer; the static listing files are deleted from the repo only in the later cleanup step, which is a GitHub action, not a Cloudflare one.
