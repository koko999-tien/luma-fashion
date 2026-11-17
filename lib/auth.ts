import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

const AUTH_SECRET = process.env.AUTH_SECRET;
// Không bao giờ ký/verify session bằng secret mặc định ở production (kiểm tra lúc chạy, không phải lúc build)
function getSecret(): Uint8Array {
  if (process.env.NODE_ENV === "production" && !AUTH_SECRET) {
    throw new Error("AUTH_SECRET is not set. Configure a random secret (>=32 chars) in production environment.");
  }
  return new TextEncoder().encode(AUTH_SECRET ?? "dev-secret-change-me-32chars-minimum!!");
}
const SESSION_COOKIE = "luma_session";

export type SessionUser = { id: string; email: string; name: string; role: "CUSTOMER" | "ADMIN" };

export async function createSession(user: SessionUser) {
  const token = await new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(getSecret());
  const store = await cookies();
  // Secure chỉ bật khi chạy HTTPS (deploy thật). Ở localhost HTTP cần để false.
  const secure = (process.env.SITE_URL ?? "").startsWith("https");
  store.set(SESSION_COOKIE, token, { httpOnly: true, sameSite: "lax", secure, path: "/", maxAge: 60 * 60 * 24 * 30 });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function getSession(): Promise<SessionUser | null> {
  try {
    const store = await cookies();
    const token = store.get(SESSION_COOKIE)?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, getSecret());
    // Xác thực lại user vẫn tồn tại & chưa bị khoá
    const user = await prisma.user.findUnique({ where: { id: payload.id as string }, select: { id: true, email: true, name: true, role: true, status: true } });
    if (!user || user.status === "BLOCKED") return null;
    return { id: user.id, email: user.email, name: user.name, role: user.role as "CUSTOMER" | "ADMIN" };
  } catch {
    return null;
  }
}

export async function requireAdmin(): Promise<SessionUser | null> {
  const s = await getSession();
  return s?.role === "ADMIN" ? s : null;
}
