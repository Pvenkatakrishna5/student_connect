import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

async function main() {
  console.log("🔥 Purging demo data to prepare for production launch...");

  // Delete all Messages
  await prisma.message.deleteMany({});
  console.log("✅ Messages deleted");

  // Delete all Notifications
  await prisma.notification.deleteMany({});
  console.log("✅ Notifications deleted");

  // Delete all Applications
  await prisma.application.deleteMany({});
  console.log("✅ Applications deleted");

  // Delete all Earnings
  await prisma.earning.deleteMany({});
  console.log("✅ Earnings deleted");

  // Delete all Jobs
  await prisma.job.deleteMany({});
  console.log("✅ Jobs deleted");

  // Find all non-admin/non-agent users (the demo student and employer)
  const usersToDelete = await prisma.user.findMany({
    where: {
      role: { notIn: ["admin", "agent"] }
    }
  });

  for (const user of usersToDelete) {
    // Due to cascade delete, this will also delete the Student/Employer profile
    await prisma.user.delete({ where: { id: user.id } });
  }
  
  console.log(`✅ Deleted ${usersToDelete.length} demo user profiles`);

  console.log("\n🎉 Purge complete! The database is now completely clean and ready for real users.");
}

main()
  .catch((e) => {
    console.error("❌ Purge failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
