import { auth } from "@/lib/auth";
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
