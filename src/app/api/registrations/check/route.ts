import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizePhone } from "@/lib/validations/registration";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const phoneParam = searchParams.get("phone");

    if (!phoneParam) {
      return NextResponse.json({ error: "ስልክ ቁጥር ያስፈልጋል" }, { status: 400 });
    }

    const normalized = normalizePhone(phoneParam.trim());
    if (!/^09\d{8}$/.test(normalized)) {
      return NextResponse.json({ error: "ትክክለኛ ያልሆነ የስልክ ቁጥር ቅርጸት" }, { status: 400 });
    }

    const participant = await prisma.participant.findFirst({
      where: { phone: normalized },
      select: {
        fullName: true,
        status: true,
        registrationNumber: true,
      },
    });

    if (!participant) {
      return NextResponse.json({ found: false });
    }

    // Censor name for privacy (e.g. "Abel Bekele" -> "Ab** Be**")
    const words = participant.fullName.split(" ");
    const censoredName = words
      .map((w) => {
        if (w.length <= 2) return w;
        return w.slice(0, 2) + "*".repeat(Math.min(w.length - 2, 4));
      })
      .join(" ");

    return NextResponse.json({
      found: true,
      fullName: censoredName,
      status: participant.status,
      registrationNumber: participant.registrationNumber,
    });
  } catch (error) {
    console.error("Check status error:", error);
    return NextResponse.json({ error: "ስህተት ተከስቷል" }, { status: 500 });
  }
}
