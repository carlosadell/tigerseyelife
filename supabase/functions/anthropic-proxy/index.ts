import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY")!;

const cors: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS")
    return new Response("ok", { headers: cors });
  if (request.method !== "POST") {
    return json(405, { error: { message: "Method not allowed" } });
  }

  const authHeader = request.headers.get("Authorization") ?? "";
  const supabase = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return json(401, { error: { message: "Unauthorized" } });
  }

  if (!ANTHROPIC_API_KEY) {
    return json(503, {
      error: { message: "AI service is not configured" },
    });
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("program_member")
    .eq("id", user.id)
    .maybeSingle();
  if (profileError || !profile?.program_member) {
    return json(403, { error: { message: "Active membership required" } });
  }

  const rawBody = await request.text();
  if (rawBody.length > 15_000_000) {
    return json(413, { error: { message: "Request is too large" } });
  }

  let input: Record<string, unknown>;
  try {
    input = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return json(400, { error: { message: "Invalid JSON" } });
  }

  if (!Array.isArray(input.messages) || typeof input.system !== "string") {
    return json(400, { error: { message: "Invalid AI request" } });
  }

  const requestedTokens = Number(input.max_tokens);
  const maxTokens = Number.isFinite(requestedTokens)
    ? Math.min(Math.max(Math.floor(requestedTokens), 1), 1024)
    : 512;
  const upstreamBody = {
    model: "claude-haiku-4-5",
    max_tokens: maxTokens,
    system: input.system,
    messages: input.messages,
    ...(input.output_config ? { output_config: input.output_config } : {}),
  };

  const upstream = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(upstreamBody),
  });

  return new Response(await upstream.text(), {
    status: upstream.status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
});
