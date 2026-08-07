import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");

    if (!studentId) {
      return NextResponse.json({ error: "Student ID required" }, { status: 400 });
    }

    // 1. Get student profile
    const { data: student, error: studentError } = await supabaseAdmin
      .from("Student")
      .select("*")
      .eq("userId", studentId)
      .single();

    if (studentError || !student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const skills = student.skills || [];
    const city = student.city || "";

    // 2. Get student's existing applications to exclude them
    const { data: applications } = await supabaseAdmin
      .from("Application")
      .select("jobId")
      .eq("studentId", student.id);

    const appliedJobIds = (applications || []).map(a => a.jobId);

    // 3. Find active jobs matching skills or city, excluding already applied
    let query = supabaseAdmin
      .from("Job")
      .select("*, Employer(companyName, logo, isVerifiedBusiness)")
      .eq("status", "active");

    // We fetch a larger set and filter/score in memory since Supabase JS 
    // doesn't have a direct equivalent to Prisma's `hasSome` for arrays without raw SQL.
    const { data: activeJobs, error: jobsError } = await query.limit(100);

    if (jobsError) throw jobsError;

    // Filter out applied jobs
    const availableJobs = (activeJobs || []).filter(job => !appliedJobIds.includes(job.id));

    // 4. Advanced Scoring
    const scoredJobs = availableJobs.map((job) => {
      let score = 0;
      
      // Skill match (Weight: 10 per skill)
      const matchingSkills = job.skillsRequired.filter((s: string) =>
        skills.some((sk: string) => sk.toLowerCase() === s.toLowerCase())
      );
      score += matchingSkills.length * 10;
      
      // Location match (Weight: 5)
      if (city && job.location.toLowerCase().includes(city.toLowerCase())) {
        score += 5;
      }
      
      // Remote preference (Weight: 2)
      if (job.isRemote) {
        score += 2;
      }

      // Verified Employer (Weight: 3)
      if (job.Employer?.isVerifiedBusiness) {
        score += 3;
      }

      // Urgent/High Pay
      if (job.payAmount > 500) {
        score += 2;
      }

      const { Employer, ...rest } = job;
      return { ...rest, employer: Employer, score };
    });

    // Filter to only those with some relevance or fallback to highest pay
    const relevantJobs = scoredJobs.filter(j => j.score > 0 || skills.length === 0);

    // Sort by score and take top 10
    relevantJobs.sort((a, b) => (b.score as number) - (a.score as number));

    return NextResponse.json(relevantJobs.slice(0, 10));
  } catch (err: any) {
    console.error("Error in recommended jobs:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
