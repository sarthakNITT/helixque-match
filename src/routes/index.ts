import { FastifyPluginAsync } from "fastify";
import preferencesRoutes from "./preferences";
import matchRoutes from "./match";

const routes: FastifyPluginAsync = async (app) => {
  app.register(preferencesRoutes, { prefix: "/preferences" });
  app.register(matchRoutes, { prefix: "/match" });
};

export default routes;
