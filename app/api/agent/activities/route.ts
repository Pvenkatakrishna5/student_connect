import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id || (session.user.role !== "agent" && session.user.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const activities = await prisma.activity.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return NextResponse.json(activities);
  } catch (error) {
    console.error("Agent activities error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
