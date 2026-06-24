import { NextResponse } from "next/server";
import { uploadPaymentScreenshot } from "@/lib/cloudinary";
import { appendToGoogleSheets } from "@/lib/sheets";

export const runtime = "nodejs";
import { prisma } from "@/lib/prisma";
import { validatePaymentFile } from "@/lib/validations/payment";
import {
  normalizePhone,
  registrationSchema,
} from "@/lib/validations/registration";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const paymentValidation = validatePaymentFile(
      formData.get("paymentScreenshot"),
    );
    if (!paymentValidation.ok) {
      return NextResponse.json(
        { error: paymentValidation.error },
        { status: 400 },
      );
    }

    const raw = {
      fullName: formData.get("fullName"),
      phone: formData.get("phone"),
      age: formData.get("age"),
      gender: formData.get("gender"),
      maritalStatus: formData.get("maritalStatus"),
      occupation: formData.get("occupation"),
      address: formData.get("address"),
      churchName: formData.get("churchName"),
      ministryArea: formData.get("ministryArea"),
      needsAccommodation: formData.get("needsAccommodation") === "true",
      needsTshirt: formData.get("needsTshirt") === "true",
    };

    const parsed = registrationSchema.safeParse(raw);
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

    let paymentScreenshot: string;
    try {
      paymentScreenshot = await uploadPaymentScreenshot(paymentValidation.file);
    } catch (uploadError) {
      console.error("Cloudinary upload error:", uploadError);
      return NextResponse.json(
        { error: "የክፍያ ማረጋገጫ ፎቶ ማስገባት አልተሳካም። እባክዎ እንደገና ይሞክሩ።" },
        { status: 502 },
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
        ministryArea: data.ministryArea,
        needsAccommodation: data.needsAccommodation,
        needsTshirt: data.needsTshirt,
        paymentScreenshot,
      },
      select: {
        id: true,
        fullName: true,
        status: true,
        createdAt: true,
      },
    });

    // Sync new registration to Google Sheets in the background
    appendToGoogleSheets([
      "-", // No registration number yet
      data.fullName,
      phone,
      String(data.age),
      data.gender,
      data.maritalStatus,
      data.occupation,
      data.address,
      data.churchName,
      data.ministryArea,
      data.needsAccommodation ? "Yes" : "No",
      data.needsTshirt ? "Yes" : "No",
      "Pending",
      participant.createdAt.toLocaleString("en-US"),
    ]).catch((sheetError) => {
      console.error(`[Google Sheets Sync Error] Failed to append new registration for "${data.fullName}" (${phone}) to Google Sheets:`, sheetError);
    });

    return NextResponse.json({
      id: participant.id,
      fullName: participant.fullName,
      status: participant.status,
    }, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "ምዝገባው አልተሳካም። እባክዎ እንደገና ይሞክሩ።" },
      { status: 500 },
    );
  }
}
