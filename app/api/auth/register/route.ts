import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { logActivity } from "@/lib/activity";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      email, password, role, name, companyName, contactName,
      college, branch, year, city, phone, skills, availability,
    } = body;

    if (!email || !password || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const emailLower = email.toLowerCase();

    let existing = null;
    try {
      existing = await prisma.user.findUnique({
        where: { email: emailLower },
      });
    } catch (dbErr) {
      console.error("Database connection failure in registration lookup:", dbErr);
      return NextResponse.json({ error: "Database unavailable" }, { status: 500 });
    }

    if (existing) {
      return NextResponse.json({ error: "Email already exists" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    let user;
    try {
      user = await prisma.user.create({
        data: {
          email: emailLower,
          passwordHash,
          role,
          isVerified: true, // Auto-verified for zero-friction production login
        },
      });
    } catch (dbErr) {
      console.error("Database connection failure during user creation in registration:", dbErr);
      return NextResponse.json({ error: "Database unavailable" }, { status: 500 });
    }

    if (role === "student") {
      const studentData = {
        userId: user.id,
        name: name || "",
        college: college || "",
        branch: branch || "",
        year: year || "",
        city: city || "",
        phone: phone || "",
        aadhaarNumber: body.aadhaarNumber || "",
        isAadhaarVerified: !!body.aadhaarNumber,
        skills: skills || [],
        availability: availability || {},
      };
      await prisma.student.create({ data: studentData });

      await logActivity("user_registered", `New student joined: ${name || email}`, user.id);
    } else if (role === "employer") {
      const employerData = {
        userId: user.id,
        companyName: companyName || "",
        contactName: contactName || "",
        city: city || "",
        phone: phone || "",
      };
      await prisma.employer.create({ data: employerData });

      await logActivity("user_registered", `New employer joined: ${companyName || email}`, user.id);
    } else if (role === "agent") {
      await logActivity("user_registered", `New agent joined: ${email}`, user.id);
    }

    return NextResponse.json({ success: true, userId: user.id }, { status: 201 });
  } catch (err: unknown) {
    console.error("Registration server error:", err);
    const message = err instanceof Error ? err.message : "";
    if (message.includes("Database connection") || message.includes("tenant") || message.includes("pool") || message.includes("reach database")) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 500 });
    }
    return NextResponse.json({ error: "Database unavailable" }, { status: 500 });
  }
}
