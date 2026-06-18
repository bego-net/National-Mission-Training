import { type RegistrationStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Get today's date as YYYY-MM-DD in the server's local timezone.
 */
function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const statusParam = searchParams.get("status");

  const validStatuses: RegistrationStatus[] = ["PENDING", "APPROVED", "REJECTED"];
  const status =
    statusParam && validStatuses.includes(statusParam as RegistrationStatus)
      ? (statusParam as RegistrationStatus)
      : undefined;

  const where = {
    ...(status ? { status } : {}),
    ...(q
      ? {
          OR: [
            { fullName: { contains: q, mode: "insensitive" as const } },
            { phone: { contains: q } },
            { churchName: { contains: q, mode: "insensitive" as const } },
            { parishName: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const todayDate = getTodayDateString();

  const [registrations, stats, todayEntryCount, todayLunchCount, scanLogs] = await Promise.all([
    prisma.participant.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        fullName: true,
        phone: true,
        age: true,
        gender: true,
        maritalStatus: true,
        occupation: true,
        address: true,
        churchName: true,
        parishName: true,
        ministryArea: true,
        needsAccommodation: true,
        paymentScreenshot: true,
        status: true,
        registrationNumber: true,
        qrCode: true,
        createdAt: true,
        scanLogs: {
          where: { scanDate: todayDate },
          select: {
            checkpoint: true,
            scannedAt: true,
          },
        },
      },
    }),
    prisma.participant.groupBy({
      by: ["status"],
      _count: { status: true },
    }),
    // Count distinct participants who scanned ENTRY today
    prisma.scanLog.count({
      where: { checkpoint: "ENTRY", scanDate: todayDate },
    }),
    // Count distinct participants who scanned LUNCH today
    prisma.scanLog.count({
      where: { checkpoint: "LUNCH", scanDate: todayDate },
    }),
    prisma.scanLog.findMany({
      orderBy: { scannedAt: "desc" },
      take: 20,
      select: {
        id: true,
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
    }),
  ]);

  const counts = {
    PENDING: 0,
    APPROVED: 0,
    REJECTED: 0,
    TOTAL: 0,
    scannedEntry: todayEntryCount,
    scannedLunch: todayLunchCount,
    attendanceRate: 0,
    todayDate,
  };

  for (const row of stats) {
    counts[row.status] = row._count.status;
    counts.TOTAL += row._count.status;
  }

  counts.attendanceRate = counts.APPROVED > 0
    ? Math.round((counts.scannedEntry / counts.APPROVED) * 100)
    : 0;

  // Map registrations to include today's scan status
  const mappedRegistrations = registrations.map((reg) => {
    const todayEntry = reg.scanLogs.find((l) => l.checkpoint === "ENTRY");
    const todayLunch = reg.scanLogs.find((l) => l.checkpoint === "LUNCH");
    return {
      ...reg,
      scanLogs: undefined, // remove raw scanLogs from response
      scannedEntry: !!todayEntry,
      scannedLunch: !!todayLunch,
      scannedEntryAt: todayEntry?.scannedAt ?? null,
      scannedLunchAt: todayLunch?.scannedAt ?? null,
    };
  });

  return NextResponse.json({ registrations: mappedRegistrations, counts, scanLogs });
}
