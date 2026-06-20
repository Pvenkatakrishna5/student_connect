import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { logActivity } from "@/lib/activity";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

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
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const body = await req.json();

    if (session.user.role === "student") {
      const { name, ...studentData } = body;
      const profile = await prisma.student.update({
        where: { userId: session.user.id },
        data: { ...studentData, ...(name ? { name } : {}) },
      });
      await logActivity("profile_updated", "Updated student profile details", session.user.id);
      return NextResponse.json(profile);
    } else if (session.user.role === "employer") {
      const profile = await prisma.employer.update({
        where: { userId: session.user.id },
        data: body,
      });
      await logActivity("profile_updated", "Updated employer profile details", session.user.id);
      return NextResponse.json(profile);
    }

    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
