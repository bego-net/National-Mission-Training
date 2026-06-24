import { NextResponse } from "next/server";
import { setSessionCookie, comparePassword, seedDefaultSuperAdmin } from "@/lib/auth";
import { loginSchema } from "@/lib/validations/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    // Seed default admin if table is empty
    await seedDefaultSuperAdmin();

    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Please enter your email and password." },
        { status: 400 },
      );
    }

    const { email, password } = parsed.data;

    // Find admin by email
    const admin = await prisma.admin.findUnique({
      where: { email },
    });

    if (!admin) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 },
      );
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, admin.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 },
      );
    }

    await setSessionCookie(admin);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Login failed. Please try again." },
      { status: 500 },
    );
  }
}
