import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { logActivity } from "@/lib/activity";

export async function GET() {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "agent" && session.user.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pendingJobs = await prisma.job.findMany({
      where: {
        status: "pending"
      },
      include: {
        employer: true
      },
      orderBy: {
        createdAt: "asc"
      }
    });

    return NextResponse.json(pendingJobs);
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
      await prisma.job.update({
        where: { id: jobId },
        data: { status: "active" },
      });
      await logActivity("job_approved", `Job approved by agent: ${jobId}`, session.user.id);
      return NextResponse.json({ message: "Job approved and live" });
    } else if (action === "reject") {
      await prisma.job.update({
        where: { id: jobId },
        data: { status: "closed" }
      });
      await logActivity("job_rejected", `Job rejected by agent: ${jobId}. Reason: ${reason || "Not specified"}`, session.user.id);
      return NextResponse.json({ message: "Job rejected" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Update job status error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
