import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { role } = session.user;

    if (role === "student") {
      // Find student profile first
      const { data: student, error: studentError } = await supabaseAdmin
        .from("Student")
        .select("id")
        .eq("userId", session.user.id)
        .single();

      if (studentError || !student) {
        return NextResponse.json({ error: "Student profile not found" }, { status: 404 });
      }

      // Fetch student earnings
      const { data: earnings, error: earningsError } = await supabaseAdmin
        .from("Earning")
        .select("*")
        .eq("studentId", student.id)
        .order("createdAt", { ascending: false });
        
      if (earningsError) throw earningsError;

      return NextResponse.json({ role, data: earnings || [] });
    }

    if (role === "employer") {
      // Find employer profile
      const { data: employer, error: employerError } = await supabaseAdmin
        .from("Employer")
        .select("id")
        .eq("userId", session.user.id)
        .single();

      if (employerError || !employer) {
        return NextResponse.json({ error: "Employer profile not found" }, { status: 404 });
      }

      // Fetch employer payments
      const { data: payments, error: paymentsError } = await supabaseAdmin
        .from("Payment")
        .select(`
          *,
          Application(
            Job(title),
            Student(name)
          )
        `)
        .eq("employerId", employer.id)
        .order("createdAt", { ascending: false });
        
      if (paymentsError) throw paymentsError;

      // Restructure to match Prisma's output shape for the frontend
      const mappedPayments = (payments || []).map(p => {
        const { Application, ...rest } = p;
        return {
          ...rest,
          application: Application ? {
            job: Application.Job,
            student: Application.Student
          } : null
        };
      });

      return NextResponse.json({ role, data: mappedPayments });
    }

    return NextResponse.json({ error: "Invalid role access" }, { status: 403 });
  } catch (err: any) {
    console.error("Billing History Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
