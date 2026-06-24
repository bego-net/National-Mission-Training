import { NextResponse } from "next/server";
import { getSession, hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateAdminSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")),
  role: z.enum(["SUPER_ADMIN", "ADMIN"]),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    if (session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden. Super Admin access required." }, { status: 403 });
    }

    const body = await request.json();
    const parsed = updateAdminSchema.safeParse(body);

    if (!parsed.success) {
      const errorMsg = parsed.error.issues.map((issue) => issue.message).join(", ");
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const { name, email, password, role } = parsed.data;

    // Check if admin exists
    const admin = await prisma.admin.findUnique({
      where: { id },
    });

    if (!admin) {
      return NextResponse.json({ error: "Admin not found." }, { status: 404 });
    }

    // Check if email is already taken by another admin
    const existing = await prisma.admin.findFirst({
      where: {
        email,
        id: { not: id },
      },
    });

    if (existing) {
      return NextResponse.json({ error: "An admin with this email already exists." }, { status: 400 });
    }

    // Prepare update data
    const updateData: any = {
      name,
      email,
      role,
    };

    if (password && password.trim().length >= 6) {
      updateData.password = await hashPassword(password);
    }

    const updatedAdmin = await prisma.admin.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ admin: updatedAdmin });
  } catch (error) {
    console.error("Failed to update admin:", error);
    return NextResponse.json({ error: "Failed to update admin." }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    if (session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden. Super Admin access required." }, { status: 403 });
    }

    // Prevent self-deletion
    if (id === session.id) {
      return NextResponse.json({ error: "You cannot delete yourself." }, { status: 400 });
    }

    // Check if admin exists
    const admin = await prisma.admin.findUnique({
      where: { id },
    });

    if (!admin) {
      return NextResponse.json({ error: "Admin not found." }, { status: 404 });
    }

    await prisma.admin.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete admin:", error);
    return NextResponse.json({ error: "Failed to delete admin." }, { status: 500 });
  }
}
