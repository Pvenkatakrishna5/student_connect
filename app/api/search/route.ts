import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { SAMPLE_JOBS } from "@/lib/data";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";
    const category = searchParams.get("category") || "";
    const location = searchParams.get("location") || "";
    const minPay = parseInt(searchParams.get("minPay") || "0");
    const type = searchParams.get("type") || "";

    const where: Record<string, unknown> = { status: "active" };
    const andConditions: Record<string, unknown>[] = [];

    if (query) {
      andConditions.push({
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
          { skillsRequired: { has: query } },
        ],
      });
    }

    if (category && category !== "All") {
      andConditions.push({ category });
    }

    if (location) {
      andConditions.push({ location: { contains: location, mode: "insensitive" } });
    }

    if (minPay > 0) {
      andConditions.push({ payAmount: { gte: minPay } });
    }

    if (type) {
      andConditions.push({ payType: type });
    }

    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    try {
      const jobs = await prisma.job.findMany({
        where,
        include: {
          employer: {
            select: {
              companyName: true,
              rating: true,
              city: true,
              isVerifiedBusiness: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      });

      return NextResponse.json(jobs);
    } catch (dbErr) {
      console.error("Search DB query failed, serving sample jobs:", dbErr);
      let fallback = SAMPLE_JOBS;
      const q = query.toLowerCase();
      if (q) {
        fallback = fallback.filter(
          (job) =>
            job.title.toLowerCase().includes(q) ||
            job.description.toLowerCase().includes(q) ||
            job.skillsRequired.some((s) => s.toLowerCase().includes(q))
        );
      }
      if (category && category !== "All") {
        fallback = fallback.filter((job) => job.category === category);
      }
      if (location) {
        fallback = fallback.filter((job) => job.location.toLowerCase().includes(location.toLowerCase()));
      }
      if (minPay > 0) {
        fallback = fallback.filter((job) => job.payAmount >= minPay);
      }
      if (type) {
        fallback = fallback.filter((job) => job.payType === type);
      }
      return NextResponse.json(fallback);
    }
  } catch (error: unknown) {
    console.error("Search API Error:", error);
    return NextResponse.json(SAMPLE_JOBS);
  }
}
