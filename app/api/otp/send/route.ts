import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();
    if (!phone) return NextResponse.json({ error: "Phone number is required" }, { status: 400 });

    // Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins valid

    // Store in DB
    await prisma.otp.create({
      data: { phone, code, expiresAt }
    });

    // In production, you would integrate an SMS provider like Twilio here.
    // console.log(`[AUTH] OTP for ${phone}: ${code}`);

    return NextResponse.json({ success: true, message: "OTP sent successfully" });
  } catch (error: any) {
    console.error("OTP SEND ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
