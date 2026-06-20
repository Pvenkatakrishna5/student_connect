import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import prisma from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_mock_key", {
  apiVersion: "2024-12-18.acacia" as any, // Using type any to bypass strictly typed version if mismatched
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "employer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { amount, description, jobId, applicationId } = await req.json();

    if (!amount) {
      return NextResponse.json({ error: "Amount is required" }, { status: 400 });
    }

    // DEVELOPMENT BYPASS: If no real Stripe key is provided, simulate a successful payment instantly
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes("mock_key")) {
      console.log("⚠️ No Stripe key found. Bypassing Stripe and simulating successful payment...");
      
      const app = await prisma.application.findUnique({
        where: { id: applicationId },
        include: { student: true, job: true }
      });
      
      if (app && app.status !== "selected") {
        await prisma.$transaction([
          prisma.application.update({ where: { id: applicationId }, data: { status: "selected" } }),
          prisma.student.update({
            where: { id: app.studentId },
            data: { totalEarnings: { increment: amount }, completedJobs: { increment: 1 } }
          }),
          prisma.job.update({
            where: { id: app.jobId },
            data: { spotsAvailable: { decrement: 1 }, hiredCount: { increment: 1 } }
          }),
          prisma.payment.create({
            data: { applicationId: applicationId, employerId: app.employerId, amount: amount, status: "PAID", stripeId: "simulated_payment_id", paidAt: new Date() }
          }),
          prisma.earning.create({
            data: { studentId: app.studentId, amount: amount, description: `Payment for job: ${app.job.title}` }
          })
        ]);
        
        // Dynamic import for createNotification/logActivity to avoid top-level issues if any
        const { createNotification } = await import("@/lib/notifications");
        const { logActivity } = await import("@/lib/activity");
        
        await createNotification(
          app.student.userId,
          "🎉 You're Hired!",
          `Congratulations! You've been hired for "${app.job.title}" and ₹${amount} has been credited to your account.`,
          "success",
          "/student/earnings"
        );
        await logActivity("payment_received", `Student ${app.student.name} received ₹${amount} for ${app.job.title}`, app.student.userId, { amount, jobId: app.jobId });
      }

      return NextResponse.json({ url: `${process.env.NEXTAUTH_URL}/employer/billing?success=true&jobId=${jobId || ""}` });
    }

    // Create Checkout Sessions from body params.
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: description || "StudentConnect Job Payment",
            },
            unit_amount: amount * 100, // Amount in paise
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXTAUTH_URL}/employer/billing?success=true&jobId=${jobId || ""}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/employer/billing?canceled=true`,
      metadata: {
        employerId: session.user.id,
        jobId: jobId || "",
        applicationId: applicationId || "",
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err: any) {
    console.error("Stripe Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
