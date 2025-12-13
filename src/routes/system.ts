import { FastifyPluginAsync } from "fastify";
import { healthCheck, getMetrics } from "../controllers/system.controller";
// Schema imports are handled by Fastify JSON Schema validation

const systemRoutes: FastifyPluginAsync = async (app) => {
  // GET /health - Health check endpoint (alternative)
  app.get(
    "/health",
    {
      schema: {
        description:
          "System health check - returns 200 if service is up and connected to Redis & Postgres",
        tags: ["System"],
      },
    },
    healthCheck
  );

  // GET /healthz - Health check endpoint
  app.get(
    "/healthz",
    {
      schema: {
        description:
          "System health check - returns 200 if service is up and connected to Redis & Postgres",
        tags: ["System"],
      },
    },
    healthCheck
  );

  // GET /metrics - Prometheus metrics endpoint
  app.get(
    "/metrics",
    {
      schema: {
        description:
          "Prometheus metrics endpoint - exposes internal metrics (queue lengths, latencies)",
        tags: ["System"],
      },
    },
    getMetrics
  );
};

export default systemRoutes;
