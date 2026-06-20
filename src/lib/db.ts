// Database client stub — Prisma will be added when PostgreSQL is configured
// For now, the app runs with in-memory data via Zustand stores.
// import { PrismaClient } from "@prisma/client"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const prisma = null as any

export async function initDatabase() {
  console.log("[DB] Database not configured — using in-memory stores")
  return null
}
