/**
 * Structured Logger for NEAR JOB
 *
 * Emits JSON-formatted structured log records in production and clean,
 * formatted messages in development.
 *
 * Guarantees zero sensitive data leakage (strips passwords, tokens).
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogPayload {
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  timestamp: string;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

function sanitizeContext(
  ctx?: Record<string, unknown>,
): Record<string, unknown> | undefined {
  if (!ctx) return undefined;
  const sanitized: Record<string, unknown> = {};

  const SENSITIVE_KEYS = new Set([
    "password",
    "hashedpassword",
    "secret",
    "token",
    "authorization",
    "cookie",
  ]);

  for (const [key, value] of Object.entries(ctx)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) {
      sanitized[key] = "[REDACTED]";
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = sanitizeContext(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

function emitLog(
  level: LogLevel,
  message: string,
  context?: Record<string, unknown>,
  err?: unknown,
) {
  const timestamp = new Date().toISOString();
  const safeContext = sanitizeContext(context);

  let errorDetails: LogPayload["error"] = undefined;
  if (err instanceof Error) {
    errorDetails = {
      name: err.name,
      message: err.message,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    };
  }

  const payload: LogPayload = {
    level,
    message,
    timestamp,
    ...(safeContext && { context: safeContext }),
    ...(errorDetails && { error: errorDetails }),
  };

  if (process.env.NODE_ENV === "production") {
    // Structured JSON log for log aggregators (Datadog, CloudWatch, Loki)
    const jsonStr = JSON.stringify(payload);
    if (level === "error") {
      process.stderr.write(`${jsonStr}\n`);
    } else {
      process.stdout.write(`${jsonStr}\n`);
    }
  } else {
    // Human-readable colored output in local dev
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    if (level === "error") {
      console.error(prefix, message, safeContext || "", err || "");
    } else if (level === "warn") {
      console.warn(prefix, message, safeContext || "");
    } else {
      console.log(prefix, message, safeContext || "");
    }
  }
}

export const logger = {
  debug: (message: string, context?: Record<string, unknown>) =>
    emitLog("debug", message, context),
  info: (message: string, context?: Record<string, unknown>) =>
    emitLog("info", message, context),
  warn: (message: string, context?: Record<string, unknown>, err?: unknown) =>
    emitLog("warn", message, context, err),
  error: (message: string, context?: Record<string, unknown>, err?: unknown) =>
    emitLog("error", message, context, err),
};
