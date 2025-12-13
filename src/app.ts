import Fastify, { FastifyInstance } from "fastify";
import corsPlugin from "./plugins/cors";
import swaggerPlugin from "./plugins/swagger";
import routes from "./routes";
import healthRoute from "./routes/health";
import { log as logger } from "./utils/logger";

export const buildApp = (): FastifyInstance => {
  const app = Fastify({ logger: true });

  app.register(corsPlugin);
  app.register(swaggerPlugin);
  app.register(healthRoute);
  app.register(routes, { prefix: "/api/v1" });

  return app;
};
