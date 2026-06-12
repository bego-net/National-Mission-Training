import { NextResponse } from "next/server";
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
      select: { id: true, status: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Registration not found." }, { status: 404 });
    }

    const updated = await prisma.participant.update({
      where: { id },
      data: { status: parsed.data.status },
      select: {
        id: true,
        fullName: true,
        status: true,
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
