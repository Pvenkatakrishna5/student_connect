import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { logActivity } from "@/lib/activity";
import { createNotification } from "@/lib/notifications";

const FALLBACK_JOBS = [
  { id: "demo_1", title: "React Developer", description: "Build modern UI components for our SaaS product.", category: "Technical", payAmount: 15000, payType: "monthly", location: "Remote", isRemote: true, status: "active", employer: { companyName: "TechStartup", id: "e1" }, createdAt: new Date().toISOString() },
  { id: "demo_2", title: "Math Tutor", description: "Teach Maths to students preparing for competitive exams.", category: "Education", payAmount: 600, payType: "hourly", location: "Chennai", isRemote: false, status: "active", employer: { companyName: "HomeEdu", id: "e2" }, createdAt: new Date().toISOString() },
  { id: "demo_3", title: "Content Writer", description: "Write SEO-optimised blog posts on technology topics.", category: "Content", payAmount: 8000, payType: "monthly", location: "Remote", isRemote: true, status: "active", employer: { companyName: "BlogHive", id: "e3" }, createdAt: new Date().toISOString() },
  { id: "demo_4", title: "Shop Assistant", description: "Assist customers in a local retail store on weekends.", category: "Retail", payAmount: 500, payType: "daily", location: "Chennai", isRemote: false, status: "active", employer: { companyName: "LocalMart", id: "e4" }, createdAt: new Date().toISOString() },
  { id: "demo_5", title: "Video Editor", description: "Edit short-form videos for our social media channels.", category: "Design", payAmount: 10000, payType: "monthly", location: "Remote", isRemote: true, status: "active", employer: { companyName: "CreativeLab", id: "e5" }, createdAt: new Date().toISOString() },
  { id: "demo_6", title: "Data Entry Operator", description: "Enter and validate records in our internal database system.", category: "Admin", payAmount: 6000, payType: "monthly", location: "Hybrid", isRemote: false, status: "active", employer: { companyName: "BizOffice", id: "e6" }, createdAt: new Date().toISOString() },
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const location = searchParams.get("location");
    const isRemote = searchParams.get("remote");
    const search = searchParams.get("search");
    const employerId = searchParams.get("employerId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");

    const where: Record<string, unknown> = employerId
      ? { employerId }
      : { status: "active" };

    if (category) where.category = category;
    if (isRemote === "true") where.isRemote = true;
    if (location && location !== "Remote") {
      where.location = { contains: location, mode: "insensitive" };
    }
    if (search) {
      where.title = { contains: search, mode: "insensitive" };
    }

    let jobs, total;
    try {
      [total, jobs] = await prisma.$transaction([
        prisma.job.count({ where }),
        prisma.job.findMany({
          where,
          include: { employer: true },
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
      ]);
    } catch (dbErr) {
      // DB unavailable — return filtered sample data so the UI never breaks
      console.warn("DB unavailable, serving fallback jobs:", dbErr);
      let fallback = FALLBACK_JOBS;
      if (isRemote === "true") fallback = fallback.filter(j => j.isRemote);
      if (search) fallback = fallback.filter(j => j.title.toLowerCase().includes((search as string).toLowerCase()));
      return NextResponse.json({ jobs: fallback, total: fallback.length, page: 1, pages: 1, fallback: true });
    }

    return NextResponse.json({ jobs, total, page, pages: Math.ceil((total as number) / limit) });
  } catch (err) {
    console.error("Jobs GET error:", err);
    return NextResponse.json({ jobs: FALLBACK_JOBS, total: FALLBACK_JOBS.length, page: 1, pages: 1, fallback: true });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { employerId, ...jobData } = body;

    const job = await prisma.job.create({
      data: { ...jobData, employerId, status: "pending" },
    });

    await logActivity("job_posted", `New job posted: ${body.title}`, employerId, {
      jobId: job.id,
    });

    return NextResponse.json(job, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, ...updates } = await req.json();

    const job = await prisma.job.update({
      where: { id },
      data: updates,
    });

    if (updates.status) {
      const isApproved = updates.status === "active";
      await createNotification(
        job.employerId,
        isApproved ? "Job Approved!" : "Job Rejected",
        isApproved
          ? `Your job post "${job.title}" has been approved and is now live.`
          : `Your job post "${job.title}" was not approved. Please review our guidelines.`,
        isApproved ? "success" : "error",
        "/employer/dashboard"
      );
    }

    return NextResponse.json(job);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
