import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== "employer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const employerId = session.user.id;

    // Find the employer's Prisma record (id != userId)
    const employer = await prisma.employer.findUnique({ where: { userId: employerId } });
    if (!employer) return NextResponse.json({ error: "Employer not found" }, { status: 404 });

    const [activeJobsCount, totalApplicants, hiredCount] = await prisma.$transaction([
      prisma.job.count({ where: { employerId: employer.id, status: "active" } }),
      prisma.application.count({ where: { employerId: employer.id } }),
      prisma.application.count({ where: { employerId: employer.id, status: "selected" } }),
    ]);

    const recentJobs = await prisma.job.findMany({
      where: { employerId: employer.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    return NextResponse.json({
      activeJobs: activeJobsCount,
      totalApplicants,
      hiredStudents: hiredCount,
      recentJobs: recentJobs.map((j: any) => ({ ...j, timeAgo: "Recently" })),
    });
  } catch (error) {
    console.error("Employer stats error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
