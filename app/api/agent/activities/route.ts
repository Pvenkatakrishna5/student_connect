import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id || (session.user.role !== "agent" && session.user.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: activities, error } = await supabaseAdmin
      .from("Activity")
      .select(`
        *,
        User(email, role)
      `)
      .in("type", ["verification_approved", "verification_rejected", "job_approved", "job_rejected", "user_registered", "identity_verified"])
      .order("createdAt", { ascending: false })
      .limit(30);
      
    if (error) throw error;
    
    const mapped = (activities || []).map(a => {
      const { User, ...rest } = a;
      return {
        ...rest,
        user: Array.isArray(User) ? User[0] : User
      };
    });

    return NextResponse.json(mapped);
  } catch (error) {
    console.error("Agent activities error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
