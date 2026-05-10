import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");

    const session = await auth();
    if (!session || (session.user.role !== "admin" && session.user.id !== studentId)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find student record
    const student = await prisma.student.findUnique({ where: { userId: studentId! } });
    if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });

    const hiredApplications = await prisma.application.findMany({
      where: { studentId: student.id, status: "selected" },
      include: { job: true, employer: true },
    });

    let totalEarned = 0;
    const payments = hiredApplications.map((app) => {
      const amount = app.job?.payAmount || 0;
      totalEarned += amount;
      return {
        job: app.job?.title || "Unknown",
        employer: app.employer?.companyName || "Employer",
        amount,
        date: new Date(app.appliedAt).toLocaleDateString(),
        status: "paid",
      };
    });

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentMonth = new Date().getMonth();
    const monthlyEarnings = months.map((m, i) => ({
      month: m,
      earned: i <= currentMonth ? Math.floor(totalEarned / (currentMonth + 1)) : 0,
    }));

    return NextResponse.json({
      totalEarned,
      pendingEarned: 0,
      completedJobs: hiredApplications.length,
      payments,
      monthlyEarnings,
    });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
