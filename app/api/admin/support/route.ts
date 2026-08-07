import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Find the primary admin user
    const { data: admin, error } = await supabaseAdmin
      .from("User")
      .select("id, email")
      .eq("role", "admin")
      .limit(1)
      .single();

    if (error || !admin) {
      return NextResponse.json({ error: "Support system is currently offline" }, { status: 404 });
    }

    return NextResponse.json({ 
      adminId: admin.id,
      name: "Platform Support",
      role: "admin"
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
