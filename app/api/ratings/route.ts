import { auth } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    if (!userId) {
      const { NextResponse } = await import("next/server");
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }
    const { default: prisma } = await import("@/lib/prisma");
    const { NextResponse } = await import("next/server");
    const ratings = await prisma.rating.findMany({
      where: { toId: userId },
      include: {
        from: { select: { email: true, role: true, student: { select: { name: true } }, employer: { select: { companyName: true } } } },
        job: { select: { title: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    return NextResponse.json(ratings);
  } catch (err: any) {
    const { NextResponse } = await import("next/server");
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { toId, toRole, jobId, score, review, applicationId } = await req.json();

    if (!toId || !score) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Create the rating record
    const rating = await prisma.$transaction(async (tx) => {
      const r = await tx.rating.create({
        data: {
          fromId: session.user.id,
          toId,
          toRole,
          jobId,
          score: Number(score),
          review: review || "",
        },
      });

      // 2. Update the target's aggregate rating (if student)
      if (toRole === "student") {
        const student = await tx.student.findUnique({ where: { userId: toId } });
        if (student) {
          const newTotalRatings = student.totalRatings + 1;
          const newRating = ((student.rating * student.totalRatings) + score) / newTotalRatings;
          
          await tx.student.update({
            where: { userId: toId },
            data: {
              rating: newRating,
              totalRatings: newTotalRatings,
              completedJobs: { increment: 1 }
            }
          });
        }
      }

      // 3. Mark application as finalized if provided
      if (applicationId) {
        await tx.application.update({
          where: { id: applicationId },
          data: { status: "completed" }
        });
      }

      return r;
    });

    return NextResponse.json(rating);
  } catch (error: any) {
    console.error("Rating Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
