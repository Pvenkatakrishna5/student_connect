import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const [students, employers, jobs, applications] = await prisma.$transaction([
      prisma.student.count(),
      prisma.employer.count(),
      prisma.job.count(),
      prisma.application.count(),
    ]);

    const hiredApplications = await prisma.application.findMany({
      where: { status: "selected" },
      include: { job: true },
    });

    const totalRevenue = hiredApplications.reduce((acc, app) => {
      return acc + (app.job?.payAmount || 0) * 0.1; // 10% platform fee
    }, 0);

    return NextResponse.json({
      students,
      employers,
      jobs,
      applications,
      revenue: `₹${(totalRevenue / 1000).toFixed(1)}K`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
