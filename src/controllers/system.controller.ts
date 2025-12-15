import { FastifyReply, FastifyRequest } from "fastify";
import {
  HealthCheckResponse,
  MetricsResponse,
  ErrorResponse,
} from "../schemas/api.schema";

// Mock data stores (in production, these would be Redis/PostgreSQL)
const startTime = Date.now();

/**
 * Health check endpoint
 * GET /healthz
 */
export const healthCheck = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    // Mock service health checks
    const redisHealthy = true; // In production: await redis.ping()
    const postgresHealthy = true; // In production: await db.raw('SELECT 1')

    if (!redisHealthy || !postgresHealthy) {
      return reply.status(503).send({
        success: false,
        error: {
          code: 503,
          message: "Service unhealthy",
          details: `Redis: ${redisHealthy ? "OK" : "FAIL"}, Postgres: ${postgresHealthy ? "OK" : "FAIL"}`,
        },
      } as ErrorResponse);
    }

    const response: HealthCheckResponse = {
      status: "healthy",
      timestamp: new Date(),
      services: {
        redis: redisHealthy,
        postgres: postgresHealthy,
      },
      uptime: Date.now() - startTime,
    };

    return reply.send(response);
  } catch (error) {
    request.log.error({ error }, "Error in healthCheck");
    return reply.status(500).send({
      success: false,
      error: {
        code: 500,
        message: "Internal server error",
      },
    } as ErrorResponse);
  }
};

/**
 * Metrics endpoint for Prometheus
 * GET /metrics
 */
export const getMetrics = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    // Mock metrics data (in production, get from actual data stores)
    const queueData = {
      strict_total: 5, // Mock data
      loose_total: 12, // Mock data
      by_language: {
        javascript: 8,
        python: 4,
        java: 3,
        typescript: 2,
      },
    };

    const activeMatchCount = 3; // Mock data
    const completedTodayCount = 15; // Mock data

    const response: MetricsResponse = {
      queues: queueData,
      matches: {
        total_active: activeMatchCount,
        completed_today: completedTodayCount,
        average_wait_time: 45.5, // Mock average wait time in seconds
      },
      system: {
        memory_usage: process.memoryUsage().heapUsed / 1024 / 1024, // MB
        cpu_usage: Math.random() * 100, // Mock CPU usage percentage
        connections:
          queueData.strict_total + queueData.loose_total + activeMatchCount,
      },
    };

    return reply.send(response);
  } catch (error) {
    request.log.error({ error }, "Error in getMetrics");
    return reply.status(500).send({
      success: false,
      error: {
        code: 500,
        message: "Internal server error",
      },
    } as ErrorResponse);
  }
};

// Helper function to calculate average wait time (mock implementation)
function _calculateAverageWaitTime(): number {
  // In production, this would calculate from actual queue data
  return 45.5; // Mock average wait time in seconds
}
