import { FastifyPluginAsync } from "fastify";
import preferencesRoutes from "./preferences";
import matchRoutes from "./match";

const routes: FastifyPluginAsync = async (app) => {
  // Original preferences route
  app.register(preferencesRoutes, { prefix: "/preferences" });
  app.register(matchRoutes, { prefix: "/match" });
};

export default routes;
