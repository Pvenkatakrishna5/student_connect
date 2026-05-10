import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    let profile = null;

    if (session.user.role === "student") {
      profile = await prisma.student.findUnique({
        where: { userId: session.user.id },
      });
    } else if (session.user.role === "employer") {
      profile = await prisma.employer.findUnique({
        where: { userId: session.user.id },
      });
    }

    return NextResponse.json({
      id: session.user.id,
      email: session.user.email,
      role: session.user.role,
      name: session.user.name,
      ...profile,
    });
  } catch (error) {
    console.error("Auth/me error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
