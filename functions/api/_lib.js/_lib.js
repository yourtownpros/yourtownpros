// Shared helpers for the /api/submit routes.
// Form ingestion build, roadmap item 9 phase 2.
// Design source: rankly-plan/form-ingestion-build-plan-2026-11-24.md, sections 2 and 4.
//
// The underscore prefix means Cloudflare Pages does not treat this file as a
// route. Every route file under functions/api/submit/ imports from here, so
// the siteverify call, the audit-field builder, the session check, and the
// Supabase insert each exist in exactly one place.
//
// Secrets (TURNSTILE_SECRET_KEY, SUPABASE_SERVICE_ROLE_KEY) are read from the
// Pages environment only. They never appear in code, in this repo, or in any
// document. If a secret is missing the helpers fail closed.

export const SUPABASE_URL = "https://klbgkidcdrlqsvrgfafv.supabase.co";

// Records which published wording a submission was made under. Bump this when
// the terms eligibility clause or the privacy "Adults only" wording changes.
export const CONSENT_VERSION = "2026-11-24";

const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const SITEVERIFY_TIMEOUT_MS = 5000;
const SUPABASE_TIMEOUT_MS = 10000;

// Visitor-facing copy, from build plan section 2.4. The route never returns
// database or provider error text to the browser.
export const COPY = {
  turnstileFailed:
    "We could not confirm that this is a person. Wait for the check above the button to finish, then try again.",
  unavailable:
    "Something went wrong on our side and your information was not sent. Please try again in a few minutes, or email us instead.",
  generic:
    "Something went wrong on our side and your information was not sent. Please try again in a few minutes, or email us instead."
};

function jsonResponse(status, obj) {
  return new Response(JSON.stringify(obj), {
    status: status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}

// Success shape is exactly { ok: true } plus any extras the caller adds.
export function jsonOk(extra) {
  const body = { ok: true };
  if (extra) {
    for (const k of Object.keys(extra)) body[k] = extra[k];
  }
  return jsonResponse(200, body);
}

// Failure shape is { ok: false, error: "<code>", message: "<plain text>" }.
// Field-level failures also carry a fields map keyed by the client form's
// err-* paragraph keys, so the client can render them with its existing
// showErrors flow (build plan section 2.4).
export function jsonFail(status, code, message, extra) {
  const body = { ok: false, error: code, message: message };
  if (extra) {
    for (const k of Object.keys(extra)) body[k] = extra[k];
  }
  return jsonResponse(status, body);
}

async function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(function () {
    controller.abort();
  }, timeoutMs);
  try {
    return await fetch(url, Object.assign({}, options, { signal: controller.signal }));
  } finally {
    clearTimeout(timer);
  }
}

// The visitor IP as Cloudflare sees it. Used for siteverify and, hashed, for
// the audit field. The raw value is never stored.
export function clientIp(request) {
  return request.headers.get("CF-Connecting-IP") || "";
}

async function sha256Hex(text) {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", data);
  const bytes = new Uint8Array(digest);
  let out = "";
  for (let i = 0; i < bytes.length; i++) {
    out += bytes[i].toString(16).padStart(2, "0");
  }
  return out;
}

// Audit fields for one migrated insert row (build plan section 2.3). Every
// value is set here, server-side; nothing is accepted from the request body.
//
// ip_hash is the unsalted SHA-256 of the visitor IP (decision recorded in the
// ship 1 brief; the roadmap wording allows the unsalted hash, and it keeps
// abuse correlation possible across rows). The raw IP is never stored.
// page_url comes from the Referer header when it is same-origin with the
// request; otherwise from a client-sent page field that must be a plain
// same-origin path. A raw unvalidated header is never echoed into the row.
export async function buildAuditFields(request, body) {
  const ip = clientIp(request);
  let pageUrl = "";
  const referer = request.headers.get("Referer") || "";
  if (referer) {
    try {
      const ref = new URL(referer);
      const self = new URL(request.url);
      if (ref.origin === self.origin) {
        pageUrl = (ref.pathname + ref.search).slice(0, 500);
      }
    } catch (e) {
      pageUrl = "";
    }
  }
  if (!pageUrl && body && typeof body.page === "string") {
    const p = body.page;
    if (p.length <= 500 && p.charAt(0) === "/" && p.charAt(1) !== "/") {
      pageUrl = p;
    }
  }
  return {
    ip_hash: ip ? await sha256Hex(ip) : "",
    user_agent: (request.headers.get("User-Agent") || "").slice(0, 300),
    page_url: pageUrl,
    consent_version: CONSENT_VERSION
  };
}

// Server-side Turnstile check (build plan section 2.2 steps 5 and 6).
// Fail-closed: a failed check returns 403, and a timeout, a network error, or
// a missing secret returns 503. There is no path that continues past a check
// that did not pass. The response hostname must be the production domain or a
// pages.dev preview host, and an action, when the widget ever sets one, must
// match the form the route serves.
export async function verifyTurnstile(env, token, remoteIp, expectedAction) {
  if (!env.TURNSTILE_SECRET_KEY) {
    console.error("verifyTurnstile: TURNSTILE_SECRET_KEY is not set");
    return { ok: false, status: 503, code: "turnstile_unavailable", message: COPY.unavailable };
  }
  const form = new URLSearchParams();
  form.set("secret", env.TURNSTILE_SECRET_KEY);
  form.set("response", token);
  if (remoteIp) form.set("remoteip", remoteIp);
  let data = null;
  try {
    const res = await fetchWithTimeout(
      SITEVERIFY_URL,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: form.toString()
      },
      SITEVERIFY_TIMEOUT_MS
    );
    data = await res.json();
  } catch (e) {
    console.error("verifyTurnstile: siteverify request failed");
    return { ok: false, status: 503, code: "turnstile_unavailable", message: COPY.unavailable };
  }
  if (!data || data.success !== true) {
    const codes = data && data["error-codes"] ? data["error-codes"].join(",") : "no-response";
    console.error("verifyTurnstile: check failed: " + codes);
    return { ok: false, status: 403, code: "turnstile_failed", message: COPY.turnstileFailed };
  }
  const host = typeof data.hostname === "string" ? data.hostname : "";
  const hostOk =
    host === "yourtownpros.com" ||
    host === "yourtownpros.pages.dev" ||
    host.endsWith(".yourtownpros.pages.dev");
  if (!hostOk) {
    console.error("verifyTurnstile: hostname mismatch: " + host);
    return { ok: false, status: 403, code: "turnstile_failed", message: COPY.turnstileFailed };
  }
  if (data.action && expectedAction && data.action !== expectedAction) {
    console.error("verifyTurnstile: action mismatch: " + data.action);
    return { ok: false, status: 403, code: "turnstile_failed", message: COPY.turnstileFailed };
  }
  return { ok: true };
}

