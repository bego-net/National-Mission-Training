import { type RegistrationStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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

  const [registrations, stats, scannedEntryCount, scannedLunchCount, scanLogs] = await Promise.all([
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
        scannedEntry: true,
        scannedLunch: true,
        scannedEntryAt: true,
        scannedLunchAt: true,
        createdAt: true,
      },
    }),
    prisma.participant.groupBy({
      by: ["status"],
      _count: { status: true },
    }),
    prisma.participant.count({
      where: { scannedEntry: true },
    }),
    prisma.participant.count({
      where: { scannedLunch: true },
    }),
    prisma.scanLog.findMany({
      orderBy: { scannedAt: "desc" },
      take: 10,
      select: {
        id: true,
        checkpoint: true,
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
    scannedEntry: scannedEntryCount,
    scannedLunch: scannedLunchCount,
    attendanceRate: 0,
  };

  for (const row of stats) {
    counts[row.status] = row._count.status;
    counts.TOTAL += row._count.status;
  }

  counts.attendanceRate = counts.APPROVED > 0
    ? Math.round((counts.scannedEntry / counts.APPROVED) * 100)
    : 0;

  return NextResponse.json({ registrations, counts, scanLogs });
}
