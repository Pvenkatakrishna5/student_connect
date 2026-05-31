const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Running database user check...");
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        isVerified: true,
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
  }
}
main();
