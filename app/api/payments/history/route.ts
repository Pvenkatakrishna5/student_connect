import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
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
      const student = await prisma.student.findUnique({
        where: { userId: session.user.id }
      });

      if (!student) {
        return NextResponse.json({ error: "Student profile not found" }, { status: 404 });
      }

      // Fetch student earnings
      const earnings = await prisma.earning.findMany({
        where: { studentId: student.id },
        orderBy: { createdAt: "desc" }
      });

      return NextResponse.json({ role, data: earnings });
    }

    if (role === "employer") {
      // Find employer profile
      const employer = await prisma.employer.findUnique({
        where: { userId: session.user.id }
      });

      if (!employer) {
        return NextResponse.json({ error: "Employer profile not found" }, { status: 404 });
      }

      // Fetch employer payments
      const payments = await prisma.payment.findMany({
        where: { employerId: employer.id },
        include: {
          application: {
            include: {
              job: { select: { title: true } },
              student: { select: { name: true } }
            }
          }
        },
        orderBy: { createdAt: "desc" }
      });

      return NextResponse.json({ role, data: payments });
    }

    return NextResponse.json({ error: "Invalid role access" }, { status: 403 });
  } catch (err: any) {
    console.error("Billing History Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
