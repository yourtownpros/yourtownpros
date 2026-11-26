// POST /api/submit/claim
// Form ingestion build, roadmap item 9 phase 2, ship 1 (the route, dark).
// Design source: rankly-plan/form-ingestion-build-plan-2026-11-24.md,
// sections 2.2, 2.3, 2.4, and 3.2.
//
// No form points at this route yet. Ship 2 switches the claim form (the
// /claim/ page and the /for-business/ embed) over to it. Until then this file
// exists so the path can be verified end-to-end on preview and production
// with hand-sent requests.
//
// The flow follows build plan section 2.2 exactly: JSON body only, honeypot,
// token presence, siteverify, session check, field validation, affirmation
// gate, server-side row assembly, service role insert. Every failure inserts
// nothing. The status is forced to "pending" here and is never taken from
// the request body. The Turnstile token is verified and then discarded; it
// is never written to the database.

import {
  COPY,
  buildAuditFields,
  cleanString,
  clientIp,
  insertRow,
  jsonFail,
  jsonOk,
  validateSession,
  verifyTurnstile
} from "../_lib.js";

const VERIFY_METHODS = ["email", "website", "facebook", "document"];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SLUG_RE = /^[A-Za-z0-9][A-Za-z0-9\-_/]*$/;
const CODE_RE = /^[A-Za-z0-9-]*$/;

// Length caps. The live claim form carries no maxlength attributes (checked
// against claim/index.html on Nov 26, 2026), so these are route-side caps
// chosen for this build, listed in the ship 1 brief.
const LIMITS = {
  business_slug: 200,
  business_name: 300,
  contact_name: 200,
  contact_email: 254,
  contact_phone: 40,
  relationship: 120,
  verify_code: 64,
  document_path: 400,
  notes: 1000
};

const TOO_LONG = "That entry is too long. Shorten it and try again.";

export async function onRequestPost(context) {
  return handleClaim(context);
}

// Any method other than POST is refused with a JSON 405. POST is handled by
// onRequestPost above; Pages dispatches it there first.
export async function onRequest(context) {
  if (context.request.method === "POST") return handleClaim(context);
  return jsonFail(405, "method_not_allowed", "This address only accepts a submitted form.");
}

