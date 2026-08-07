import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";

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
    const { data: validOtp, error } = await supabaseAdmin
      .from("Otp")
      .select("*")
      .eq("phone", email)
      .eq("code", code)
      .gt("expiresAt", new Date().toISOString())
      .order("createdAt", { ascending: false })
      .limit(1)
      .single();

    if (error || !validOtp) {
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });
    }

    // Delete the used OTP
    await supabaseAdmin
      .from("Otp")
      .delete()
      .eq("id", validOtp.id);

    return NextResponse.json({ success: true, message: "Email verified successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
