import { FastifyPluginAsync } from "fastify";
import { joinMatch, leaveMatch } from "../controllers/match.controller";

const matchRoutes: FastifyPluginAsync = async (app) => {
  app.post("/join", joinMatch);
  app.post("/leave", leaveMatch);
};

export default matchRoutes;
