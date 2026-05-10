import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const activities = await prisma.activity.findMany({
      include: {
        user: {
          select: { email: true, role: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json(activities);
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
