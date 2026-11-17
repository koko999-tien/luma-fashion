/**
 * Rate limiter in-memory (phù hợp single-instance). Production nhiều instance nên dùng
 * Redis/Upstash — kiến trúc tương đương, chỉ đổi backend lưu trữ.
 */
type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

// Dọn bucket hết hạn định kỳ (tránh phình bộ nhớ)
let lastSweep = Date.now();
function sweep() {
  const now = Date.now();
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [k, b] of buckets) if (b.resetAt < now) buckets.delete(k);
}

export type RateLimitResult = { allowed: boolean; retryAfterSeconds: number };

export function rateLimit(key: string, limit: number, windowSeconds: number): RateLimitResult {
  sweep();
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return { allowed: true, retryAfterSeconds: 0 };
  }
  if (b.count >= limit) return { allowed: false, retryAfterSeconds: Math.ceil((b.resetAt - now) / 1000) };
  b.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

export function rateLimitResponse(retryAfterSeconds: number) {
  return Response.json({ message: `Quá nhiều yêu cầu. Vui lòng thử lại sau ${retryAfterSeconds} giây.` }, { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } });
}

/** Lấy IP client (qua proxy nếu có) */
export function clientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
}
