import * as jose from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { getOrganiserByUsername, getOrganiserById, Organiser } from "./db";

const JWT_SECRET = process.env.JWT_SECRET || "freshers2026-umu-super-secret-key-change-in-prod-32chars";
const secret = new TextEncoder().encode(JWT_SECRET);

export interface JWTPayload {
  id: string;
  username: string;
  role: Organiser["role"];
  email: string;
  displayName: string;
  idPassCode?: string;
}

export async function signToken(payload: JWTPayload) {
  const jwt = await new jose.SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
  return jwt;
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jose.jwtVerify(token, secret);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

export async function authenticateOrganiser(username: string, password: string): Promise<{ organiser: Organiser; token: string } | null> {
  const org = await getOrganiserByUsername(username);
  if (!org) return null;
  const ok = await bcrypt.compare(password, org.passwordHash);
  if (!ok) return null;
  const token = await signToken({
    id: org.id,
    username: org.username,
    role: org.role,
    email: org.email,
    displayName: org.displayName,
    idPassCode: org.idPassCode,
  });
  return { organiser: org, token };
}

export async function getCurrentOrganiser(): Promise<JWTPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("organiser_token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function requireAuth(requiredRoles?: Organiser["role"][]) {
  const user = await getCurrentOrganiser();
  if (!user) return null;
  if (requiredRoles && !requiredRoles.includes(user.role)) return null;
  return user;
}
