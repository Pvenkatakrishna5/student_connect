import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";

export async function GET(req: Request) {
  try {
    const { data: applications, error } = await supabaseAdmin
      .from("Application")
      .select(`
        *,
        Student(*),
        Employer(*),
        Job(*)
      `)
      .order("appliedAt", { ascending: false });
      
    if (error) throw error;
    
    const mapped = (applications || []).map(a => {
      const { Student, Employer, Job, ...rest } = a;
      return {
        ...rest,
        student: Array.isArray(Student) ? Student[0] : Student,
        employer: Array.isArray(Employer) ? Employer[0] : Employer,
        job: Array.isArray(Job) ? Job[0] : Job
      };
    });
    
    return NextResponse.json(mapped);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
