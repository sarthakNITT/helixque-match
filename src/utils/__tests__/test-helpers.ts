import { FastifyInstance } from "fastify";
import { buildApp } from "../../app";

export const buildTestApp = async (): Promise<FastifyInstance> => {
  const app = buildApp();
  await app.ready();
  return app;
};

export const closeTestApp = async (app: FastifyInstance): Promise<void> => {
  await app.close();
};
