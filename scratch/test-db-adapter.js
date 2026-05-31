const dotenv = require("dotenv");
const path = require("path");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");

// Load .env.local variables
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const connectionString = process.env.DATABASE_URL;
console.log("Database connection string:", connectionString ? "Loaded successfully" : "Missing");

async function main() {
  if (!connectionString) {
    console.error("No DATABASE_URL environment variable found!");
    return;
  }

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  console.log("Connecting to live database and querying users...");
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    });
    console.log(`\nSUCCESS! Found ${users.length} users in database:\n`);
    console.log(JSON.stringify(users, null, 2));
  } catch (err) {
    console.error("\n❌ DATABASE ERROR:", err.message);
    console.error(err);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
