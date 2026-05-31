import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "agent" && session.user.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [pendingVerifications, activeAssignments, totalStudents, pendingJobs] = await prisma.$transaction([
      prisma.student.count({ 
        where: { 
          isAadhaarVerified: false,
          aadhaarNumber: { not: "" }
        } 
      }),
      prisma.job.count({ where: { status: "active" } }), // We'll count active jobs as assignments for now
      prisma.student.count(),
      prisma.job.count({ where: { status: "pending" } })
    ]);

    return NextResponse.json({
      pendingVerifications,
      activeAssignments,
      totalStudents,
      successRate: "98%", // Hardcoded for now or we could calculate based on completed jobs
      pendingJobs
    });
  } catch (err: any) {
    console.error("Agent stats error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
