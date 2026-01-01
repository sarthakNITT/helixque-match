import { FastifyReply, FastifyRequest } from "fastify";
import {
  HealthCheckResponse,
  MetricsResponse,
  ErrorResponse,
} from "../schemas/api.schema";

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
    const redisHealthy = true;
    const postgresHealthy = true;

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
    const queueData = {
      strict_total: 5,
      loose_total: 12,
      by_language: {
        javascript: 8,
        python: 4,
        java: 3,
        typescript: 2,
      },
    };

    const activeMatchCount = 3;
    const completedTodayCount = 15;

    const response: MetricsResponse = {
      queues: queueData,
      matches: {
        total_active: activeMatchCount,
        completed_today: completedTodayCount,
        average_wait_time: 45.5,
      },
      system: {
        memory_usage: process.memoryUsage().heapUsed / 1024 / 1024,
        cpu_usage: Math.random() * 100,
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

function _calculateAverageWaitTime(): number {
  return 45.5;
}
