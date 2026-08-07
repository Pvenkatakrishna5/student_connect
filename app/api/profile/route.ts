import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
      // Find a specific student profile (for employers viewing applicants)
      const { data: student, error } = await supabaseAdmin
        .from("Student")
        .select("*, User(email, role)")
        .eq("id", id)
        .single();
        
      if (error || !student) return NextResponse.json({ error: "Student not found" }, { status: 404 });
      
      const { User, ...rest } = student;
      return NextResponse.json({ ...rest, user: User });
    }

    // Get current user's profile
    if (session.user.role === "student") {
      const { data: student, error } = await supabaseAdmin
        .from("Student")
        .select("*, User(email, role)")
        .eq("userId", session.user.id)
        .single();
        
      if (error || !student) return NextResponse.json({ error: "Profile not found" }, { status: 404 });
      
      const { User, ...rest } = student;
      return NextResponse.json({ ...rest, user: User });
    }

    if (session.user.role === "employer") {
      const { data: employer, error } = await supabaseAdmin
        .from("Employer")
        .select("*, User(email, role)")
        .eq("userId", session.user.id)
        .single();
        
      if (error || !employer) return NextResponse.json({ error: "Profile not found" }, { status: 404 });
      
      const { User, ...rest } = employer;
      return NextResponse.json({ ...rest, user: User });
    }

    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();

    if (session.user.role === "student") {
      const { data: updated, error } = await supabaseAdmin
        .from("Student")
        .update({ ...data, updatedAt: new Date().toISOString() })
        .eq("userId", session.user.id)
        .select()
        .single();
        
      if (error) throw error;
      return NextResponse.json(updated);
    }

    if (session.user.role === "employer") {
      const { data: updated, error } = await supabaseAdmin
        .from("Employer")
        .update({ ...data, updatedAt: new Date().toISOString() })
        .eq("userId", session.user.id)
        .select()
        .single();
        
      if (error) throw error;
      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
