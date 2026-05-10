import prisma from "@/lib/prisma";

export async function createNotification(
  recipientId: string,
  title: string,
  message: string,
  type: "info" | "success" | "warning" | "error" = "info",
  link?: string
) {
  try {
    await prisma.notification.create({
      data: { recipientId, title, message, type, link },
    });
    return true;
  } catch (error) {
    console.error("Failed to create notification:", error);
    return false;
  }
}
