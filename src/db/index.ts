import { mkdirSync } from "node:fs";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { neon } from "@neondatabase/serverless";
import { sql } from "drizzle-orm";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { seedDemoData } from "@/lib/seed";
import * as schema from "./schema";
import { SCHEMA_SQL } from "./sql";
import type { AppDb } from "./types";

export type { AppDb } from "./types";

type DbCache = {
  db: AppDb;
  driver: "neon" | "pglite";
};

const globalForDb = globalThis as unknown as {
  __jobCommandDb?: DbCache;
  __jobCommandDbInit?: Promise<DbCache>;
};

export function usesEphemeralDatabase() {
  return !process.env.DATABASE_URL;
}

/** Vercel’s function filesystem is read-only except `/tmp`; file PGlite cannot live in cwd. */
export function shouldUseInMemoryPglite() {
  return usesEphemeralDatabase() && Boolean(process.env.VERCEL);
}

async function applySchema(db: AppDb) {
  const statements = SCHEMA_SQL.split(";")
    .map((statement) => statement.trim())
    .filter(Boolean);
  for (const statement of statements) {
    await db.execute(sql.raw(statement));
  }
}

export async function createDatabase(options?: {
  databaseUrl?: string | null;
  inMemory?: boolean;
  dataDir?: string;
  seedDemo?: boolean;
}): Promise<{ db: AppDb; driver: "neon" | "pglite" }> {
  const databaseUrl = options?.databaseUrl ?? process.env.DATABASE_URL ?? null;
  let db: AppDb;
  let driver: "neon" | "pglite";

  if (databaseUrl) {
    const client = neon(databaseUrl);
    db = drizzleNeon(client, { schema });
    driver = "neon";
  } else {
    const inMemory = options?.inMemory ?? shouldUseInMemoryPglite();
    const pglite = inMemory
      ? new PGlite()
      : (() => {
          const dataDir =
            options?.dataDir ??
            process.env.PGLITE_DATA_DIR ??
            path.join(process.cwd(), ".data", "job-command");
          try {
            mkdirSync(dataDir, { recursive: true });
            return new PGlite(dataDir);
          } catch {
            // Read-only hosts (Vercel cwd, some CI) cannot persist a file DB.
            return new PGlite();
          }
        })();
    db = drizzlePglite(pglite, { schema });
    driver = "pglite";
  }

  await applySchema(db);
  const shouldSeed =
    options?.seedDemo ?? (driver === "pglite" || process.env.SEED_DEMO === "true");
  if (shouldSeed) {
    await seedDemoData(db);
  }
  return { db, driver };
}

export async function getReadyDb(): Promise<AppDb> {
  if (globalForDb.__jobCommandDb) {
    return globalForDb.__jobCommandDb.db;
  }
  if (!globalForDb.__jobCommandDbInit) {
    globalForDb.__jobCommandDbInit = createDatabase()
      .then((created) => {
        globalForDb.__jobCommandDb = created;
        return created;
      })
      .catch((error) => {
        globalForDb.__jobCommandDbInit = undefined;
        throw error;
      });
  }
  const created = await globalForDb.__jobCommandDbInit;
  return created.db;
}

export function resetDbCache() {
  globalForDb.__jobCommandDb = undefined;
  globalForDb.__jobCommandDbInit = undefined;
}
