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
    const jobId = searchParams.get("jobId");
    const role = session.user.role;

    if (role === "employer") {
      // Find employer profile first
      const { data: employer } = await supabaseAdmin
        .from("Employer")
        .select("id")
        .eq("userId", session.user.id)
        .single();
        
      if (!employer) return NextResponse.json({ error: "Employer not found" }, { status: 404 });

      let query = supabaseAdmin
        .from("Application")
        .select("*, Student(*), Job(*)")
        .eq("employerId", employer.id);
        
      if (jobId) {
        query = query.eq("jobId", jobId);
      }
      
      const { data: applications, error } = await query.order("appliedAt", { ascending: false });
      if (error) throw error;
      
      const mapped = (applications || []).map(a => {
        const { Student, Job, ...rest } = a;
        return { ...rest, student: Student, job: Job };
      });
      
      return NextResponse.json(mapped);
    } 
    
    if (role === "student") {
      // Find student profile first
      const { data: student } = await supabaseAdmin
        .from("Student")
        .select("id")
        .eq("userId", session.user.id)
        .single();
        
      if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });

      const { data: applications, error } = await supabaseAdmin
        .from("Application")
        .select("*, Employer(*), Job(*)")
        .eq("studentId", student.id)
        .order("appliedAt", { ascending: false });
        
      if (error) throw error;
      
      const mapped = (applications || []).map(a => {
        const { Employer, Job, ...rest } = a;
        return { ...rest, employer: Employer, job: Job };
      });
      
      return NextResponse.json(mapped);
    }

    return NextResponse.json({ error: "Invalid role" }, { status: 403 });
  } catch (error: any) {
    console.error("Applications GET Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { jobId, employerId, coverLetter, paymentMethod } = await req.json();
    
    // Find student ID
    const { data: student } = await supabaseAdmin
      .from("Student")
      .select("id")
      .eq("userId", session.user.id)
      .single();
      
    if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });

    const { data: existingApp } = await supabaseAdmin
      .from("Application")
      .select("id")
      .eq("jobId", jobId)
      .eq("studentId", student.id)
      .single();

    if (existingApp) {
      return NextResponse.json({ error: "Already applied" }, { status: 400 });
    }

    const { data: application, error } = await supabaseAdmin
      .from("Application")
      .insert({
        id: crypto.randomUUID(),
        jobId,
        studentId: student.id,
        employerId,
        coverNote: coverLetter || "",
        status: "applied",
        appliedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      .select()
      .single();
      
    if (error) throw error;

    return NextResponse.json(application, { status: 201 });
  } catch (error: any) {
    console.error("Applications POST Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "employer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { applicationId, status } = await req.json();
    
    // Find employer ID
    const { data: employer } = await supabaseAdmin
      .from("Employer")
      .select("id")
      .eq("userId", session.user.id)
      .single();
      
    if (!employer) return NextResponse.json({ error: "Employer not found" }, { status: 404 });

    const { data: application, error } = await supabaseAdmin
      .from("Application")
      .update({ status, updatedAt: new Date().toISOString() })
      .eq("id", applicationId)
      .eq("employerId", employer.id)
      .select("*, Student(userId)")
      .single();
      
    if (error || !application) {
      return NextResponse.json({ error: "Application not found or unauthorized" }, { status: 404 });
    }

    // Dynamic import for createNotification to avoid circular deps if any
    const { createNotification } = await import("@/lib/notifications");
    
    if (status === "selected") {
      await createNotification(
        application.Student.userId,
        "Application Accepted! 🎉",
        "You have been selected for a job! Check your applications.",
        "success",
        "/student/applications"
      );
    } else if (status === "rejected") {
      await createNotification(
        application.Student.userId,
        "Application Status Update",
        "Unfortunately, you were not selected for this position.",
        "error",
        "/student/applications"
      );
    }

    const { Student, ...rest } = application;
    return NextResponse.json({ ...rest, student: Student });
  } catch (error: any) {
    console.error("Applications PATCH Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
