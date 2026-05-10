import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { phone, code } = await req.json();
    if (!phone || !code) return NextResponse.json({ error: "Phone and Code are required" }, { status: 400 });

    // Find the latest valid OTP for this phone
    const validOtp = await prisma.otp.findFirst({
      where: {
        phone,
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

    return NextResponse.json({ success: true, message: "Phone verified successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
