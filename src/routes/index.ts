import { FastifyPluginAsync } from "fastify";
import preferencesRoutes from "./preferences";
import matchRoutes from "./match";
import { adminRoutes, debugRoutes } from "./admin";
import websocketRoutes from "./websocket";

const routes: FastifyPluginAsync = async (app) => {
  // Original preferences route
  app.register(preferencesRoutes, { prefix: "/preferences" });

  // Internal matching API routes
  app.register(matchRoutes, { prefix: "/match" });

  // Admin and debug routes
  app.register(adminRoutes, { prefix: "/admin" });
  app.register(debugRoutes, { prefix: "/debug" });

  // WebSocket documentation routes
  app.register(websocketRoutes, { prefix: "/ws" });
};

export default routes;
