import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });
  
  if (prisma.otp) {
    console.log("SUCCESS: prisma.otp exists!");
  } else {
    console.log("FAILED: prisma.otp is undefined in the generated client.");
  }
}

main().catch(console.error);
