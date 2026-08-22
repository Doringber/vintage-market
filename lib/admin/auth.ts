import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "admin_session";
const SESSION_HOURS = 12;

function getAdminPassword(): string | null {
  const password = process.env.ADMIN_PASSWORD?.trim();
  if (!password) {
    return null;
  }

  if (
    (password.startsWith('"') && password.endsWith('"')) ||
    (password.startsWith("'") && password.endsWith("'"))
  ) {
    return password.slice(1, -1).trim() || null;
  }

  return password;
}

export function hasAdminPassword(): boolean {
  return Boolean(getAdminPassword());
}

function sign(value: string): string {
  const secret = getAdminPassword() ?? "missing-admin-password";
  return createHmac("sha256", secret).update(value).digest("hex");
}

export function createAdminSessionToken(): string {
  const expiresAt = Date.now() + SESSION_HOURS * 60 * 60 * 1000;
  const payload = String(expiresAt);
  return `${payload}.${sign(payload)}`;
}

export function isValidAdminSession(token: string | undefined): boolean {
  if (!token || !hasAdminPassword()) {
    return false;
  }

  const [payload, signature] = token.split(".");
  if (!payload || !signature) {
    return false;
  }

  const expected = sign(payload);
  const left = Uint8Array.from(Buffer.from(signature));
  const right = Uint8Array.from(Buffer.from(expected));
  if (left.length !== right.length || !timingSafeEqual(left, right)) {
    return false;
  }

  const expiresAt = Number(payload);
  return Number.isFinite(expiresAt) && expiresAt > Date.now();
}

export function verifyAdminPassword(password: string): boolean {
  const expected = getAdminPassword();
  if (!expected) {
    return false;
  }

  const left = Uint8Array.from(Buffer.from(password));
  const right = Uint8Array.from(Buffer.from(expected));
  if (left.length !== right.length) {
    return false;
  }

  return timingSafeEqual(left, right);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return isValidAdminSession(cookieStore.get(COOKIE_NAME)?.value);
}

export async function setAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, createAdminSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_HOURS * 60 * 60,
  });
}

export async function clearAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export const ADMIN_COOKIE_NAME = COOKIE_NAME;
