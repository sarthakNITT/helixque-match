import Fastify, { FastifyInstance } from "fastify";
import corsPlugin from "./plugins/cors";
import swaggerPlugin from "./plugins/swagger";
import routes from "./routes";
import systemRoutes from "./routes/system";

export const buildApp = (): FastifyInstance => {
  const app = Fastify({ logger: true });

  app.register(corsPlugin);
  app.register(swaggerPlugin);
  app.register(systemRoutes);
  app.register(routes, { prefix: "/api/v1" });

  return app;
};
