import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== "employer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const employerUserId = session.user.id;

    // Find the employer's record
    const { data: employer, error: empErr } = await supabaseAdmin
      .from("Employer")
      .select("id")
      .eq("userId", employerUserId)
      .single();
      
    if (empErr || !employer) return NextResponse.json({ error: "Employer not found" }, { status: 404 });

    // Concurrent counting
    const [
      { count: activeJobsCount },
      { count: totalApplicants },
      { count: hiredCount }
    ] = await Promise.all([
      supabaseAdmin.from("Job").select("*", { count: "exact", head: true })
        .eq("employerId", employer.id)
        .eq("status", "active"),
      supabaseAdmin.from("Application").select("*", { count: "exact", head: true })
        .eq("employerId", employer.id),
      supabaseAdmin.from("Application").select("*", { count: "exact", head: true })
        .eq("employerId", employer.id)
        .eq("status", "selected")
    ]);

    const { data: recentJobs } = await supabaseAdmin
      .from("Job")
      .select("*")
      .eq("employerId", employer.id)
      .order("createdAt", { ascending: false })
      .limit(5);

    return NextResponse.json({
      activeJobs: activeJobsCount || 0,
      totalApplicants: totalApplicants || 0,
      hiredStudents: hiredCount || 0,
      recentJobs: (recentJobs || []).map((j: any) => ({ ...j, timeAgo: "Recently" })),
    });
  } catch (error) {
    console.error("Employer stats error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
