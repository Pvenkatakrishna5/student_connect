import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Missing email or password" }, { status: 400 });
    }

    const emailLower = email.toLowerCase().trim();

    let user = null;
    try {
      user = await prisma.user.findUnique({
        where: { email: emailLower },
      });
    } catch (dbErr: any) {
      console.error("Database connection failure during login-check:", dbErr);
      return NextResponse.json({ error: "Database connection failure" }, { status: 500 });
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.isActive) {
      return NextResponse.json({ error: "Account is inactive" }, { status: 403 });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: "Wrong password" }, { status: 401 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    console.error("Login check error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
