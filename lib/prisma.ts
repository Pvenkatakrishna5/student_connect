import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL!;

declare global {
  var prismaGlobal: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);
}

const prisma: PrismaClient = global.prismaGlobal ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.prismaGlobal = prisma;
}

export default prisma;
