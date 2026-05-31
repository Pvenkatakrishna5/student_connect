import dotenv from "dotenv";
import path from "path";

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import prisma from "../lib/prisma";

async function main() {
  console.log("Checking live database users...");
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true
      }
    });
    console.log(`\nSUCCESS! Found ${users.length} users in Supabase:\n`);
    console.log(JSON.stringify(users, null, 2));
  } catch (err: any) {
    console.error("\n❌ DATABASE ERROR ENCOUNTERED:");
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}
main();
