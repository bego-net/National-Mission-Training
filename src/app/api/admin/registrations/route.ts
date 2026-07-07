import { type RegistrationStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function getTodayDateString(): string {
  const now = new Date();
  const eatString = now.toLocaleDateString("en-US", { timeZone: "Africa/Nairobi" });
  const [month, day, year] = eatString.split("/");
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

const MAX_PAGE_SIZE = 100;
const DEFAULT_PAGE_SIZE = 50;

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const statusParam = searchParams.get("status");
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
  const limit = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, parseInt(searchParams.get("limit") || String(DEFAULT_PAGE_SIZE), 10) || DEFAULT_PAGE_SIZE)
  );

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
            { registrationNumber: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const todayDate = getTodayDateString();
  const skip = (page - 1) * limit;

  const [registrations, totalCount, stats, todayEntryCount, todayLunchCount] = await Promise.all([
    prisma.participant.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
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
        ministryArea: true,
        needsAccommodation: true,
        needsTshirt: true,
        tShirtSize: true,
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
    prisma.participant.count({ where }),
    prisma.participant.groupBy({
      by: ["status"],
      _count: { status: true },
    }),
    prisma.scanLog.count({
      where: { checkpoint: "ENTRY", scanDate: todayDate },
    }),
    prisma.scanLog.count({
      where: { checkpoint: "LUNCH", scanDate: todayDate },
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

  const mappedRegistrations = registrations.map((reg) => {
    const todayEntry = reg.scanLogs.find((l) => l.checkpoint === "ENTRY");
    const todayLunch = reg.scanLogs.find((l) => l.checkpoint === "LUNCH");
    return {
      ...reg,
      scanLogs: undefined,
      scannedEntry: !!todayEntry,
      scannedLunch: !!todayLunch,
      scannedEntryAt: todayEntry?.scannedAt ?? null,
      scannedLunchAt: todayLunch?.scannedAt ?? null,
    };
  });

  return NextResponse.json({
    registrations: mappedRegistrations,
    counts,
    pagination: {
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
    },
  });
}
