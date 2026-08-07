const { PrismaClient } = require('@prisma/client');
const prisma = require('../lib/prisma.ts').default;

async function testPrisma() {
  console.log('Testing Prisma connection...');
  try {
    const userCount = await prisma.user.count();
    console.log('✅ Prisma connected! User count:', userCount);
  } catch (error) {
    console.error('❌ Prisma connection FAILED:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testPrisma();
