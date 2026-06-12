import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  normalizePhone,
  registrationSchema,
} from "@/lib/validations/registration";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registrationSchema.safeParse(body);

    if (!parsed.success) {
      const details: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "form");
        details[key] = [...(details[key] ?? []), issue.message];
      }
      return NextResponse.json(
        { error: "የተሰጠው መረጃ ትክክል አይደለም።", details },
        { status: 400 },
      );
    }

    const data = parsed.data;
    const phone = normalizePhone(data.phone);

    const existing = await prisma.participant.findFirst({
      where: { phone },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json(
        { error: "በዚህ ስልክ ቁጥር ቀድሞውኑ ምዝገባ ተከናውኗል።" },
        { status: 409 },
      );
    }

    const participant = await prisma.participant.create({
      data: {
        fullName: data.fullName,
        phone,
        age: data.age,
        gender: data.gender,
        maritalStatus: data.maritalStatus,
        occupation: data.occupation,
        address: data.address,
        churchName: data.churchName,
        parishName: data.parishName,
        ministryArea: data.ministryArea,
        needsAccommodation: data.needsAccommodation,
      },
      select: {
        id: true,
        fullName: true,
        status: true,
      },
    });

    return NextResponse.json(participant, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "ምዝገባው አልተሳካም። እባክዎ እንደገና ይሞክሩ።" },
      { status: 500 },
    );
  }
}
