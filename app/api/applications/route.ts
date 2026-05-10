import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";
import { logActivity } from "@/lib/activity";
import { sendEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { jobId, studentId, coverNote } = await req.json();

    // Check if already applied
    const existing = await prisma.application.findUnique({
      where: { jobId_studentId: { jobId, studentId } },
    });
    if (existing) return NextResponse.json({ error: "Already applied" }, { status: 409 });

    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

    const app = await prisma.application.create({
      data: { jobId, studentId, employerId: job.employerId, coverNote },
    });

    await prisma.job.update({
      where: { id: jobId },
      data: { applicantsCount: { increment: 1 } },
    });

    // Notify employer
    await createNotification(
      job.employerId,
      "New Applicant!",
      `A student has applied for your position: ${job.title}`,
      "info",
      "/employer/applicants"
    );

    // Email employer
    const employerUser = await prisma.user.findUnique({
      where: { id: job.employerId },
    });
    if (employerUser?.email) {
      await sendEmail({
        to: employerUser.email,
        subject: `New Applicant for ${job.title}`,
        html: `<p>Great news!</p><p>A new student has just applied for your job posting: <strong>${job.title}</strong>.</p><p>Log in to your Employer Dashboard to review their application.</p>`,
      });
    }

    await logActivity("application_submitted", `New application for ${job.title}`, studentId);

    return NextResponse.json(app, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");
    const jobId = searchParams.get("jobId");
    const employerId = searchParams.get("employerId");

    const where: Record<string, string> = {};
    if (studentId) where.studentId = studentId;
    if (jobId) where.jobId = jobId;
    if (employerId) where.employerId = employerId;

    const apps = await prisma.application.findMany({
      where,
      include: {
        job: { include: { employer: true } },
        student: { include: { user: { select: { email: true } } } },
      },
      orderBy: { appliedAt: "desc" },
    });

    return NextResponse.json(apps);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, status } = await req.json();

    const app = await prisma.application.update({
      where: { id },
      data: { status },
      include: {
        job: true,
        student: { include: { user: { select: { email: true } } } },
      },
    });

    if (!app) return NextResponse.json({ error: "Application not found" }, { status: 404 });

    const student = app.student;
    const job = app.job;
    const studentUserId = student.userId;

    await createNotification(
      studentUserId,
      "Application Update",
      `Your application for ${job.title} is now ${status}.`,
      status === "selected" ? "success" : status === "rejected" ? "error" : "info",
      "/student/applications"
    );

    const studentEmail = student.user?.email;
    if (studentEmail) {
      let emailSubject = `Application Update: ${job.title}`;
      let emailHtml = `<p>Hi ${student.name},</p><p>Your application status for <strong>${job.title}</strong> has been updated to: <strong>${status}</strong>.</p>`;

      if (status === "selected") {
        emailSubject = `🎉 You're Hired! ${job.title}`;
        emailHtml = `<p>Congratulations ${student.name}!</p><p>You have been selected for the position of <strong>${job.title}</strong>.</p>`;
      } else if (status === "rejected") {
        emailSubject = `Update on your application: ${job.title}`;
        emailHtml = `<p>Hi ${student.name},</p><p>Unfortunately, the employer has decided to move forward with other candidates for <strong>${job.title}</strong>.</p>`;
      }

      await sendEmail({ to: studentEmail, subject: emailSubject, html: emailHtml });
    }

    return NextResponse.json(app);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
