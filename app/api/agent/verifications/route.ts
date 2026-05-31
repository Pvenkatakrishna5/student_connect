import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { logActivity } from "@/lib/activity";

export async function GET() {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "agent" && session.user.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pendingStudents = await prisma.student.findMany({
      where: {
        isAadhaarVerified: false,
        aadhaarNumber: { not: "" }
      },
      include: {
        user: {
          select: {
            email: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        updatedAt: "asc"
      }
    });

    return NextResponse.json(pendingStudents);
  } catch (error) {
    console.error("Fetch verifications error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "agent" && session.user.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { studentId, action, reason } = await req.json();

    if (action === "approve") {
      await prisma.student.update({
        where: { id: studentId },
        data: { isAadhaarVerified: true },
      });
      await logActivity("verification_approved", `Student verification approved: ${studentId}`, session.user.id);
      return NextResponse.json({ message: "Student verified successfully" });
    } else if (action === "reject") {
      await prisma.student.update({
        where: { id: studentId },
        data: { 
          isAadhaarVerified: false,
          aadhaarNumber: "" // Reset to allow re-submission
        },
      });
      await logActivity("verification_rejected", `Student verification rejected: ${studentId}. Reason: ${reason || "Not specified"}`, session.user.id);
      return NextResponse.json({ message: "Verification rejected" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Update verification error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
