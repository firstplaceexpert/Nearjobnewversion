/**
 * Database Client — Prisma 8 Runtime
 *
 * This is the runtime entry point for database access.
 * Uses Prisma 8's runtime factory with the emitted contract.
 *
 * Import `db` from this file throughout the app:
 *   import { db } from "@/lib/db";
 *
 * @see https://www.prisma.io/docs/orm/v8
 */
import postgres from "@prisma/orm-postgres/runtime";
import type { Contract } from "../../prisma/schema.d";
import contractJson from "../../prisma/schema.json" with { type: "json" };

export const db = postgres<Contract>({
  contractJson,
  url: process.env["DATABASE_URL"]!,
});