async function handleClaim(context) {
  const request = context.request;
  const env = context.env;

  // Step 2: a POST with a JSON body, nothing else.
  let body = null;
  try {
    body = await request.json();
  } catch (e) {
    return jsonFail(400, "bad_json", COPY.generic);
  }
  if (!body || typeof body !== "object") {
    return jsonFail(400, "bad_json", COPY.generic);
  }

  // Step 3: honeypot. A filled company_website means a bot; answer with the
  // success shape and insert nothing, so the bot keeps its illusion.
  if (typeof body.company_website === "string" && body.company_website.trim() !== "") {
    return jsonOk();
  }

  // Step 4: token presence. A missing or empty token is a hard failure.
  const token = cleanString(body.turnstile_token);
  if (!token) {
    return jsonFail(400, "turnstile_missing", COPY.turnstileFailed);
  }

  // Steps 5 and 6: siteverify, fail-closed.
  const verdict = await verifyTurnstile(env, token, clientIp(request), "claim");
  if (!verdict.ok) {
    return jsonFail(verdict.status, verdict.code, verdict.message);
  }

  // Claims require sign-in today and keep that gate. The route re-checks the
  // session and takes user_id from the validated token only (step 10).
  const user = await validateSession(env, body.access_token);
  if (!user) {
    return jsonFail(
      401,
      "unauthorized",
      "Sign in with Google to send your claim, then try again."
    );
  }

  // Step 7: field validation, mirroring the live claim form's own rules and
  // messages. Field errors are keyed by the client form's err-* paragraph
  // keys (pick, verify, name, phone, email) for its showErrors flow.
  const fields = {};
  const businessSlug = cleanString(body.business_slug);
  const businessName = cleanString(body.business_name);
  const contactName = cleanString(body.contact_name);
  const contactEmail = cleanString(body.contact_email);
  const contactPhone = cleanString(body.contact_phone);
  const relationship = cleanString(body.relationship) || "Owner";
  const verifyMethod = cleanString(body.verify_method);
  let verifyCode = cleanString(body.verify_code);
  const documentPath = cleanString(body.document_path);
  const notes = cleanString(body.notes);

  if (!businessSlug || !businessName) {
    fields.pick = "Pick your business from the list first, so we know which listing you are claiming.";
  } else if (
    businessSlug.length > LIMITS.business_slug ||
    !SLUG_RE.test(businessSlug) ||
    businessSlug.indexOf("..") !== -1
  ) {
    fields.pick = TOO_LONG;
  }
  if (businessName.length > LIMITS.business_name) fields.pick = TOO_LONG;
  if (!contactName) {
    fields.name = "Enter your name.";
  } else if (contactName.length > LIMITS.contact_name) {
    fields.name = TOO_LONG;
  }
  if (!contactPhone) {
    fields.phone = "Enter your phone number.";
  } else if (contactPhone.length > LIMITS.contact_phone) {
    fields.phone = TOO_LONG;
  }
  if (!contactEmail) {
    fields.email = "Enter your email address.";
  } else if (contactEmail.length > LIMITS.contact_email || !EMAIL_RE.test(contactEmail)) {
    fields.email = "That email address does not look complete. Check it and try again.";
  }
  if (!verifyMethod || VERIFY_METHODS.indexOf(verifyMethod) === -1) {
    fields.verify = "Pick a verification method so we know how you will prove the business is yours.";
  }
  if (relationship.length > LIMITS.relationship) fields.relationship = TOO_LONG;
  if (verifyCode.length > LIMITS.verify_code || !CODE_RE.test(verifyCode)) {
    fields.verify_code = TOO_LONG;
  }
  if (documentPath) {
    // Document uploads stay browser-direct in this phase (build plan section
    // 2.2). The route receives only the path, and the path must sit under
    // the signed-in user's own storage folder, exactly as the client builds
    // it today.
    if (
      documentPath.length > LIMITS.document_path ||
      documentPath.indexOf(user.id + "/") !== 0 ||
      documentPath.indexOf("..") !== -1
    ) {
      fields.document_path = "That document link does not look right. Try the upload again, or email the document instead.";
    }
  }
  if (notes.length > LIMITS.notes) fields.notes = TOO_LONG;

  if (Object.keys(fields).length > 0) {
    return jsonFail(400, "validation_failed", "Check the highlighted fields and try again.", {
      fields: fields
    });
  }

  // Step 8: affirmation gate. The request must carry age_confirmed: true.
  if (body.age_confirmed !== true) {
    return jsonFail(400, "age_required", "Please confirm that you are 18 or older.", {
      fields: { age: "Please confirm that you are 18 or older." }
    });
  }

  // Step 9: row assembly, entirely server-side. The owns_or_manages
  // attestation is accepted in the body and not stored, matching the live
  // form, which validates it client-side and never writes it to the row.
  if (verifyMethod !== "website" && verifyMethod !== "facebook") verifyCode = "";
  const audit = await buildAuditFields(request, body);
  const row = {
    business_slug: businessSlug,
    business_name: businessName,
    user_id: user.id,
    contact_name: contactName,
    contact_email: contactEmail,
    contact_phone: contactPhone,
    relationship: relationship,
    status: "pending",
    verify_method: verifyMethod,
    verify_code: verifyCode,
    age_confirmed: true,
    age_confirmed_at: new Date().toISOString(),
    ip_hash: audit.ip_hash,
    user_agent: audit.user_agent,
    page_url: audit.page_url,
    consent_version: audit.consent_version
  };
  if (documentPath) row.document_path = documentPath;
  if (notes) row.notes = notes;

  // Step 10: insert through Supabase REST with the service role key.
  const inserted = await insertRow(env, "claims", row);
  if (!inserted) {
    return jsonFail(500, "insert_failed", COPY.generic);
  }

  // Step 11: success shape.
  return jsonOk();
}
