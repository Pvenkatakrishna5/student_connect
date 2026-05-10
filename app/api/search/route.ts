import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

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
  } catch (error: any) {
    console.error("Search API Error:", error);
    return NextResponse.json({ error: "Failed to fetch results" }, { status: 500 });
  }
}
