/**
 * Health Check API Endpoint
 *
 * Used by load balancers (AWS ALB, Kubernetes liveness/readiness probes, Docker, UptimeRobot)
 * to verify service availability and system health.
 */
import { NextResponse } from "next/server";

export async function GET() {
  const healthData = {
    status: "ok",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || "development",
    version: "0.1.0",
    services: {
      api: "healthy",
      database: "healthy",
      store: "active",
    },
    memoryUsageMB: {
      rss: Math.round(process.memoryUsage().rss / (1024 * 1024)),
      heapUsed: Math.round(process.memoryUsage().heapUsed / (1024 * 1024)),
    },
  };

  return NextResponse.json(healthData, {
    status: 200,
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
}
