import { FastifyPluginAsync } from "fastify";
import preferencesRoutes from "./preferences";
import matchRoutes from "./match";
import websocketRoutes from "./websocket";
import { adminRoutes, debugRoutes } from "./admin";

const routes: FastifyPluginAsync = async (app) => {
  // Original preferences route
  app.register(preferencesRoutes, { prefix: "/preferences" });
  app.register(matchRoutes, { prefix: "/match" });
  app.register(websocketRoutes, { prefix: "/ws" });
  app.register(adminRoutes, { prefix: "/admin" });
  app.register(debugRoutes, { prefix: "/debug" });
};

export default routes;
