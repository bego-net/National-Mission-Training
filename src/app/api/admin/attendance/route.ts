import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Returns attendance data grouped by event day (scanDate).
 * Only days with at least one scan record are included.
 * Sorted newest-first.
 *
 * Each day contains:
 *  - date (YYYY-MM-DD)
 *  - entryCount / lunchCount
 *  - participants array: { fullName, registrationNumber, entryTime?, lunchTime? }
 */
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  // Fetch all scan logs with participant info, ordered by date desc then name
  const scanLogs = await prisma.scanLog.findMany({
    orderBy: [{ scanDate: "desc" }, { scannedAt: "asc" }],
    select: {
      checkpoint: true,
      scanDate: true,
      scannedAt: true,
      participant: {
        select: {
          fullName: true,
          registrationNumber: true,
        },
      },
    },
  });

  // Group by scanDate
  const dayMap = new Map<
    string,
    {
      date: string;
      entryCount: number;
      lunchCount: number;
      participantMap: Map<
        string, // registrationNumber
        {
          fullName: string;
          registrationNumber: string;
          entryTime: string | null;
          lunchTime: string | null;
        }
      >;
    }
  >();

  for (const log of scanLogs) {
    const date = log.scanDate;
    const regNum = log.participant.registrationNumber ?? "N/A";

    if (!dayMap.has(date)) {
      dayMap.set(date, {
        date,
        entryCount: 0,
        lunchCount: 0,
        participantMap: new Map(),
      });
    }

    const day = dayMap.get(date)!;

    if (!day.participantMap.has(regNum)) {
      day.participantMap.set(regNum, {
        fullName: log.participant.fullName,
        registrationNumber: regNum,
        entryTime: null,
        lunchTime: null,
      });
    }

    const participant = day.participantMap.get(regNum)!;

    if (log.checkpoint === "ENTRY") {
      day.entryCount++;
      participant.entryTime = log.scannedAt.toISOString();
    } else if (log.checkpoint === "LUNCH") {
      day.lunchCount++;
      participant.lunchTime = log.scannedAt.toISOString();
    }
  }

  // Convert to array sorted newest-first
  const days = Array.from(dayMap.values())
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((day) => ({
      date: day.date,
      entryCount: day.entryCount,
      lunchCount: day.lunchCount,
      participants: Array.from(day.participantMap.values()),
    }));

  return NextResponse.json({ days });
}
