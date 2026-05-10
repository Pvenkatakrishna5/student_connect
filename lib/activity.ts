import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function logActivity(
  type: string,
  message: string,
  userId?: string,
  metadata?: Record<string, unknown>
) {
  try {
    await prisma.activity.create({
      data: {
        type,
        message,
        userId,
        metadata: metadata as Prisma.InputJsonValue | undefined,
      },
    });
    return true;
  } catch (error) {
    console.error("Failed to log activity:", error);
    return false;
  }
}
