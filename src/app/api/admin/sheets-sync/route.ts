import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { syncMissingParticipants } from "@/lib/sheets";

/**
 * GET  /api/admin/sheets-sync — Preview unsynced participants (dry-run)
 * POST /api/admin/sheets-sync — Run reconciliation: sync all missing participants
 */

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  // Return a summary of approved-but-unsynced participants
  const unsynced = await prisma.participant.findMany({
    where: {
      status: "APPROVED",
      sheetSynced: false,
    },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      fullName: true,
      phone: true,
      registrationNumber: true,
      createdAt: true,
    },
  });

  const totalApproved = await prisma.participant.count({
    where: { status: "APPROVED" },
  });

  const totalSynced = await prisma.participant.count({
    where: { status: "APPROVED", sheetSynced: true },
  });

  return NextResponse.json({
    totalApproved,
    totalSynced,
    totalUnsynced: unsynced.length,
    unsyncedParticipants: unsynced,
  });
}

export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  console.log("[Sheets Reconciliation] Admin triggered full reconciliation.");

  const result = await syncMissingParticipants();

  return NextResponse.json({
    message: `Reconciliation complete. Synced ${result.synced}, skipped ${result.skippedDuplicates} duplicates, ${result.failed} failed.`,
    ...result,
  });
}
