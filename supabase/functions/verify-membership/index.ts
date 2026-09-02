// supabase/functions/verify-membership/index.ts
//
// Server-only verification of Create Power program membership.
//
// Flow:
//   POST { mode: "start", email }
//     -> looks up membership in GHL; if found, sends OTP; returns
//        { found, otpSent }.
//
//   POST { mode: "confirm", email, code }
//     -> validates OTP; re-checks membership; if both pass, sets
//        program_member=true, join_email, verified_at, current_block='COMMIT'
//        on the caller's profile using service_role.
//
// Source of truth (spec §2 decision 1): GHL contact + create-power-member tag.
// Verification mechanism (spec §2 decision 2): OTP to join email.
//
// Both lookupMembership and sendOtp/validateOtp are swappable in one file.

import { createClient } from "npm:@supabase/supabase-js@2";

type StartBody = { mode: "start"; email: string };
type ConfirmBody = { mode: "confirm"; email: string; code: string };
type Body = StartBody | ConfirmBody;

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const GHL_API_KEY = Deno.env.get("GHL_API_KEY") ?? "";
const GHL_LOCATION_ID = Deno.env.get("GHL_LOCATION_ID") ?? "";
const GHL_MEMBER_TAG = Deno.env.get("GHL_MEMBER_TAG") ?? "create-power-member";
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const OTP_FROM_EMAIL = Deno.env.get("OTP_FROM_EMAIL") ?? "";
const ALLOW_DEV_MEMBERSHIP_BYPASS =
  Deno.env.get("ALLOW_DEV_MEMBERSHIP_BYPASS") === "true";
const OTP_DEV_BYPASS_CODE = Deno.env.get("OTP_DEV_BYPASS_CODE") ?? "";

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    headers: {
      "content-type": "application/json",
      "access-control-allow-origin": "*",
      "access-control-allow-headers": "authorization, content-type",
    },
    status,
  });
}

function normaliseEmail(input: string): string {
  return input.trim().toLowerCase();
}

async function lookupMembership(email: string): Promise<{ found: boolean }> {
  if (!GHL_API_KEY || !GHL_LOCATION_ID) {
    if (ALLOW_DEV_MEMBERSHIP_BYPASS) {
      return { found: email.includes("+member") };
    }
    throw new Error("membership_provider_not_configured");
  }

  const url = `https://services.leadconnectorhq.com/contacts/?query=${encodeURIComponent(email)}&locationId=${encodeURIComponent(GHL_LOCATION_ID)}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${GHL_API_KEY}`,
      Version: "2021-07-28",
      Accept: "application/json",
    },
  });

  if (!res.ok) throw new Error("membership_provider_unavailable");

  const data = (await res.json()) as {
    contacts?: Array<{ tags?: string[]; email?: string }>;
  };

  const found = (data.contacts ?? []).some((contact) => {
    const matchesEmail = (contact.email ?? "").toLowerCase() === email;
    const hasTag = (contact.tags ?? []).some(
      (tag) => tag.toLowerCase() === GHL_MEMBER_TAG.toLowerCase(),
    );
    return matchesEmail && hasTag;
  });

  return { found };
}

