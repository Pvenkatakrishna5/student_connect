import { supabaseAdmin } from "@/lib/supabaseClient";

export async function createNotification(
  recipientId: string,
  title: string,
  message: string,
  type: "info" | "success" | "warning" | "error" = "info",
  link?: string
) {
  try {
    await supabaseAdmin.from("Notification").insert({
      id: crypto.randomUUID(),
      recipientId,
      title,
      message,
      type,
      link: link || null,
      read: false,
      createdAt: new Date().toISOString(),
    });
    return true;
  } catch (error) {
    console.error("Failed to create notification:", error);
    return false;
  }
}
