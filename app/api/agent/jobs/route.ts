import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { auth } from "@/lib/auth";
import { logActivity } from "@/lib/activity";

export async function GET() {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "agent" && session.user.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: pendingJobs, error } = await supabaseAdmin
      .from("Job")
      .select(`
        *,
        Employer(*)
      `)
      .eq("status", "pending")
      .order("createdAt", { ascending: true });
      
    if (error) throw error;
    
    const mapped = (pendingJobs || []).map(j => {
      const { Employer, ...rest } = j;
      return {
        ...rest,
        employer: Array.isArray(Employer) ? Employer[0] : Employer
      };
    });

    return NextResponse.json(mapped);
  } catch (error) {
    console.error("Fetch pending jobs error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "agent" && session.user.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { jobId, action, reason } = await req.json();

    if (action === "approve") {
      await supabaseAdmin
        .from("Job")
        .update({ status: "active", updatedAt: new Date().toISOString() })
        .eq("id", jobId);
        
      await logActivity("job_approved", `Job approved by agent: ${jobId}`, session.user.id);
      return NextResponse.json({ message: "Job approved and live" });
    } else if (action === "reject") {
      await supabaseAdmin
        .from("Job")
        .update({ status: "closed", updatedAt: new Date().toISOString() })
        .eq("id", jobId);
        
      await logActivity("job_rejected", `Job rejected by agent: ${jobId}. Reason: ${reason || "Not specified"}`, session.user.id);
      return NextResponse.json({ message: "Job rejected" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Update job status error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
