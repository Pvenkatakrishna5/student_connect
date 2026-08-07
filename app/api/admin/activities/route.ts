import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: activities, error } = await supabaseAdmin
      .from("Activity")
      .select(`
        *,
        User(email, role)
      `)
      .order("createdAt", { ascending: false })
      .limit(50);
      
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
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
