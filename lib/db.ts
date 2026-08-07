// Database access is now through Supabase JS client (HTTPS REST API)
// This replaces the old Prisma PostgreSQL wire protocol connection
// which was blocked by college WiFi firewalls.
export { supabaseAdmin as default, supabaseAdmin } from "./supabaseClient";
