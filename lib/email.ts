/**
 * Email service — Resend provider (modular, thay được provider khác).
 * Khi RESEND_API_KEY (hoặc EMAIL_PROVIDER_API_KEY) trống:
 *   - KHÔNG gửi thật, ghi log ra server
 *   - Ghi NotificationLog status=DISABLED
 *   - KHÔNG bao giờ báo "đã gửi" khi chưa gửi
 */
import { prisma } from "./prisma";

const RESEND_API_KEY = process.env.RESEND_API_KEY || process.env.EMAIL_PROVIDER_API_KEY || "";
const EMAIL_FROM = process.env.EMAIL_FROM || "LUMA Fashion <noreply@luma.vn>";
const REPLY_TO = process.env.EMAIL_REPLY_TO;

export const emailConfigured = Boolean(RESEND_API_KEY);
export type EmailType = "WELCOME" | "PASSWORD_RESET" | "ORDER_CONFIRMATION" | "ORDER_STATUS" | "PAYMENT_CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";

async function log(type: EmailType, to: string, subject: string, status: "SENT" | "FAILED" | "DISABLED", error: string | null, orderId?: string | null) {
  try {
    await prisma.notificationLog.create({ data: { channel: "EMAIL", type, to, subject, status, error: error?.slice(0, 500) ?? null, orderId: orderId ?? null } });
  } catch (e) {
    console.error("[email] không ghi được NotificationLog:", e);
  }
}

export async function sendEmail(opts: { type: EmailType; to: string; subject: string; html: string; orderId?: string | null }): Promise<{ ok: boolean; disabled?: boolean; error?: string }> {
  const { type, to, subject, html, orderId } = opts;
  if (!emailConfigured) {
    console.log(`[email:DISABLED] (${type}) To: ${to} — Subject: ${subject}\nRESEND_API_KEY chưa cấu hình → email KHÔNG được gửi.`);
    await log(type, to, subject, "DISABLED", null, orderId);
    return { ok: false, disabled: true };
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: EMAIL_FROM, to: [to], subject, html, ...(REPLY_TO ? { reply_to: REPLY_TO } : {}) }),
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`Resend HTTP ${res.status}: ${body.slice(0, 300)}`);
    }
    await log(type, to, subject, "SENT", null, orderId);
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error(`[email:FAILED] (${type}) To: ${to} — ${msg}`);
    await log(type, to, subject, "FAILED", msg, orderId);
    return { ok: false, error: msg };
  }
}
