import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");

    if (!studentId) {
      return NextResponse.json({ error: "Student ID required" }, { status: 400 });
    }

    const student = await prisma.student.findUnique({ where: { userId: studentId } });
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const skills = student.skills || [];
    const city = student.city || "";

    // Find jobs matching skills or city
    const jobs = await prisma.job.findMany({
      where: {
        status: "active",
        OR: [
          { skillsRequired: { hasSome: skills } },
          { location: { contains: city, mode: "insensitive" } },
          { isRemote: true },
        ],
      },
      include: { employer: true },
    });

    // Score by relevance
    const scoredJobs = jobs.map((job) => {
      let score = 0;
      const matchingSkills = job.skillsRequired.filter((s) =>
        skills.some((sk) => sk.toLowerCase() === s.toLowerCase())
      );
      score += matchingSkills.length * 10;
      if (city && job.location.toLowerCase().includes(city.toLowerCase())) score += 5;
      if (job.isRemote) score += 2;
      return { ...job, score };
    });

    scoredJobs.sort((a, b) => b.score - a.score);

    return NextResponse.json(scoredJobs.slice(0, 10));
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
