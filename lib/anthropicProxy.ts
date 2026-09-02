import { supabase } from "./supabase";

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
const ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim();

export async function callAnthropic(body: unknown): Promise<Response> {
  if (!SUPABASE_URL || !ANON_KEY || !supabase) {
    throw new Error(
      "AI features are unavailable until the app is connected to Tigers Eye Life.",
    );
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) {
    throw new Error("Please sign in to use this feature.");
  }

  return fetch(`${SUPABASE_URL}/functions/v1/anthropic-proxy`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      apikey: ANON_KEY,
    },
    body: JSON.stringify(body),
  });
}