// Validates a visitor's Supabase session access token against Supabase Auth
// and returns the user it belongs to, or null. Routes that require sign-in
// take the row's user_id from this result only, never from the request body
// (build plan section 2.2 step 10).
export async function validateSession(env, accessToken) {
  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("validateSession: SUPABASE_SERVICE_ROLE_KEY is not set");
    return null;
  }
  if (typeof accessToken !== "string" || accessToken.length === 0) {
    return null;
  }
  try {
    const res = await fetchWithTimeout(
      SUPABASE_URL + "/auth/v1/user",
      {
        method: "GET",
        headers: {
          apikey: env.SUPABASE_SERVICE_ROLE_KEY,
          Authorization: "Bearer " + accessToken
        }
      },
      SUPABASE_TIMEOUT_MS
    );
    if (!res.ok) return null;
    const user = await res.json();
    if (!user || typeof user.id !== "string" || user.id.length === 0) return null;
    return { id: user.id, email: typeof user.email === "string" ? user.email : "" };
  } catch (e) {
    console.error("validateSession: auth request failed");
    return null;
  }
}

// Inserts one row through Supabase REST with the service role key and
// return=minimal. Returns true only when the insert was accepted. The
// provider's error detail is logged server-side and never returned to the
// browser (build plan section 2.2 step 11).
export async function insertRow(env, table, row) {
  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("insertRow: SUPABASE_SERVICE_ROLE_KEY is not set");
    return false;
  }
  try {
    const res = await fetchWithTimeout(
      SUPABASE_URL + "/rest/v1/" + table,
      {
        method: "POST",
        headers: {
          apikey: env.SUPABASE_SERVICE_ROLE_KEY,
          Authorization: "Bearer " + env.SUPABASE_SERVICE_ROLE_KEY,
          "Content-Type": "application/json",
          Prefer: "return=minimal"
        },
        body: JSON.stringify(row)
      },
      SUPABASE_TIMEOUT_MS
    );
    if (!res.ok) {
      console.error("insertRow: insert into " + table + " rejected with status " + res.status);
      return false;
    }
    return true;
  } catch (e) {
    console.error("insertRow: insert into " + table + " request failed");
    return false;
  }
}

// Reads a body field as a trimmed string. Returns "" for anything that is not
// a string, so a wrong-typed field fails validation instead of throwing.
export function cleanString(value) {
  return typeof value === "string" ? value.trim() : "";
}
