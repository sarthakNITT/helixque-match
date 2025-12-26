import { FastifyPluginAsync } from "fastify";
import {
  joinMatch,
  leaveMatch,
  submitMatchFeedback,
  markMatchAsEnded,
} from "../controllers/match.controller";

const matchRoutes: FastifyPluginAsync = async (app) => {
  app.post("/join", joinMatch);
  app.post("/leave", leaveMatch);
  app.post("/feedback", submitMatchFeedback);
  app.post("/mark_end", markMatchAsEnded);
};

export default matchRoutes;
