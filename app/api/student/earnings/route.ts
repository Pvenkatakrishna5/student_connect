import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
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
    const { data: student } = await supabaseAdmin
      .from("Student")
      .select("id")
      .eq("userId", studentUserId)
      .single();
      
    if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });

    const { data: applications, error } = await supabaseAdmin
      .from("Application")
      .select("*, Job(*), Employer(*)")
      .eq("studentId", student.id)
      .in("status", ["selected", "completed"])
      .order("updatedAt", { ascending: true });
      
    if (error) throw error;
    
    // Fallback if null
    const hiredApplications = applications || [];

    let totalEarned = 0;
    let pendingEarned = 0;
    
    // Group earnings by month (0-11)
    const monthlyTotals = Array(12).fill(0);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const payments = hiredApplications.map((app) => {
      const amount = app.Job?.payAmount || 0;
      const date = new Date(app.updatedAt);
      
      if (app.status === "completed") {
        totalEarned += amount;
        monthlyTotals[date.getMonth()] += amount;
      } else if (app.status === "selected") {
        pendingEarned += amount;
      }

      return {
        job: app.Job?.title || "Unknown",
        employer: app.Employer?.companyName || "Employer",
        amount,
        date: date.toLocaleDateString("en-IN"),
        status: app.status === "completed" ? "paid" : "processing",
      };
    });

    const monthlyEarnings = months.map((m, i) => ({
      month: m,
      earned: monthlyTotals[i],
    }));

    return NextResponse.json({
      totalEarned,
      pendingEarned,
      completedJobs: hiredApplications.filter(a => a.status === "completed").length,
      payments,
      monthlyEarnings,
    });
  } catch (error) {
    console.error("Student earnings error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
