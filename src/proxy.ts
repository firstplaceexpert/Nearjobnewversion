/**
 * Next.js Middleware / Proxy — Security Hardening & Granular Rate Limiting
 *
 * Runs on requests before routing:
 * 1. Sets OWASP-recommended security headers (HSTS, CSP, X-Frame-Options, etc.)
 * 2. Enforces granular in-memory rate limiting on sensitive routes:
 *    - Auth endpoints (login, register): 10 req/min (anti-brute-force)
 *    - Mutation endpoints (post task, apply): 20 req/min (anti-spam)
 *    - General API routes: 120 req/min
 */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/* ── Rate Limiter Data Structures ────────────────────────── */
interface RateLimitBucket {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitBucket>();

function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number = 60 * 1000,
): { isLimited: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  // Lazy clean-up if expired
  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return { isLimited: false, remaining: maxRequests - 1 };
  }

  entry.count++;
  if (entry.count > maxRequests) {
    return { isLimited: true, remaining: 0 };
  }

  return { isLimited: false, remaining: maxRequests - entry.count };
}

// Periodic cleanup of stale rate-limit buckets
if (typeof setInterval !== "undefined") {
  setInterval(
    () => {
      const now = Date.now();
      for (const [key, bucket] of rateLimitStore.entries()) {
        if (now > bucket.resetTime) {
          rateLimitStore.delete(key);
        }
      }
    },
    5 * 60 * 1000,
  );
}

/* ── Comprehensive OWASP Security Headers ─────────────────── */
const securityHeaders: Record<string, string> = {
  // Prevent clickjacking by denying iframe embedding
  "X-Frame-Options": "DENY",

  // Prevent MIME-sniffing
  "X-Content-Type-Options": "nosniff",

  // Control referrer information sent in request headers
  "Referrer-Policy": "strict-origin-when-cross-origin",

  // Enable XSS filter in browsers
  "X-XSS-Protection": "1; mode=block",

  // Restrict sensitive browser features
  "Permissions-Policy":
    "camera=(), microphone=(), geolocation=(self), browsing-topics=()",

  // Enforce HTTPS in production with HSTS (1 year + subdomains + preload)
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",

  // DNS prefetching control
  "X-DNS-Prefetch-Control": "on",

  // Content Security Policy
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob: https:",
    "connect-src 'self'",
    "frame-ancestors 'none'",
  ].join("; "),
};

/* ── Proxy Function ─────────────────────────────────────── */
export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "127.0.0.1";

  // Enforce Granular Rate Limits on API Routes
  if (pathname.startsWith("/api")) {
    let limit = 120;
    const windowMs = 60 * 1000;
    let prefix = "gen";

    if (pathname.startsWith("/api/auth")) {
      // Sensitive: Authentication routes (anti brute-force)
      limit = 15;
      prefix = "auth";
    } else if (
      request.method === "POST" &&
      (pathname.includes("/apply") || pathname === "/api/tasks")
    ) {
      // Sensitive: Mutations (anti spam posting and spam applying)
      limit = 20;
      prefix = "mut";
    }

    const rateKey = `${prefix}:${ip}`;
    const { isLimited } = checkRateLimit(rateKey, limit, windowMs);

    if (isLimited) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          error:
            "Terlalu banyak permintaan (Rate limit terlampaui). Silakan coba lagi beberapa saat lagi.",
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": "60",
          },
        },
      );
    }
  }

  // Apply security headers
  const response = NextResponse.next();
  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT static assets and internal endpoints:
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
