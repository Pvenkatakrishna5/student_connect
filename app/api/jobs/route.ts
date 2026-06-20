import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { logActivity } from "@/lib/activity";
import { createNotification } from "@/lib/notifications";
import { sendEmail } from "@/lib/email";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const location = searchParams.get("location");
    const isRemote = searchParams.get("remote");
    const search = searchParams.get("search");
    const employerUserId = searchParams.get("employerId"); // comes in as userId from frontend
    const statusParam = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");

    const where: Record<string, unknown> = {};

    if (employerUserId) {
      // Resolve userId → employer.id
      const employer = await prisma.employer.findUnique({ where: { userId: employerUserId } });
      if (!employer) return NextResponse.json({ jobs: [], total: 0, page: 1, pages: 0 });
      where.employerId = employer.id;
    } else if (statusParam) {
      // Allow explicit status filter (for admin pending view)
      where.status = statusParam;
    } else {
      where.status = "active";
    }

    if (category) where.category = category;
    if (isRemote === "true") where.isRemote = true;
    if (location && location !== "Remote") {
      where.location = { contains: location, mode: "insensitive" };
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const [total, jobs] = await prisma.$transaction([
      prisma.job.count({ where }),
      prisma.job.findMany({
        where,
        include: { employer: true },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return NextResponse.json({ jobs, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error("Jobs GET error:", err);
    return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Frontend sends employerUserId (the session userId); resolve to employer.id
    const { employerUserId, ...jobData } = body;

    let employerId = body.employerId;
    if (employerUserId) {
      const employer = await prisma.employer.findUnique({ where: { userId: employerUserId } });
      if (!employer) return NextResponse.json({ error: "Employer profile not found" }, { status: 404 });
      employerId = employer.id;
    }

    const job = await prisma.job.create({
      data: { ...jobData, employerId, status: "active" },
    });

    await logActivity("job_posted", `New job posted: ${body.title}`, employerUserId || employerId, {
      jobId: job.id,
    });

    // Notify all active students about the new job
    const students = await prisma.user.findMany({
      where: { role: "student", isActive: true },
      select: { id: true, email: true },
    });

    if (students.length > 0) {
      const notifications = students.map((student) => ({
        recipientId: student.id,
        title: "New Job Posted!",
        message: `An employer has posted a new job: "${job.title}". Check it out!`,
        link: `/student/jobs/${job.id}`,
      }));
      await prisma.notification.createMany({
        data: notifications,
      });

      // Send email notifications
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const emailPromises = students.map(student => {
        if (student.email) {
          return sendEmail({
            to: student.email,
            subject: `New Job Posted: ${job.title}`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px; border-radius: 10px;">
                <h2 style="color: #333;">New Job Opportunity!</h2>
                <p style="color: #555; font-size: 16px;">
                  A new job titled <strong>"${job.title}"</strong> has just been posted on StudentConnect.
                </p>
                <p style="color: #555; font-size: 16px;">
                  Log in to your account to view the details and apply before the spots fill up!
                </p>
                <div style="margin-top: 30px; text-align: center;">
                  <a href="${appUrl}/student/jobs/${job.id}" style="background-color: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                    View Job & Apply
                  </a>
                </div>
              </div>
            `,
          });
        }
        return Promise.resolve();
      });
      
      // Fire and forget so we don't block the API response
      Promise.allSettled(emailPromises).catch(err => console.error("Bulk email error:", err));
    }

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
      // Look up employer userId for correct notification recipient
      const employer = await prisma.employer.findUnique({ where: { id: job.employerId } });
      if (employer) {
        await createNotification(
          employer.userId,
          isApproved ? "Job Approved!" : "Job Rejected",
          isApproved
            ? `Your job post "${job.title}" has been approved and is now live.`
            : `Your job post "${job.title}" was not approved. Please review our guidelines.`,
          isApproved ? "success" : "error",
          "/employer/dashboard"
        );
      }
    }

    return NextResponse.json(job);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
