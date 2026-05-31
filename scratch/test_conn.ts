import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  });
  
  try {
    const userCount = await prisma.user.count();
    const students = await prisma.student.findMany({ select: { name: true } });
    
    console.log("Database Connection: SUCCESS");
    console.log(`Total Users: ${userCount}`);
    console.log(`Registered Students: ${students.map(s => s.name).join(", ") || "None"}`);
  } catch (err) {
    console.error("Database Connection: FAILED");
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
