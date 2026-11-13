#!/usr/bin/env python3
"""Loader: repo directory data -> local SQLite file shaped exactly like D1.

Sources (all in the repo root):
  Spine:    biz-data.json      name, trade, city, state, phone, address, website
            verify-data.json   email, website, domain, facebook (keyed by path)
            search-index.json  slugs, services[], attrs[] (keyed by url)
            cities-index.json  town centers (lat/lng), the pin fallback
  Harvest:  each listing's own static index.html is the only in-repo source for
            rating, review count, hours, and pin coordinates, so the loader
            extracts them mechanically from the page it will later be diffed
            against: the hero stars line, the hourslist, the ytp-lmap-data
            JSON block, and the partnercard article when present. Per-trade
            display constants (label, phrase, schema.org type, hero image,
            match-form placeholder) are harvested from one page per trade.

Re-runnable: rebuilds the database from scratch every run and prints counts
against the source files. No network, no account, no spend.

Usage: python3 load.py [--repo ..] [--db ytp.db]
"""
import argparse, html as html_lib, json, math, os, re, sqlite3, sys
from collections import defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))

RE_LMAP = re.compile(r'id="ytp-lmap-data">(\{.*?\})</script>')
RE_STARS = re.compile(r'<p class="stars">[^<]*? ([0-9.]+) · (\d+) reviews?</p>')
RE_STARS_COUNT_ONLY = re.compile(r'<p class="stars">(\d+) reviews?</p>')
RE_HOURS = re.compile(r'<ul class="hourslist">(.*?)</ul>', re.S)
RE_LI = re.compile(r'<li>(.*?)</li>')
RE_TZ = re.compile(r'id="ytp-opennow" data-tz="([^"]+)"')
RE_CARD = re.compile(r'<article class="partnercard" data-profile="([^"]+)"[^>]*data-surface="([^"]+)"')
RE_CARD_BODY = re.compile(
    r'<article class="partnercard".*?<h3>(.*?)</h3><p>(.*?)</p><p><a href="[^"]*">(.*?)</a></p></article>', re.S)
RE_OGIMG = re.compile(r'<meta property="og:image" content="([^"]+)"')
RE_TITLE = re.compile(r'<title>(.*?)</title>')
RE_OGTITLE = re.compile(r'<meta property="og:title" content="([^"]+)"')
RE_BIZCARD = re.compile(r'<div class="bizcard57">.*?</div>')
RE_FROM = re.compile(r'<h2>From this business</h2><p>(.*?)</p>', re.S)
RE_AMEN = re.compile(r'<div class="amen57">(.*?)</div>', re.S)
RE_GRID = re.compile(r'<div class="grid">(.*?)</div><p><a href="/', re.S)
RE_DESC = re.compile(r'<meta name="description" content="([^"]+)"')
RE_FEAT = re.compile(r'One (.+?) business in .+? gets this spot')
RE_PLACEHOLDER = re.compile(r'id="m-service"[^>]*placeholder="([^"]*)"')
RE_LDJSON = re.compile(r'<script type="application/ld\+json">(\{.*?\})</script>')
RE_ABOUT_STATE = re.compile(r'business in .+?, ([A-Za-z ]+), listed in the YourTownPros')
LD_DENY = {"BreadcrumbList", "ListItem", "PostalAddress", "FAQPage", "Question",
           "Answer", "WebPage", "WebSite", "Organization", "ItemList"}

# State default timezones (towns.tz). Per-town tz is the specced field; until
# the per-town pass lands, the state default is the honest value we have.
STATE_TZ = {"CO": "America/Denver", "UT": "America/Denver", "AZ": "America/Phoenix",
            "PR": "America/Puerto_Rico"}


def cell_of(lat, lng):
    return int(math.floor((lat + 90.0) * 20)) * 7200 + int(math.floor((lng + 180.0) * 20))


