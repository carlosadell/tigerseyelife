// lib/anthropicProxy.ts
//
// Client helper: POSTs an Anthropic Messages payload to the `anthropic-proxy`
// edge function with the signed-in user's access token. The Anthropic API key
// lives only in the edge function, never in the app bundle.
import { supabase } from './supabase';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
const ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim();

export async function callAnthropic(body: unknown): Promise<Response> {
  if (!SUPABASE_URL || !ANON_KEY) {
    throw new Error('The AI features need Supabase configured (EXPO_PUBLIC_SUPABASE_URL / ANON_KEY).');
  }
  const { data } = supabase
    ? await supabase.auth.getSession()
    : { data: { session: null } };
  const token = data.session?.access_token;
  if (!token) {
    throw new Error('Please sign in to use this feature.');
  }
  return fetch(`${SUPABASE_URL}/functions/v1/anthropic-proxy`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: ANON_KEY,
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
}
