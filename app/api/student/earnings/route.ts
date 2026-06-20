import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    // Use query param or fall back to session user
    const studentUserId = searchParams.get("studentId") || session.user.id;

    // Only admin can view other students' earnings
    if (session.user.role !== "admin" && session.user.id !== studentUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find student record by userId
    const student = await prisma.student.findUnique({ where: { userId: studentUserId } });
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
        date: new Date(app.appliedAt).toLocaleDateString("en-IN"),
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
    console.error("Student earnings error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
