import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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
      select: { id: true, status: true, registrationNumber: true, qrCode: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Registration not found." }, { status: 404 });
    }

    const nextStatus = parsed.data.status;
    let registrationNumber = existing.registrationNumber;
    let qrCode = existing.qrCode;

    if (nextStatus === "APPROVED" && !registrationNumber) {
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
      qrCode = await QRCode.toDataURL(registrationNumber, {
        errorCorrectionLevel: "H",
        margin: 1,
        width: 300,
      });
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

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update registration error:", error);
    return NextResponse.json(
      { error: "Failed to update status." },
      { status: 500 },
    );
  }
}
