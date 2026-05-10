import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { logActivity } from "@/lib/activity";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { aadhaarNumber } = await req.json();

    if (!aadhaarNumber || aadhaarNumber.length < 12) {
      return NextResponse.json({ error: "Invalid Aadhaar number" }, { status: 400 });
    }

    const student = await prisma.student.update({
      where: { userId: session.user.id },
      data: { isAadhaarVerified: true },
    });

    if (!student) {
      return NextResponse.json({ error: "Student profile not found" }, { status: 404 });
    }

    await logActivity("identity_verified", "Completed e-KYC Identity Verification", session.user.id, {
      method: "aadhaar",
    });

    return NextResponse.json({
      success: true,
      message: "Identity verified successfully",
      student,
    });
  } catch (error: any) {
    console.error("Verification error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
