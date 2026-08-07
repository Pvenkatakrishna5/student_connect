import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabaseClient";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Missing email or password" }, { status: 400 });
    }

    const emailLower = email.toLowerCase().trim();

    let user = null;
    try {
      const { data, error } = await supabaseAdmin
        .from("User")
        .select("*")
        .eq("email", emailLower)
        .single();
      if (error && error.code !== "PGRST116") throw error;
      user = data;
    } catch (dbErr: any) {
      console.error("Database connection failure during login-check:", dbErr);
      return NextResponse.json({ error: "Database unavailable" }, { status: 500 });
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.isActive) {
      return NextResponse.json({ error: "Account is inactive" }, { status: 403 });
    }

    if (!user.isVerified) {
      return NextResponse.json({ error: "Email not verified" }, { status: 403 });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    console.error("Login check error:", err);
    return NextResponse.json({ error: "Database unavailable" }, { status: 500 });
  }
}
