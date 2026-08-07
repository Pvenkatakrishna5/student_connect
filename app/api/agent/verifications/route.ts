import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { auth } from "@/lib/auth";
import { logActivity } from "@/lib/activity";

export async function GET() {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "agent" && session.user.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: pendingStudents, error } = await supabaseAdmin
      .from("Student")
      .select(`
        *,
        User(email, createdAt)
      `)
      .eq("isAadhaarVerified", false)
      .neq("aadhaarNumber", "")
      .order("updatedAt", { ascending: true });
      
    if (error) throw error;
    
    const mapped = (pendingStudents || []).map(s => {
      const { User, ...rest } = s;
      return {
        ...rest,
        user: Array.isArray(User) ? User[0] : User
      };
    });

    return NextResponse.json(mapped);
  } catch (error) {
    console.error("Fetch verifications error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "agent" && session.user.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { studentId, action, reason } = await req.json();

    if (action === "approve") {
      await supabaseAdmin
        .from("Student")
        .update({ isAadhaarVerified: true, updatedAt: new Date().toISOString() })
        .eq("id", studentId);
        
      await logActivity("verification_approved", `Student verification approved: ${studentId}`, session.user.id);
      return NextResponse.json({ message: "Student verified successfully" });
    } else if (action === "reject") {
      await supabaseAdmin
        .from("Student")
        .update({ 
          isAadhaarVerified: false,
          aadhaarNumber: "", // Reset to allow re-submission
          updatedAt: new Date().toISOString()
        })
        .eq("id", studentId);
        
      await logActivity("verification_rejected", `Student verification rejected: ${studentId}. Reason: ${reason || "Not specified"}`, session.user.id);
      return NextResponse.json({ message: "Verification rejected" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Update verification error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
