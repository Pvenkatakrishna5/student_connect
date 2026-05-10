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

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        role,
      },
    });

    if (role === "student") {
      await prisma.student.create({
        data: {
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
        },
      });
      await logActivity("user_registered", `New student joined: ${name || email}`, user.id);
    } else if (role === "employer") {
      await prisma.employer.create({
        data: {
          userId: user.id,
          companyName: companyName || "",
          contactName: contactName || "",
          city: city || "",
          phone: phone || "",
        },
      });
      await logActivity("user_registered", `New employer joined: ${companyName || email}`, user.id);
    }

    return NextResponse.json({ success: true, userId: user.id }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
