import "server-only";

import dotenv from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

import { PrismaClient } from "@/lib/generated/prisma/client";

dotenv.config({ override: true });

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pgPool: Pool | undefined;
};

function resolveDatabaseUrl() {
  const pooled = process.env.DATABASE_URL ?? "";
  const direct = process.env.DIRECT_URL ?? "";

  if (pooled.startsWith("postgres://") || pooled.startsWith("postgresql://")) {
    return pooled;
  }

  if (direct.startsWith("postgres://") || direct.startsWith("postgresql://")) {
    return direct;
  }

  return direct || pooled;
}

function createPrismaClient() {
  const connectionString = resolveDatabaseUrl();

  if (!connectionString) {
    throw new Error("DATABASE_URL veya DIRECT_URL tanımlı değil.");
  }

  const pool =
    globalForPrisma.pgPool ??
    new Pool({
      connectionString,
      ssl: connectionString.includes("supabase.com")
        ? { rejectUnauthorized: false }
        : undefined,
    });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.pgPool = pool;
  }

  const adapter = new PrismaPg(pool);

  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export type { Role } from "@/lib/generated/prisma/client";
