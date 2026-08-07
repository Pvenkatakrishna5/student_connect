import { supabaseAdmin } from "@/lib/supabaseClient";

export async function logActivity(
  type: string,
  message: string,
  userId?: string,
  metadata?: Record<string, unknown>
) {
  try {
    await supabaseAdmin.from("Activity").insert({
      id: crypto.randomUUID(),
      type,
      message,
      userId: userId || null,
      metadata: metadata || null,
      createdAt: new Date().toISOString(),
    });
    return true;
  } catch (error) {
    console.error("Failed to log activity:", error);
    return false;
  }
}
