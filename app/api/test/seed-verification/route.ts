import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const student = await prisma.student.findFirst();
  if (student) {
    await prisma.student.update({
      where: { id: student.id },
      data: {
        aadhaarNumber: "1234 5678 9012",
        isAadhaarVerified: false
      }
    });
    return NextResponse.json({ message: `Created a pending verification request for student: ${student.name}` });
  } else {
    return NextResponse.json({ message: "No student found to create test data." });
  }
}
