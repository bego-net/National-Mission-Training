import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Returns attendance stats grouped by event day (scanDate).
 * Uses database-level aggregation — no full record loading.
 * Only days with scan activity are included, sorted newest-first.
 */
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  // Use groupBy to get counts per day+checkpoint at database level
  const grouped = await prisma.scanLog.groupBy({
    by: ["scanDate", "checkpoint"],
    _count: { id: true },
    orderBy: { scanDate: "desc" },
  });

  // Merge into day objects
  const dayMap = new Map<string, { date: string; entryCount: number; lunchCount: number }>();

  for (const row of grouped) {
    if (!dayMap.has(row.scanDate)) {
      dayMap.set(row.scanDate, { date: row.scanDate, entryCount: 0, lunchCount: 0 });
    }
    const day = dayMap.get(row.scanDate)!;
    if (row.checkpoint === "ENTRY") {
      day.entryCount = row._count.id;
    } else if (row.checkpoint === "LUNCH") {
      day.lunchCount = row._count.id;
    }
  }

  const days = Array.from(dayMap.values()).sort((a, b) => b.date.localeCompare(a.date));

  return NextResponse.json({ days });
}
