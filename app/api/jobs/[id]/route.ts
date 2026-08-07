import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { data: job, error } = await supabaseAdmin
      .from("Job")
      .select("*, Employer(*)")
      .eq("id", id)
      .single();

    if (error || !job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

    // Rename Employer to employer for frontend compatibility
    const { Employer, ...rest } = job;
    return NextResponse.json({ ...rest, employer: Employer });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
