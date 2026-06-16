// supabase/functions/onboarding-completed/index.ts
//
// Onboarding completion dispatch — skeleton.
//
// Replaces what the parent program brief specified as a Make.com webhook (see
// memory automation-pattern-supabase-edge). Client calls this after writing
// the §3.2 fields to profiles and flipping onboarding_completed = true.
//
// Skeleton scope: validate JWT, re-read profile from DB (don't trust client),
// build a structured event payload, log it, return 200. Future slices wire in:
//   - Resend welcome email
//   - Slack-ping Ryan via webhook
//   - GHL contact sync via the existing GHL_API_KEY pattern

import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

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

  // Re-read the profile so we trust DB state, not the client payload.
  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile) {
    return json(404, { error: "profile_not_found" });
  }

  // Structured event payload — future slices will dispatch this to Resend,
  // Slack, GHL. For now, log it server-side.
  const event = {
    type: "onboarding.completed",
    user_id: user.id,
    email: user.email,
    completed_at: new Date().toISOString(),
    profile_snapshot: {
      full_name: profile.full_name,
      age: profile.age,
      primary_goal: profile.primary_goal,
      success_vision: profile.success_vision,
      importance_level: profile.importance_level,
      confidence_level: profile.confidence_level,
      confidence_barriers: profile.confidence_barriers,
      obstacles: profile.obstacles,
      other_obstacle: profile.other_obstacle,
      top_obstacles: profile.top_obstacles,
      obstacle_deep_dive: profile.obstacle_deep_dive,
      work_situation: profile.work_situation,
      living_situation: profile.living_situation,
      past_experience: profile.past_experience,
      concerns: profile.concerns,
      needle_mover: profile.needle_mover,
      specific_habits: profile.specific_habits,
      success_factor: profile.success_factor,
      other_success_factor: profile.other_success_factor,
      emotion_response: profile.emotion_response,
      coaching_style: profile.coaching_style,
    },
  };

  // Skeleton dispatch — log the structured event server-side. Future slices
  // replace this block with parallel fan-out:
  //
  //   await Promise.allSettled([
  //     sendWelcomeEmail(event),     // Resend
  //     pingRyanSlack(event),         // Slack webhook
  //     syncToGhl(event),             // GHL contacts API
  //   ]);
  //
  // For now we log so Phase 10 smoke confirms the function is reachable.
  console.log("[onboarding-completed]", JSON.stringify(event));

  return json(200, { dispatched: true });
});
