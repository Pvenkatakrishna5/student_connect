import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

let supabase: SupabaseClient;

if (supabaseUrl && supabaseAnonKey && !supabaseAnonKey.startsWith("your_")) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  // Create a dummy client that won't crash — DB routes have their own fallbacks
  supabase = createClient("https://placeholder.supabase.co", "placeholder-key");
}

export { supabase };

