import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: users, error } = await supabaseAdmin
      .from("User")
      .select(`
        id, email, role, createdAt, isActive,
        Student(*),
        Employer(*)
      `)
      .order("createdAt", { ascending: false });
      
    if (error) throw error;
    
    // Map back to Prisma-like shape for frontend compatibility
    const mapped = (users || []).map(u => {
      const { Student, Employer, ...rest } = u;
      return { 
        ...rest, 
        // Supabase returns an array for relationships if it's not a strict 1:1 foreign key,
        // so we take the first item if it's an array, or the object itself
        student: Array.isArray(Student) ? Student[0] : Student,
        employer: Array.isArray(Employer) ? Employer[0] : Employer
      };
    });

    return NextResponse.json(mapped);
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, ...updateData } = await req.json();
    
    const { data: user, error } = await supabaseAdmin
      .from("User")
      .update({ ...updateData, updatedAt: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
      
    if (error) throw error;

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
