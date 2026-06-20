import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });

    // Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins valid

    // Store in DB
    await prisma.otp.create({
      data: { phone: email, code, expiresAt } // Using phone field to store email for backward compatibility of the model
    });

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

    // In development or if Resend key is missing/mocked, log it
    if (process.env.NODE_ENV === "development" || !process.env.RESEND_API_KEY) {
      console.log(`\n\n[AUTH] 🔐 OTP for ${email}: ${code}\n\n`);
    }

    // Always return error if email fails, regardless of development environment
    if (!emailSent) {
      return NextResponse.json({ error: "Failed to send email. Please check your email address or SMTP configuration." }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "OTP sent successfully" });
  } catch (error: any) {
    console.error("OTP SEND ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
