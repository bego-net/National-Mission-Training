import { cookies } from "next/headers";
import crypto from "crypto";

const COOKIE_NAME = "hgm_admin_session";
const MAX_AGE_SECONDS = 60 * 60 * 24;

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("SESSION_SECRET must be at least 16 characters");
  }
  return secret;
}

export function createSessionToken(username: string): string {
  const expires = Date.now() + MAX_AGE_SECONDS * 1000;
  const payload = Buffer.from(JSON.stringify({ username, expires })).toString(
    "base64url",
  );
  const signature = crypto
    .createHmac("sha256", getSecret())
    .update(payload)
    .digest("base64url");
  return `${payload}.${signature}`;
}

export function verifySessionToken(
  token: string,
): { username: string } | null {
  try {
    const [payload, signature] = token.split(".");
    if (!payload || !signature) return null;

    const expected = crypto
      .createHmac("sha256", getSecret())
      .update(payload)
      .digest("base64url");
    if (signature !== expected) return null;

    const data = JSON.parse(
      Buffer.from(payload, "base64url").toString(),
    ) as { username: string; expires: number };

    if (Date.now() > data.expires) return null;
    return { username: data.username };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<{ username: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function setSessionCookie(username: string): Promise<void> {
  const token = createSessionToken(username);
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

export function verifyAdminCredentials(
  username: string,
  password: string,
): boolean {
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminUsername || !adminPassword) return false;
  return username === adminUsername && password === adminPassword;
}
