import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
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
      const { data: app } = await supabaseAdmin
        .from("Application")
        .select("*, Student(*), Job(*)")
        .eq("id", applicationId)
        .single();

      if (!app) {
        console.error("❌ Application not found:", applicationId);
        return NextResponse.json({ error: "App not found" }, { status: 404 });
      }

      // 2. Prevent double processing
      if (app.status === "selected") {
        return NextResponse.json({ message: "Already processed" }, { status: 200 });
      }

      const amountPaid = (session.amount_total || 0) / 100;

      // 3. Sequential Updates (Supabase REST API alternative to transaction)
      // Mark application as selected
      await supabaseAdmin
        .from("Application")
        .update({ status: "selected" })
        .eq("id", applicationId);
        
      // Update student earnings
      if (app.Student) {
        const { data: currentStudent } = await supabaseAdmin
          .from("Student")
          .select("totalEarnings, completedJobs")
          .eq("id", app.studentId)
          .single();
          
        if (currentStudent) {
          await supabaseAdmin
            .from("Student")
            .update({
              totalEarnings: currentStudent.totalEarnings + amountPaid,
              completedJobs: currentStudent.completedJobs + 1
            })
            .eq("id", app.studentId);
        }
      }
      
      // Decrement spots available in job
      if (app.Job) {
        const { data: currentJob } = await supabaseAdmin
          .from("Job")
          .select("spotsAvailable, hiredCount")
          .eq("id", app.jobId)
          .single();
          
        if (currentJob) {
          await supabaseAdmin
            .from("Job")
            .update({
              spotsAvailable: Math.max(0, currentJob.spotsAvailable - 1),
              hiredCount: currentJob.hiredCount + 1
            })
            .eq("id", app.jobId);
        }
      }
      
      // Create Payment record
      await supabaseAdmin
        .from("Payment")
        .insert({
          id: crypto.randomUUID(),
          applicationId: applicationId,
          employerId: app.employerId,
          amount: amountPaid,
          status: "PAID",
          stripeId: session.id,
          paidAt: new Date().toISOString()
        });
        
      // Create Earning record
      await supabaseAdmin
        .from("Earning")
        .insert({
          id: crypto.randomUUID(),
          studentId: app.studentId,
          amount: amountPaid,
          description: `Payment for job: ${app.Job?.title || "Unknown"}`
        });

      // 4. Notifications & Logs
      if (app.Student?.userId) {
        await createNotification(
          app.Student.userId,
          "🎉 You're Hired!",
          `Congratulations! You've been hired for "${app.Job?.title || "Unknown"}" and ₹${amountPaid} has been credited to your account.`,
          "success",
          "/student/earnings"
        );

        await logActivity(
          "payment_received",
          `Student ${app.Student.name} received ₹${amountPaid} for ${app.Job?.title}`,
          app.Student.userId,
          { amount: amountPaid, jobId: app.jobId }
        );
      }

      console.log(`✅ Payment handled for application ${applicationId}`);
      return NextResponse.json({ received: true });
    } catch (err: any) {
      console.error("❌ Database Transaction Error:", err.message);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
