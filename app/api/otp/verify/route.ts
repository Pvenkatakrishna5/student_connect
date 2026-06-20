import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();
    if (!email || !code) return NextResponse.json({ error: "Email and Code are required" }, { status: 400 });

    // MASTER OTP for Demo/Testing (Only works if explicitly enabled in env)
    const isMasterAllowed = process.env.ALLOW_MASTER_OTP === "true";
    if (isMasterAllowed && (code === "123456")) {
      return NextResponse.json({ success: true, message: "Master OTP verified" });
    }

    // Find the latest valid OTP for this email
    const validOtp = await prisma.otp.findFirst({
      where: {
        phone: email,
        code,
        expiresAt: { gt: new Date() }
      },
      orderBy: { createdAt: "desc" }
    });

    if (!validOtp) {
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });
    }

    // Delete the used OTP
    await prisma.otp.delete({ where: { id: validOtp.id } });

    return NextResponse.json({ success: true, message: "Email verified successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
