const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

p.$connect()
  .then(() => {
    console.log('DB connected OK');
    return p.$disconnect();
  })
  .catch((e) => {
    console.error('DB connection FAILED:', e.message);
  });
