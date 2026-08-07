import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    let profile = null;

    if (session.user.role === "student") {
      const { data } = await supabaseAdmin
        .from("Student")
        .select("*")
        .eq("userId", session.user.id)
        .single();
      profile = data;
    } else if (session.user.role === "employer") {
      const { data } = await supabaseAdmin
        .from("Employer")
        .select("*")
        .eq("userId", session.user.id)
        .single();
      profile = data;
    }

    return NextResponse.json({
      id: session.user.id,
      email: session.user.email,
      role: session.user.role,
      name: session.user.name,
      ...profile,
    });
  } catch (error) {
    console.error("Auth/me error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
