import dns from "node:dns";
import net from "node:net";

import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

import { normalizeDatabaseUrl } from "@/lib/db/connection-string";
import { PrismaClient } from "@/lib/generated/prisma/client";

// Node's Happy Eyeballs (autoSelectFamily) gives each candidate address only
// 250ms to complete the TCP handshake. On high-latency links to the DB region,
// the handshake loses that race and connects fail with ETIMEDOUT after ~750ms
// even though the DB is reachable. Same fix as quest-web-app/src/db/index.ts.
if (typeof net.setDefaultAutoSelectFamilyAttemptTimeout === "function") {
  net.setDefaultAutoSelectFamilyAttemptTimeout(5000);
}

// Prefer IPv4 when resolving Neon hostnames.
dns.setDefaultResultOrder("ipv4first");

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pgPool: Pool | undefined;
};

function getConnectionString(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Add it to .env — see .env.example.",
    );
  }

  return normalizeDatabaseUrl(url);
}

const pool =
  globalForPrisma.pgPool ??
  new Pool({
    connectionString: getConnectionString(),
    max: 10,
    connectionTimeoutMillis: 30_000,
    idleTimeoutMillis: 300_000,
  });

const adapter = new PrismaPg(pool);

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.pgPool = pool;
}
