import { FastifyPluginAsync } from "fastify";
import { healthCheck, getMetrics } from "../controllers/system.controller";

const systemRoutes: FastifyPluginAsync = async (app) => {
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
