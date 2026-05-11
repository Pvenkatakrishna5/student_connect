import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");

    if (!studentId) {
      return NextResponse.json({ error: "Student ID required" }, { status: 400 });
    }

    // 1. Get student profile
    const student = await prisma.student.findUnique({ where: { userId: studentId } });
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const skills = student.skills || [];
    const city = student.city || "";

    // 2. Get student's existing applications to exclude them
    const applications = await prisma.application.findMany({
      where: { studentId: studentId },
      select: { jobId: true }
    });
    const appliedJobIds = applications.map(a => a.jobId);

    // 3. Find active jobs matching skills or city, excluding already applied
    const jobs = await prisma.job.findMany({
      where: {
        status: "active",
        id: { notIn: appliedJobIds },
        OR: [
          { skillsRequired: { hasSome: skills.length > 0 ? skills : ["General"] } },
          { location: { contains: city, mode: "insensitive" } },
          { isRemote: true },
        ],
      },
      include: { 
        employer: {
          select: {
            companyName: true,
            logo: true,
            isVerifiedBusiness: true
          }
        } 
      },
      take: 50, // Limit search for performance
    });

    // 4. Advanced Scoring
    const scoredJobs = jobs.map((job) => {
      let score = 0;
      
      // Skill match (Weight: 10 per skill)
      const matchingSkills = job.skillsRequired.filter((s) =>
        skills.some((sk) => sk.toLowerCase() === s.toLowerCase())
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
      if (job.employer?.isVerifiedBusiness) {
        score += 3;
      }

      // Urgent/High Pay (Example logic)
      if (job.payAmount > 500) {
        score += 2;
      }

      return { ...job, score };
    });


    // Sort by score and take top 10
    scoredJobs.sort((a, b) => b.score - a.score);

    return NextResponse.json(scoredJobs.slice(0, 10));
  } catch (err: any) {
    console.error("Error in recommended jobs:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
