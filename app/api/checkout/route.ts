import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabaseClient";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_mock_key", {
  apiVersion: "2024-12-18.acacia" as any,
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
      
      const { data: app, error } = await supabaseAdmin
        .from("Application")
        .select("*, Student(*), Job(*)")
        .eq("id", applicationId)
        .single();
        
      if (app && app.status !== "selected") {
        // We'll execute sequential updates since there's no transaction in REST
        // 1. Update application
        await supabaseAdmin
          .from("Application")
          .update({ status: "selected" })
          .eq("id", applicationId);
          
        // 2. Update student earnings
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
                totalEarnings: currentStudent.totalEarnings + amount,
                completedJobs: currentStudent.completedJobs + 1
              })
              .eq("id", app.studentId);
          }
        }
        
        // 3. Update job spots
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
        
        // 4. Create payment
        await supabaseAdmin
          .from("Payment")
          .insert({
            id: crypto.randomUUID(),
            applicationId: applicationId,
            employerId: app.employerId,
            amount: amount,
            status: "PAID",
            stripeId: "simulated_payment_id",
            paidAt: new Date().toISOString()
          });
          
        // 5. Create earning
        await supabaseAdmin
          .from("Earning")
          .insert({
            id: crypto.randomUUID(),
            studentId: app.studentId,
            amount: amount,
            description: `Payment for job: ${app.Job?.title || "Unknown"}`
          });
        
        // Notifications
        if (app.Student?.userId) {
          const { createNotification } = await import("@/lib/notifications");
          const { logActivity } = await import("@/lib/activity");
          
          await createNotification(
            app.Student.userId,
            "🎉 You're Hired!",
            `Congratulations! You've been hired for "${app.Job?.title || "Unknown"}" and ₹${amount} has been credited to your account.`,
            "success",
            "/student/earnings"
          );
          await logActivity("payment_received", `Student ${app.Student.name} received ₹${amount} for ${app.Job?.title}`, app.Student.userId, { amount, jobId: app.jobId });
        }
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