def haversine_mi(a, b):
    if a is None or b is None:
        return None
    r = 3958.8
    p1, p2 = math.radians(a[0]), math.radians(b[0])
    dp = math.radians(b[0] - a[0]); dl = math.radians(b[1] - a[1])
    h = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * r * math.asin(math.sqrt(h))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--repo", default=os.path.dirname(HERE))
    ap.add_argument("--db", default=os.path.join(HERE, "ytp.db"))
    args = ap.parse_args()
    repo = args.repo

    biz = json.load(open(os.path.join(repo, "biz-data.json")))
    verify = json.load(open(os.path.join(repo, "verify-data.json")))
    search = json.load(open(os.path.join(repo, "search-index.json")))
    cities = json.load(open(os.path.join(repo, "cities-index.json")))
    search_by_path = {r["url"].strip("/"): r for r in search}
    town_center = {(c["state"], c["cslug"]): (c["lat"], c["lng"]) for c in cities}

    if os.path.exists(args.db):
        os.remove(args.db)
    db = sqlite3.connect(args.db)
    db.executescript(open(os.path.join(HERE, "schema.sql")).read())

    # Towns first (loader needs centers for fallbacks and distances).
    for c in cities:
        db.execute(
            "INSERT OR REPLACE INTO towns(state, city_slug, city, state_slug, lat, lng, tz, listing_count)"
            " VALUES (?,?,?,?,?,?,?,?)",
            (c["state"], c["cslug"], c["city"], c["sslug"], c["lat"], c["lng"],
             STATE_TZ.get(c["state"]), c["count"]))

    trades = {}          # trade_slug -> dict of harvested constants
    states = {}          # state -> (name, slug)
    partner_cards = {}   # (partner_id, trade_slug) -> harvested card content
    counts = {"rated": 0, "hours": 0, "pin": 0, "card": 0}
    rows = []

    for path in sorted(biz):
        rec = biz[path]
        trade_slug, slug = path.split("/", 1)
        si = search_by_path.get(path, {})
        vf = verify.get(path, {})
        page_file = os.path.join(repo, path, "index.html")
        html = open(page_file, encoding="utf-8").read()

        rating = review_count = rating_text = None
        m = RE_STARS.search(html)
        if m:
            rating, review_count = float(m.group(1)), int(m.group(2))
            rating_text = m.group(1)
            counts["rated"] += 1
        else:
            m = RE_STARS_COUNT_ONLY.search(html)
            if m:
                review_count = int(m.group(1))
                counts["count_only"] = counts.get("count_only", 0) + 1
        hours = None; tz = None
        m = RE_HOURS.search(html)
        if m:
            hours = RE_LI.findall(m.group(1))
            counts["hours"] += 1
            tzm = RE_TZ.search(html)
            tz = tzm.group(1) if tzm else STATE_TZ.get(rec["state"])
        lat = lng = None; pin_source = None
        m = RE_LMAP.search(html)
        if m:
            d = json.loads(m.group(1))
            lat, lng = d.get("lat"), d.get("lng")
            if d.get("mode") == "pin":
                pin_source = "pin"; counts["pin"] += 1
            else:
                pin_source = "town_center"
        if lat is None:
            tc = town_center.get((rec["state"], si.get("cslug", "")))
            if tc:
                lat, lng = tc; pin_source = "town_center"

        card = RE_CARD.search(html)
        if card:
            counts["card"] += 1
            db.execute("INSERT OR IGNORE INTO listing_partner_cards(path, partner_id, surface)"
                       " VALUES (?,?,?)", (path, card.group(1), card.group(2)))
            key = (card.group(1), trade_slug)
            if key not in partner_cards:
                cb = RE_CARD_BODY.search(html)
                if cb:
                    partner_cards[key] = (cb.group(1), cb.group(2), cb.group(3))

        # Per-trade constants, harvested once from the first page that has them.
        t = trades.setdefault(trade_slug, {"short_name": rec["trade"]})
        if "og_image" not in t:
            m = RE_OGIMG.search(html)
            if m: t["og_image"] = m.group(1)
        if "label" not in t:
            m = re.search(r'<a href="/%s/">([^<]+)</a>' % re.escape(trade_slug), html)
            if m: t["label"] = m.group(1)
        if "phrase" not in t:
            m = RE_FEAT.search(html)
            if m: t["phrase"] = m.group(1)
        if "singular" not in t:
            m = RE_DESC.search(html)
            if m:
                sm = re.search(r" is an? (.+?) in ", m.group(1))
                if sm: t["singular"] = sm.group(1)
        if "service_placeholder" not in t:
            m = RE_PLACEHOLDER.search(html)
            if m: t["service_placeholder"] = m.group(1)
        if "schema_type" not in t:
            for lm in RE_LDJSON.finditer(html):
                if "#business" not in lm.group(1):
                    continue
                try: ld = json.loads(lm.group(1))
                except Exception: continue
                ty = ld.get("@type")
                if ty:
                    t["schema_type"] = ty; break
        if rec["state"] not in states:
            m = RE_ABOUT_STATE.search(html)
            if m: states[rec["state"]] = (m.group(1), si.get("sslug", ""))

        ogm = RE_OGIMG.search(html)
        image_url = ogm.group(1) if ogm else None
        tm = RE_TITLE.search(html); page_title = tm.group(1) if tm else None
        dm = RE_DESC.search(html); meta_desc = dm.group(1) if dm else None
        om = RE_OGTITLE.search(html); og_title = om.group(1) if om else None
        bcm = RE_BIZCARD.search(html)
        show_site = 1 if (bcm and "Visit their website" in bcm.group(0)) else 0
        crumb_linked = 1 if os.path.exists(os.path.join(
            repo, trade_slug, si.get("sslug", ""), si.get("cslug", ""), "index.html")) else 0
        fm = RE_FROM.search(html); from_business = fm.group(1) if fm else None
        am = RE_AMEN.search(html); amen_html = am.group(1) if am else None
        phone = rec.get("phone") or None
        digits = None
        if phone:
            d = re.sub(r"\D", "", phone)
            digits = "+1" + d if len(d) == 10 else ("+" + d if d else None)
        rows.append((
            path, trade_slug, slug, rec["name"], rec["city"], rec["state"],
            si.get("sslug", ""), si.get("cslug", ""), phone, digits,
            rec.get("address") or None, rec.get("website") or vf.get("website") or None,
            vf.get("domain") or None, vf.get("email") or None, vf.get("facebook") or None,
            rating, review_count, "Google" if rating is not None else None,
            json.dumps(hours) if hours else None, tz if hours else None,
            lat, lng, pin_source, cell_of(lat, lng) if lat is not None else None,
            rating_text,
            image_url, page_title, meta_desc, og_title, show_site, crumb_linked,
            from_business, amen_html,
            json.dumps(si.get("services", [])), json.dumps(si.get("attrs", [])),
        ))

    db.executemany(
        "INSERT INTO listings(path, trade_slug, slug, name, city, state, state_slug, city_slug,"
        " phone, phone_digits, address, website, website_domain, email, facebook, rating,"
        " review_count, rating_source, hours_json, hours_tz, lat, lng, pin_source, cell, rating_text,"
        " image_url, page_title, meta_desc, og_title, show_website_link, crumb_linked, from_business, amen_html, services_json, attrs_json)"
        " VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
        rows)

    for slug_, t in sorted(trades.items()):
        db.execute(
            "INSERT INTO trades(trade_slug, label, short_name, phrase, singular, schema_type,"
            " og_image, service_placeholder) VALUES (?,?,?,?,?,?,?,?)",
            (slug_, html_lib.unescape(t.get("label", t["short_name"])), t["short_name"],
             html_lib.unescape(t["phrase"]) if t.get("phrase") else None,
             html_lib.unescape(t["singular"]) if t.get("singular") else None,
             t.get("schema_type"), t.get("og_image"),
             html_lib.unescape(t["service_placeholder"]) if t.get("service_placeholder") else None))
    for st, (nm, sl) in sorted(states.items()):
        db.execute("INSERT INTO states(state, name, state_slug) VALUES (?,?,?)", (st, nm, sl))
    for (pid, tsl), (nm, bl, lt) in sorted(partner_cards.items()):
        db.execute("INSERT INTO partner_cards(partner_id, trade_slug, profile_path, name, blurb, link_text)"
                   " VALUES (?,?,?,?,?,?)",
                   (pid, tsl, "natural-skincare/renaud-naturals-loveland",
                    html_lib.unescape(nm), html_lib.unescape(bl), html_lib.unescape(lt)))

    # Similar-pros edges are harvested from each page's printed rail, in
    # order. The static rails were written by different build versions over
    # mixed-era datasets, so no rule over today's data reproduces them; the
    # rail as printed is the data. (When data versions move to D1, edges get
    # computed by the current People Also Viewed rule instead: same trade
    # within 10 miles on effective distance, town first, 3 to 5 entries.)
    # Listings whose page has no rail (the hand-built profiles) get no edges.
    edges = 0
    for r in rows:
        path = r[0]
        page_file = os.path.join(repo, path, "index.html")
        html = open(page_file, encoding="utf-8").read()
        i = html.find("Similar pros nearby")
        if i < 0:
            continue
        gm = RE_GRID.search(html, i)
        cards = re.findall(r'<div class="card"><h3><a href="/([^"]+)/">', gm.group(1)) if gm else []
        me = db.execute("SELECT lat, lng FROM listings WHERE path=?", (path,)).fetchone()
        for rank, sp in enumerate(cards, 1):
            other = db.execute("SELECT lat, lng FROM listings WHERE path=?", (sp,)).fetchone()
            d = None
            if me and other and me[0] is not None and other[0] is not None:
                d = haversine_mi((me[0], me[1]), (other[0], other[1]))
            db.execute("INSERT INTO similar_pros(path, similar_path, rank, distance_mi)"
                       " VALUES (?,?,?,?)", (path, sp, rank, round(d, 1) if d is not None else None))
            edges += 1

    db.execute("INSERT INTO meta(key, value) VALUES ('source_biz_rows', ?)", (str(len(biz)),))
    db.execute("INSERT INTO meta(key, value) VALUES ('source_verify_rows', ?)", (str(len(verify)),))
    db.execute("INSERT INTO meta(key, value) VALUES ('source_search_rows', ?)", (str(len(search)),))
    db.commit()

    n = db.execute("SELECT COUNT(*) FROM listings").fetchone()[0]
    print(f"listings loaded: {n} (biz-data.json rows: {len(biz)}, verify: {len(verify)}, search: {len(search)})")
    print(f"trades: {db.execute('SELECT COUNT(*) FROM trades').fetchone()[0]}, "
          f"towns: {db.execute('SELECT COUNT(*) FROM towns').fetchone()[0]}, "
          f"states: {db.execute('SELECT COUNT(*) FROM states').fetchone()[0]}")
    print(f"similar_pros edges: {edges}")
    print(f"listing_partner_cards: {db.execute('SELECT COUNT(*) FROM listing_partner_cards').fetchone()[0]}"
          f" (pages carrying a card: {counts['card']})")
    print(f"coverage: rated {counts['rated']}, with hours {counts['hours']}, pinned {counts['pin']},"
          f" town-center fallback {n - counts['pin']}")
    miss = db.execute("SELECT COUNT(*) FROM listings WHERE lat IS NULL").fetchone()[0]
    print(f"listings with no coordinates at all: {miss}")
    incomplete = [s for s, t in sorted(trades.items())
                  if not all(t.get(k) for k in ('label', 'phrase', 'singular', 'schema_type', 'og_image', 'service_placeholder'))]
    print(f"trades missing a harvested constant: {incomplete or 'none'}")
    db.close()


if __name__ == "__main__":
    main()
