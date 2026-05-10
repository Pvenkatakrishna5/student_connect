import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Find the primary admin user
    const admin = await prisma.user.findFirst({
      where: { role: "admin" },
      select: { id: true, email: true }
    });

    if (!admin) {
      return NextResponse.json({ error: "Support system is currently offline" }, { status: 404 });
    }

    return NextResponse.json({ 
      adminId: admin.id,
      name: "Platform Support",
      role: "admin"
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
