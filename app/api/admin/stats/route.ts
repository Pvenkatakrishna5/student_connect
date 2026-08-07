import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";

export async function GET() {
  try {
    // Supabase JS doesn't have an exact equivalent to Prisma's $transaction for counting,
    // so we execute them concurrently with Promise.all
    
    const [
      { count: students },
      { count: employers },
      { count: jobs },
      { count: applications }
    ] = await Promise.all([
      supabaseAdmin.from("Student").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("Employer").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("Job").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("Application").select("*", { count: "exact", head: true })
    ]);

    const { data: hiredApplications } = await supabaseAdmin
      .from("Application")
      .select("*, Job(payAmount)")
      .eq("status", "selected");

    const totalRevenue = (hiredApplications || []).reduce((acc: number, app: any) => {
      return acc + (app.Job?.payAmount || 0) * 0.1; // 10% platform fee
    }, 0);

    return NextResponse.json({
      students: students || 0,
      employers: employers || 0,
      jobs: jobs || 0,
      applications: applications || 0,
      revenue: `₹${(totalRevenue / 1000).toFixed(1)}K`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
