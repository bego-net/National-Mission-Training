import { cookies } from "next/headers";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

const COOKIE_NAME = "hgm_admin_session";
const MAX_AGE_SECONDS = 60 * 60 * 24;

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "ADMIN";
  username: string; // for backward compatibility with components using .username
}

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("SESSION_SECRET must be at least 16 characters");
  }
  return secret;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(password, hashed);
}

export async function seedDefaultSuperAdmin(): Promise<void> {
  try {
    const count = await prisma.admin.count();
    if (count === 0) {
      const defaultEmail = "admin@hgm.org";
      const defaultPassword = process.env.ADMIN_PASSWORD || "admin1234";
      const hashedPassword = await hashPassword(defaultPassword);
      await prisma.admin.create({
        data: {
          name: "Super Admin",
          email: defaultEmail,
          password: hashedPassword,
          role: "SUPER_ADMIN",
        },
      });
    }
  } catch (error) {
    console.error("Error seeding default super admin:", error);
  }
}

export function createSessionToken(user: { id: string; name: string; email: string; role: "SUPER_ADMIN" | "ADMIN" }): string {
  const expires = Date.now() + MAX_AGE_SECONDS * 1000;
  const payload = Buffer.from(
    JSON.stringify({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      username: user.name, // compatibility
      expires,
    })
  ).toString("base64url");
  const signature = crypto
    .createHmac("sha256", getSecret())
    .update(payload)
    .digest("base64url");
  return `${payload}.${signature}`;
}

export function verifySessionToken(token: string): SessionUser | null {
  try {
    const [payload, signature] = token.split(".");
    if (!payload || !signature) return null;

    const expected = crypto
      .createHmac("sha256", getSecret())
      .update(payload)
      .digest("base64url");
    if (signature !== expected) return null;

    const data = JSON.parse(
      Buffer.from(payload, "base64url").toString()
    ) as SessionUser & { expires: number };

    if (Date.now() > data.expires) return null;
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      role: data.role,
      username: data.username || data.name,
    };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function setSessionCookie(user: { id: string; name: string; email: string; role: "SUPER_ADMIN" | "ADMIN" }): Promise<void> {
  const token = createSessionToken(user);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

