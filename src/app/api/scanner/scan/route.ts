import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

    if (checkpoint === "ENTRY") {
      // Concurrency-safe atomic check and update
      const updateResult = await prisma.participant.updateMany({
        where: {
          id: participant.id,
          scannedEntry: false,
        },
        data: {
          scannedEntry: true,
          scannedEntryAt: now,
        },
      });

      if (updateResult.count === 0) {
        // Fetch existing scan timestamp
        const existingParticipant = await prisma.participant.findUnique({
          where: { id: participant.id },
          select: { scannedEntryAt: true },
        });

        return NextResponse.json({
          status: "ALREADY_SCANNED",
          checkpoint: "ENTRY",
          scannedAt: existingParticipant?.scannedEntryAt || now,
          participant: {
            id: participant.id,
            fullName: participant.fullName,
            churchName: participant.churchName,
            registrationNumber: participant.registrationNumber,
          },
        });
      }

      // Record ScanLog
      await prisma.scanLog.create({
        data: {
          participantId: participant.id,
          checkpoint: "ENTRY",
          scannedAt: now,
          scannedBy: request.headers.get("user-agent") || "Scanner WebApp",
        },
      });

      return NextResponse.json({
        status: "SUCCESS",
        checkpoint: "ENTRY",
        scannedAt: now,
        participant: {
          id: participant.id,
          fullName: participant.fullName,
          churchName: participant.churchName,
          registrationNumber: participant.registrationNumber,
        },
      });
    } else {
      // LUNCH Checkpoint
      // Concurrency-safe atomic check and update
      const updateResult = await prisma.participant.updateMany({
        where: {
          id: participant.id,
          scannedLunch: false,
        },
        data: {
          scannedLunch: true,
          scannedLunchAt: now,
        },
      });

      if (updateResult.count === 0) {
        // Fetch existing scan timestamp
        const existingParticipant = await prisma.participant.findUnique({
          where: { id: participant.id },
          select: { scannedLunchAt: true },
        });

        return NextResponse.json({
          status: "ALREADY_SCANNED",
          checkpoint: "LUNCH",
          scannedAt: existingParticipant?.scannedLunchAt || now,
          participant: {
            id: participant.id,
            fullName: participant.fullName,
            churchName: participant.churchName,
            registrationNumber: participant.registrationNumber,
          },
        });
      }

      // Record ScanLog
      await prisma.scanLog.create({
        data: {
          participantId: participant.id,
          checkpoint: "LUNCH",
          scannedAt: now,
          scannedBy: request.headers.get("user-agent") || "Scanner WebApp",
        },
      });

      return NextResponse.json({
        status: "SUCCESS",
        checkpoint: "LUNCH",
        scannedAt: now,
        participant: {
          id: participant.id,
          fullName: participant.fullName,
          churchName: participant.churchName,
          registrationNumber: participant.registrationNumber,
        },
      });
    }
  } catch (error) {
    console.error("Scan error:", error);
    return NextResponse.json(
      { error: "Internal server error during QR scan." },
      { status: 500 }
    );
  }
}
