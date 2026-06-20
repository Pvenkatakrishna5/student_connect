import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const users = await prisma.user.findMany({ where: { role: "student" }, include: { student: true } });
  let created = 0;
  for (const user of users) {
    if (!user.student) {
      await prisma.student.create({
        data: {
          userId: user.id,
          name: "Student",
        }
      });
      created++;
    }
  }
  return NextResponse.json({ message: `Created ${created} missing student profiles.` });
}
