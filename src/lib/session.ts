// Edge-safe session token helpers (jose only — NO Node APIs, no Prisma, no bcrypt).
// Safe to import from proxy.ts (runs on the edge).
import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET || "dev-only-insecure-secret-set-SESSION_SECRET"
);

export const SESSION_COOKIE = "pms_session";

export type Role = "REP" | "APPROVER" | "ADMIN";
export type SessionPayload = {
  userId: string;
  role: Role;
  name: string;
  email: string;
};

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return {
      userId: String(payload.userId),
      role: payload.role as Role,
      name: String(payload.name),
      email: String(payload.email),
    };
  } catch {
    return null;
  }
}
