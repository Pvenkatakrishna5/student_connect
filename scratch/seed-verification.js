require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Find a student
  const student = await prisma.student.findFirst();
  if (student) {
    await prisma.student.update({
      where: { id: student.id },
      data: {
        aadhaarNumber: "1234 5678 9012",
        isAadhaarVerified: false
      }
    });
    console.log(`Created a pending verification request for student: ${student.name}`);
  } else {
    console.log("No student found to create test data.");
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
