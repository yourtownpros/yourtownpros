#!/usr/bin/env python3
"""Extract the Worker template from the static reference pages.

The static listing page is one tight template: a diff of two unrelated
listings (Cuevas Brothers Plumbers, Westminster and Fox Cleaners, Lone Tree)
differs in only 15 blocks. This script takes the Cuevas page as the shell,
replaces each variable block with a {{TOKEN}}, harvests the listing
independent open-now script from the Fox page (it only appears on pages with
hours), and emits template.mjs. Re-run after any static template version
ships; every anchor is asserted so a changed shell fails loudly here, not
in the shadow diff.
"""
import json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)
REF = os.path.join(REPO, "plumbers/cuevas-brothers-plumbers-westminster/index.html")
REF2 = os.path.join(REPO, "cleaners/fox-cleaners-lone-tree/index.html")
PATH = "plumbers/cuevas-brothers-plumbers-westminster"


def fail(msg):
    sys.exit("build-template: " + msg)


def main():
    text = open(REF, encoding="utf-8").read()
    lines = text.split("\n")

    def replace_line(pred, token, what):
        hits = [i for i, ln in enumerate(lines) if pred(ln)]
        if len(hits) != 1:
            fail(f"{what}: anchor matched {len(hits)} lines")
        lines[hits[0]] = token

    replace_line(lambda l: "<title>" in l, "{{HEAD}}", "head")
    replace_line(lambda l: l.startswith('<main class="wrap">'), "{{CRUMB}}", "crumb")
    replace_line(lambda l: l.startswith('<div class="bizhero57">'), "{{HERO}}", "hero")
    replace_line(lambda l: l.startswith("<h1>"), "{{H1BLOCK}}", "h1 block")
    replace_line(lambda l: "<h2>About this listing</h2>" in l, "{{ABOUT}}", "about")
    replace_line(lambda l: l.startswith('<div class="lochrs57">'), "{{LOCHRS}}", "location/hours")
    replace_line(lambda l: l.startswith('<div class="feat">'), "{{FEAT}}", "featured slot")
    replace_line(lambda l: l.startswith('<div class="bizcard57">'), "{{CONTACT}}", "contact card")
    replace_line(lambda l: l.startswith('<div class="claimstrip">'), "{{CLAIMSTRIP}}", "claim strip")
    replace_line(lambda l: '"@id"' in l and "ld+json" in l, "{{JSONLD}}", "localbusiness json-ld")
    bc_hits = [i for i, l in enumerate(lines) if "BreadcrumbList" in l]
    if len(bc_hits) != 1:
        fail("breadcrumb + similar: anchor matched %d lines" % len(bc_hits))
    bc_line = lines[bc_hits[0]]
    cut = bc_line.find('<script src="https://cdn.jsdelivr.net/npm/leaflet')
    if cut < 0:
        fail("breadcrumb line: leaflet script anchor missing")
    lines[bc_hits[0]] = "{{BREADCRUMB_SIMILAR}}" + bc_line[cut:]

    # The blank line after About becomes the amenities slot: empty for most
    # listings, the amen57 block line for enriched ones.
    ai = [i for i, l in enumerate(lines) if l == "{{ABOUT}}"]
    if len(ai) != 1 or lines[ai[0] + 1] != "":
        fail("amen slot: blank line after About not found")
    lines[ai[0] + 1] = "{{AMEN}}"

    # Match block: the match div line through the hidden-inputs line.
    start = [i for i, l in enumerate(lines) if l.startswith('<div class="match" id="match">')]
    if len(start) != 1:
        fail("match block start anchor")
    start = start[0]
    end = [i for i, l in enumerate(lines) if 'name="_next"' in l and i > start]
    if not end:
        fail("match block end anchor")
    end = end[0]
    matchopen = "\n".join(lines[start:end + 1])
    lines[start:end + 1] = ["{{MATCHOPEN}}"]

    # Match form service placeholder is trade specific; tokenise its value.
    for i, l in enumerate(lines):
        if 'id="m-service"' in l and "placeholder=" in l:
            lines[i] = re.sub(r'placeholder="[^"]*"', 'placeholder="{{PLACEHOLDER}}"', l)
            break
    else:
        fail("m-service placeholder anchor")

    text = "\n".join(lines)

    # Open-now script: insert the token where Fox carries the block, which is
    # immediately before the GoatCounter script element.
    anchor = "<script>\n/* v5.5: GoatCounter action events. */"
    if text.count(anchor) != 1:
        fail("goatcounter anchor")
    text = text.replace(anchor, "{{OPENNOW}}" + anchor)

    # Remaining per-listing strings inside otherwise constant scripts.
    if text.count(PATH) < 5:
        fail("path occurrences unexpectedly few")
    text = text.replace(PATH, "{{PATH}}")
    text = text.replace('vertical:"plumbers"', 'vertical:"{{TRADE_SLUG}}"')
    text = text.replace('city:"Westminster"', 'city:"{{CITY}}"')

    # The v5.9.25 Renaud tracking snippet rides on pages that carry the
    # partner card; insert its token after the GoatCounter script element.
    gc_anchor = 'src="//gc.zgo.at/count.js"></script></body></html>'
    if text.count(gc_anchor) != 1:
        fail("goatcounter closing anchor")
    text = text.replace(gc_anchor, 'src="//gc.zgo.at/count.js"></script>{{RENTRACK}}</body></html>')

    fox = open(REF2, encoding="utf-8").read()
    m = re.search(r"<script>\n/\* v5\.4-open-now \*/.*?</script>", fox, re.S)
    if not m:
        fail("open-now script not found in Fox page")
    opennow = m.group(0)
    if "{{" in opennow:
        fail("open-now script contains a token-like string")

    # Head line sub-template: the render rebuilds the head from tokens, so
    # keep the reference head here for render.mjs to pattern against.
    head_line = [l for l in open(REF, encoding="utf-8").read().split("\n") if "<title>" in l][0]

    spa = open(os.path.join(REPO, "med-spas/18-spa-johnstown/index.html"), encoding="utf-8").read()
    m = re.search(r"<script>\n/\* Renaud featured tracking\..*?</script>", spa, re.S)
    if not m:
        fail("renaud tracking script not found in 18 Spa page")
    rentrack = m.group(0)

    with open(os.path.join(HERE, "template.mjs"), "w", encoding="utf-8") as f:
        f.write("// Generated by build-template.py from the v5.9.25 static shell.\n")
        f.write("// Do not edit by hand; re-run build-template.py after a shell change.\n")
        f.write("export const TEMPLATE = " + json.dumps(text) + ";\n")
        f.write("export const OPENNOW_SCRIPT = " + json.dumps(opennow) + ";\n")
        f.write("export const RENTRACK_SCRIPT = " + json.dumps(rentrack) + ";\n")
        f.write("export const HEAD_REFERENCE = " + json.dumps(head_line) + ";\n")
    print(f"template.mjs written: shell {len(text)} bytes, open-now {len(opennow)} bytes, rentrack {len(rentrack)} bytes")


if __name__ == "__main__":
    main()
