import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Get today's date as YYYY-MM-DD in the server's local timezone.
 * Used as the deduplication key for per-day scan validation.
 */
function getTodayDateString(): string {
  const now = new Date();
  const eatString = now.toLocaleDateString("en-US", { timeZone: "Africa/Nairobi" });
  const [month, day, year] = eatString.split("/");
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { qrData, checkpoint } = body;

    if (!qrData || !checkpoint || (checkpoint !== "ENTRY" && checkpoint !== "LUNCH")) {
      return NextResponse.json(
        { error: "Invalid request. Missing qrData or checkpoint." },
        { status: 400 }
      );
    }

    // Find participant
    const participant = await prisma.participant.findUnique({
      where: { registrationNumber: qrData },
    });

    if (!participant) {
      return NextResponse.json(
        { status: "NOT_FOUND", error: "Participant not found." },
        { status: 404 }
      );
    }

    // Verify approval status
    if (participant.status !== "APPROVED") {
      return NextResponse.json(
        {
          status: "NOT_APPROVED",
          error: "Participant registration is not approved.",
          participant: {
            fullName: participant.fullName,
            churchName: participant.churchName,
            registrationNumber: participant.registrationNumber,
            status: participant.status,
          },
        },
        { status: 400 }
      );
    }

    const now = new Date();
    const todayDate = getTodayDateString();

    // Check if this participant already scanned this checkpoint TODAY
    const existingScan = await prisma.scanLog.findUnique({
      where: {
        participantId_checkpoint_scanDate: {
          participantId: participant.id,
          checkpoint,
          scanDate: todayDate,
        },
      },
    });

    if (existingScan) {
      return NextResponse.json({
        status: "ALREADY_SCANNED",
        checkpoint,
        scannedAt: existingScan.scannedAt,
        participant: {
          id: participant.id,
          fullName: participant.fullName,
          churchName: participant.churchName,
          registrationNumber: participant.registrationNumber,
        },
      });
    }

    // Record new ScanLog for today
    await prisma.scanLog.create({
      data: {
        participantId: participant.id,
        checkpoint,
        scanDate: todayDate,
        scannedAt: now,
        scannedBy: request.headers.get("user-agent") || "Scanner WebApp",
      },
    });

    return NextResponse.json({
      status: "SUCCESS",
      checkpoint,
      scannedAt: now,
      participant: {
        id: participant.id,
        fullName: participant.fullName,
        churchName: participant.churchName,
        registrationNumber: participant.registrationNumber,
      },
    });
  } catch (error) {
    console.error("Scan error:", error);
    return NextResponse.json(
      { error: "Internal server error during QR scan." },
      { status: 500 }
    );
  }
}
