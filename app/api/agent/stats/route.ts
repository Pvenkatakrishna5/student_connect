import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "agent" && session.user.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [
      { count: pendingVerifications },
      { count: activeAssignments },
      { count: totalStudents },
      { count: pendingJobs }
    ] = await Promise.all([
      supabaseAdmin.from("Student")
        .select("*", { count: "exact", head: true })
        .eq("isAadhaarVerified", false)
        .neq("aadhaarNumber", ""),
      supabaseAdmin.from("Job")
        .select("*", { count: "exact", head: true })
        .eq("status", "active"), // We count active jobs as assignments for now
      supabaseAdmin.from("Student")
        .select("*", { count: "exact", head: true }),
      supabaseAdmin.from("Job")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending")
    ]);

    return NextResponse.json({
      pendingVerifications: pendingVerifications || 0,
      activeAssignments: activeAssignments || 0,
      totalStudents: totalStudents || 0,
      successRate: "98%", // Hardcoded for now
      pendingJobs: pendingJobs || 0
    });
  } catch (err: any) {
    console.error("Agent stats error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