async function sendOtp(
  admin: ReturnType<typeof createClient>,
  email: string,
): Promise<void> {
  const { data: recent } = await admin
    .from("membership_verification_otps")
    .select("created_at")
    .eq("email", email)
    .maybeSingle();

  if (
    recent &&
    Date.now() - new Date(recent.created_at).getTime() < 60 * 1000
  ) {
    throw new Error("otp_rate_limited");
  }

  const random = new Uint32Array(1);
  crypto.getRandomValues(random);
  const code =
    ALLOW_DEV_MEMBERSHIP_BYPASS && OTP_DEV_BYPASS_CODE
      ? OTP_DEV_BYPASS_CODE
      : String(100000 + (random[0] % 900000));

  const { error: storeError } = await admin
    .from("membership_verification_otps")
    .upsert(
      {
        email,
        code,
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
      },
      { onConflict: "email" },
    );
  if (storeError) throw new Error("otp_store_failed");

  if (ALLOW_DEV_MEMBERSHIP_BYPASS) return;
  if (!RESEND_API_KEY || !OTP_FROM_EMAIL) {
    throw new Error("otp_provider_not_configured");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: OTP_FROM_EMAIL,
      to: [email],
      subject: "Your Tigers Eye Life verification code",
      text: `Your Tigers Eye Life verification code is ${code}. It expires in 10 minutes.`,
    }),
  });

  if (!response.ok) {
    await admin
      .from("membership_verification_otps")
      .delete()
      .eq("email", email);
    throw new Error("otp_delivery_failed");
  }
}

async function validateOtp(
  admin: ReturnType<typeof createClient>,
  email: string,
  code: string,
): Promise<boolean> {
  if (
    ALLOW_DEV_MEMBERSHIP_BYPASS &&
    OTP_DEV_BYPASS_CODE &&
    code === OTP_DEV_BYPASS_CODE
  ) {
    return true;
  }

  const { data } = await admin
    .from("membership_verification_otps")
    .select("code,expires_at")
    .eq("email", email)
    .maybeSingle();

  if (!data) return false;
  if (new Date(data.expires_at).getTime() < Date.now()) return false;
  if (data.code !== code) return false;

  await admin.from("membership_verification_otps").delete().eq("email", email);
  return true;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "access-control-allow-origin": "*",
        "access-control-allow-methods": "POST, OPTIONS",
        "access-control-allow-headers": "authorization, content-type",
      },
    });
  }
  if (req.method !== "POST") return json(405, { error: "method_not_allowed" });

  const authHeader = req.headers.get("authorization") ?? "";
  if (!authHeader.toLowerCase().startsWith("bearer ")) {
    return json(401, { error: "missing_user_token" });
  }
  const userJwt = authHeader.slice("bearer ".length).trim();

  const userClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    global: { headers: { Authorization: `Bearer ${userJwt}` } },
  });
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();
  if (userError || !user) return json(401, { error: "invalid_user_token" });

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return json(400, { error: "invalid_json" });
  }
  if (!body || typeof body !== "object" || typeof body.email !== "string") {
    return json(400, { error: "email_required" });
  }
  const email = normaliseEmail(body.email);

  if (body.mode === "start") {
    try {
      const { found } = await lookupMembership(email);
      if (!found) return json(200, { found: false, otpSent: false });
      await sendOtp(admin, email);
      return json(200, { found: true, otpSent: true });
    } catch (error) {
      if (error instanceof Error && error.message === "otp_rate_limited") {
        return json(429, { error: "try_again_in_one_minute" });
      }
      console.error("Membership verification start failed", error);
      return json(503, { error: "verification_service_unavailable" });
    }
  }

  if (body.mode === "confirm") {
    if (typeof body.code !== "string" || body.code.length < 4) {
      return json(400, { error: "code_required" });
    }
    const ok = await validateOtp(admin, email, body.code);
    if (!ok) return json(200, { verified: false, reason: "code_invalid" });

    let found = false;
    try {
      ({ found } = await lookupMembership(email));
    } catch (error) {
      console.error("Membership re-check failed", error);
      return json(503, { error: "verification_service_unavailable" });
    }
    if (!found)
      return json(200, { verified: false, reason: "no_longer_member" });

    const { error: updateError } = await admin
      .from("profiles")
      .update({
        program_member: true,
        join_email: email,
        verified_at: new Date().toISOString(),
        current_block: "COMMIT",
      })
      .eq("id", user.id);

    if (updateError)
      return json(500, { verified: false, reason: "profile_update_failed" });
    return json(200, { verified: true });
  }

  return json(400, { error: "unknown_mode" });
});
