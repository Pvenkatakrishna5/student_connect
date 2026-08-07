import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { logActivity } from "@/lib/activity";
import { sendWelcomeEmail } from "@/lib/email";

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
      const { data } = await supabaseAdmin
        .from("User")
        .select("id")
        .eq("email", emailLower)
        .single();
      existing = data;
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
      const { data, error } = await supabaseAdmin
        .from("User")
        .insert({
          id: crypto.randomUUID(),
          email: emailLower,
          passwordHash,
          role,
          isVerified: true, // Auto-verified for zero-friction production login
          isActive: true,
          updatedAt: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      user = data;
    } catch (dbErr) {
      console.error("Database connection failure during user creation in registration:", dbErr);
      return NextResponse.json({ error: "Database unavailable" }, { status: 500 });
    }

    if (role === "student") {
      const studentData = {
        id: crypto.randomUUID(),
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
        profileCompleted: false,
        updatedAt: new Date().toISOString(),
      };
      await supabaseAdmin.from("Student").insert(studentData);

      await logActivity("user_registered", `New student joined: ${name || email}`, user.id);
    } else if (role === "employer") {
      const employerData = {
        id: crypto.randomUUID(),
        userId: user.id,
        companyName: companyName || "",
        contactName: contactName || "",
        city: city || "",
        phone: phone || "",
        approvalStatus: "pending",
        profileCompleted: false,
        updatedAt: new Date().toISOString(),
      };
      await supabaseAdmin.from("Employer").insert(employerData);

      await logActivity("user_registered", `New employer joined: ${companyName || email}`, user.id);
    } else if (role === "agent") {
      await logActivity("user_registered", `New agent joined: ${email}`, user.id);
    }

    // Send welcome email asynchronously
    const displayName = role === "employer" ? companyName : (name || email.split("@")[0]);
    sendWelcomeEmail(emailLower, displayName, role).catch(e => console.error("Welcome email failed", e));

    return NextResponse.json({ success: true, userId: user.id }, { status: 201 });
  } catch (err: unknown) {
    console.error("Registration server error:", err);
    return NextResponse.json({ error: "Database unavailable" }, { status: 500 });
  }
}
