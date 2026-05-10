import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import Stripe from "stripe";

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
