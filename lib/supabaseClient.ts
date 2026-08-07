import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// ── Public client (anon key) — for client-side usage ─────────────────────────
let supabase: SupabaseClient;

if (supabaseUrl && supabaseAnonKey && !supabaseAnonKey.startsWith("your_")) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  // Create a dummy client that won't crash — DB routes have their own fallbacks
  supabase = createClient("https://placeholder.supabase.co", "placeholder-key");
}

// ── Admin client (service_role key) — for server-side API routes ─────────────
// This bypasses RLS and uses HTTPS REST API (works on all networks including
// college WiFi that blocks PostgreSQL ports 5432/6543)
let supabaseAdmin: SupabaseClient;

if (supabaseUrl && supabaseServiceRoleKey && !supabaseServiceRoleKey.startsWith("your_")) {
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
} else {
  // Fallback — will fail gracefully on queries
  supabaseAdmin = createClient("https://placeholder.supabase.co", "placeholder-key");
  console.warn("⚠️ SUPABASE_SERVICE_ROLE_KEY missing — server-side DB access disabled");
}

export { supabase, supabaseAdmin };
