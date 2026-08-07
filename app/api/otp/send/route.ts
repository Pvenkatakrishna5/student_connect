import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { sendEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });

    // Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins valid

    // Store in DB
    const { error } = await supabaseAdmin
      .from("Otp")
      .insert({
        id: crypto.randomUUID(),
        phone: email, // Using phone field to store email for backward compatibility of the model
        code,
        expiresAt: expiresAt.toISOString(),
        createdAt: new Date().toISOString()
      });
      
    if (error) throw error;

    const emailSent = await sendEmail({
      to: email,
      subject: "Your StudentConnect Verification Code",
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>Verify your Email</h2>
          <p>Your StudentConnect verification code is:</p>
          <h1 style="letter-spacing: 5px; color: #10b981;">${code}</h1>
          <p>This code will expire in 5 minutes.</p>
        </div>
      `,
    });

    // In development or if SMTP is not configured, just log it and succeed
    if (process.env.NODE_ENV === "development" || !process.env.EMAIL_USER) {
      console.log(`\n\n[AUTH] 🔐 OTP for ${email}: ${code}\n\n`);
      return NextResponse.json({ success: true, message: "OTP sent successfully (Logged to console)" });
    }

    if (!emailSent) {
      return NextResponse.json({ error: "Failed to send email. Please check your email address or SMTP configuration." }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "OTP sent successfully" });
  } catch (error: any) {
    console.error("OTP SEND ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
