import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
          const { searchParams } = new URL(req.url);
          const userId = searchParams.get("userId");

      if (!userId) {
              return NextResponse.json(
                { error: "User ID is required" },
                { status: 400 }
                      );
      }

      const user = await prisma.user.findUnique({
              where: { id: userId },
              select: { skills: true },
      });

      if (!user) {
              return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const { skills } = user;

      const jobs = await prisma.job.findMany({
              where: {
                        status: "OPEN",
              },
      });

      const scoredJobs = jobs.map((job: any) => {
              let score = 0;
              const matchingSkills = job.skillsRequired.filter((s: any) =>
                        skills.some((sk: any) => sk.toLowerCase() === s.toLowerCase())
                                                                     );

                                        score = matchingSkills.length;

                                        return {
                                                  ...job,
                                                  matchingSkillsCount: score,
                                                  matchingSkills,
                                        };
      });

      const recommendedJobs = scoredJobs
            .filter((job: any) => job.matchingSkillsCount > 0)
            .sort((a: any, b: any) => b.matchingSkillsCount - a.matchingSkillsCount);

      return NextResponse.json(recommendedJobs);
    } catch (err: any) {
          return NextResponse.json(
            { error: err.message },
            { status: 500 }
                );
    }
}
