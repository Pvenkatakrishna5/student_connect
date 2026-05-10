import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import Stripe from "stripe";
import { createNotification } from "@/lib/notifications";
import { logActivity } from "@/lib/activity";

export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_dummy", {
  apiVersion: "2024-12-18.acacia" as any,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature") || "";

  let event: Stripe.Event;

  try {
    if (!webhookSecret) {
      console.warn("⚠️ Stripe Webhook Secret is missing, skipping signature verification.");
      event = JSON.parse(body) as Stripe.Event;
    } else {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    }
  } catch (err: any) {
    console.error(`❌ Webhook Error: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle the event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const { applicationId, jobId, employerId } = session.metadata || {};

    if (!applicationId) {
      console.error("❌ No applicationId found in session metadata");
      return NextResponse.json({ error: "No applicationId" }, { status: 400 });
    }

    try {
      // 1. Get current application and student info
      const app = await prisma.application.findUnique({
        where: { id: applicationId },
        include: { student: true, job: true }
      });

      if (!app) {
        console.error("❌ Application not found:", applicationId);
        return NextResponse.json({ error: "App not found" }, { status: 404 });
      }

      // 2. Prevent double processing
      if (app.status === "selected") {
        return NextResponse.json({ message: "Already processed" }, { status: 200 });
      }

      const amountPaid = (session.amount_total || 0) / 100;

      // 3. Update Database in a transaction
      await prisma.$transaction([
        // Mark application as selected
        prisma.application.update({
          where: { id: applicationId },
          data: { status: "selected" }
        }),
        // Update student earnings and stats
        prisma.student.update({
          where: { id: app.studentId },
          data: {
            totalEarnings: { increment: amountPaid },
            completedJobs: { increment: 1 }
          }
        }),
        // Decrement spots available in job
        prisma.job.update({
          where: { id: app.jobId },
          data: {
            spotsAvailable: { decrement: 1 },
            hiredCount: { increment: 1 }
          }
        })
      ]);

      // 4. Notifications & Logs
      await createNotification(
        app.student.userId,
        "🎉 You're Hired!",
        `Congratulations! You've been hired for "${app.job.title}" and ₹${amountPaid} has been credited to your account.`,
        "success",
        "/student/earnings"
      );

      await logActivity(
        "payment_received",
        `Student ${app.student.name} received ₹${amountPaid} for ${app.job.title}`,
        app.student.userId,
        { amount: amountPaid, jobId: app.jobId }
      );

      console.log(`✅ Payment handled for application ${applicationId}`);
      return NextResponse.json({ received: true });
    } catch (err: any) {
      console.error("❌ Database Transaction Error:", err.message);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
