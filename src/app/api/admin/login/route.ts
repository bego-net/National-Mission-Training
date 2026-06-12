import { NextResponse } from "next/server";
import { setSessionCookie, verifyAdminCredentials } from "@/lib/auth";
import { loginSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "የተጠቃሚ ስም እና የይለፍ ቃል ያስገቡ።" },
        { status: 400 },
      );
    }

    const { username, password } = parsed.data;

    if (!verifyAdminCredentials(username, password)) {
      return NextResponse.json(
        { error: "የተጠቃሚ ስም ወይም የይለፍ ቃል ትክክል አይደለም።" },
        { status: 401 },
      );
    }

    await setSessionCookie(username);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "መግቢያ አልተሳካም። እባክዎ እንደገና ይሞክሩ።" },
      { status: 500 },
    );
  }
}
