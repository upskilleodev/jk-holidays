import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/db";
import { User, type UserDocument } from "@/models/User";

/** Separate cookies so member + admin can stay logged in in the same browser. */
export const MEMBER_COOKIE = "jk_member_session";
export const ADMIN_COOKIE = "jk_admin_session";
const LEGACY_COOKIE = "jk_session";

export type SessionPayload = {
  userId: string;
  email: string;
  role: "user" | "admin";
  name: string;
};

export type SessionScope = "member" | "admin";

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("Missing JWT_SECRET");
  return new TextEncoder().encode(secret);
}

function cookieNameForRole(role: SessionPayload["role"]): string {
  return role === "admin" ? ADMIN_COOKIE : MEMBER_COOKIE;
}

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  };
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

async function readCookieSession(
  name: string,
): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(name)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function setSessionCookie(
  token: string,
  role: SessionPayload["role"],
) {
  const cookieStore = await cookies();
  cookieStore.set(cookieNameForRole(role), token, cookieOptions());
  // Drop legacy shared cookie so old sessions don't collide.
  cookieStore.delete(LEGACY_COOKIE);
}

export async function clearSessionCookie(scope: SessionScope | "all" = "all") {
  const cookieStore = await cookies();
  if (scope === "all" || scope === "member") {
    cookieStore.delete(MEMBER_COOKIE);
  }
  if (scope === "all" || scope === "admin") {
    cookieStore.delete(ADMIN_COOKIE);
  }
  cookieStore.delete(LEGACY_COOKIE);
}

export async function getMemberSession(): Promise<SessionPayload | null> {
  const session = await readCookieSession(MEMBER_COOKIE);
  if (session?.role === "user") return session;
  return null;
}

export async function getAdminSession(): Promise<SessionPayload | null> {
  const session = await readCookieSession(ADMIN_COOKIE);
  if (session?.role === "admin") return session;
  return null;
}

/**
 * Prefer member session for public/member surfaces.
 * Falls back to admin only when explicitly useful (e.g. public nav).
 */
export async function getSession(
  prefer: SessionScope | "any" = "any",
): Promise<SessionPayload | null> {
  if (prefer === "member") return getMemberSession();
  if (prefer === "admin") return getAdminSession();

  const member = await getMemberSession();
  if (member) return member;
  return getAdminSession();
}

export async function requireSession() {
  const session = await getMemberSession();
  if (!session) throw new Error("UNAUTHORIZED");
  return session;
}

export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) throw new Error("UNAUTHORIZED");
  if (session.role !== "admin") throw new Error("FORBIDDEN");
  return session;
}

export async function getCurrentUser(): Promise<UserDocument | null> {
  const session = await getMemberSession();
  if (!session) return null;
  await connectDB();
  return User.findById(session.userId);
}
