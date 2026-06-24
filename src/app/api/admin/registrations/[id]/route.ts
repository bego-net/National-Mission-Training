import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { appendToGoogleSheets } from "@/lib/sheets";
import { updateStatusSchema } from "@/lib/validations/auth";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const body = await request.json();
    const parsed = updateStatusSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Select a valid status." },
        { status: 400 },
      );
    }

    const existing = await prisma.participant.findUnique({
      where: { id },
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
        status: true,
        registrationNumber: true,
        qrCode: true,
        createdAt: true,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Registration not found." }, { status: 404 });
    }

    const nextStatus = parsed.data.status;
    let registrationNumber = existing.registrationNumber;
    let qrCode = existing.qrCode;

    if (nextStatus === "APPROVED") {
      if (!registrationNumber) {
        // Find the last generated registration number to increment
        const lastApproved = await prisma.participant.findFirst({
          where: {
            registrationNumber: {
              startsWith: "HGM-2026-",
            },
          },
          orderBy: {
            registrationNumber: "desc",
          },
          select: {
            registrationNumber: true,
          },
        });

        let nextNum = 1;
        if (lastApproved && lastApproved.registrationNumber) {
          const match = lastApproved.registrationNumber.match(/HGM-2026-(\d+)/);
          if (match) {
            nextNum = parseInt(match[1], 10) + 1;
          }
        }

        registrationNumber = `HGM-2026-${String(nextNum).padStart(4, "0")}`;
      }

      // Generate QR Code if it is currently missing
      if (!qrCode || qrCode.trim() === "") {
        try {
          console.log(`[QR Generation] Generating QR Code for participant: ${existing.fullName} (${registrationNumber})`);
          qrCode = await QRCode.toDataURL(registrationNumber, {
            errorCorrectionLevel: "H",
            margin: 1,
            width: 300,
          });
          console.log(`[QR Generation] Successfully generated QR Code base64 data URL`);
        } catch (qrError) {
          console.error(`[QR Generation Error] Failed to generate QR for ${registrationNumber}:`, qrError);
          return NextResponse.json(
            { error: "Failed to generate participant QR code. Please try again." },
            { status: 500 }
          );
        }
      }
    }

    const updated = await prisma.participant.update({
      where: { id },
      data: {
        status: nextStatus,
        registrationNumber,
        qrCode,
      },
      select: {
        id: true,
        fullName: true,
        status: true,
        registrationNumber: true,
        qrCode: true,
      },
    });

    // Sync approved participant data to Google Sheets in the background
    if (nextStatus === "APPROVED" && updated.registrationNumber) {
      appendToGoogleSheets([
        updated.registrationNumber,
        existing.fullName,
        existing.phone,
        String(existing.age),
        existing.gender,
        existing.maritalStatus,
        existing.occupation,
        existing.address,
        existing.churchName,
        existing.ministryArea,
        existing.needsAccommodation ? "Yes" : "No",
        existing.needsTshirt ? "Yes" : "No",
        "Approved",
        existing.createdAt.toLocaleString("en-US"),
      ]).catch((sheetError) => {
        console.error("Failed to append to Google Sheets on approval (background):", sheetError);
      });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update registration error:", error);
    return NextResponse.json(
      { error: "Failed to update status." },
      { status: 500 },
    );
  }
}
