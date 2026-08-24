import { createClient } from "@supabase/supabase-js";

// SERVER-ONLY. Uses the service role key, which bypasses row-level
// security — never import this file into a client component, and never
// expose SUPABASE_SERVICE_ROLE_KEY with a NEXT_PUBLIC_ prefix.
export function supabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not set — see README for Supabase setup."
    );
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
