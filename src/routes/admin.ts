import { FastifyPluginAsync } from "fastify";
import {
  banUser,
  deprioritizeUser,
  getQueueInfo,
} from "../controllers/admin.controller";
// Schema imports are handled by Fastify JSON Schema validation

const adminRoutes: FastifyPluginAsync = async (app) => {
  // POST /admin/ban - Ban a user immediately
  app.post(
    "/ban",
    {
      schema: {
        description: "Ban a user from the matching system",
        tags: ["Admin API"],
        body: {
          type: "object",
          properties: {
            userId: { type: "string" },
            reason: { type: "string" },
          },
          required: ["userId", "reason"],
        },
      },
    },
    banUser
  );

  // POST /admin/deprioritize - Temporarily lower user priority
  app.post(
    "/deprioritize",
    {
      schema: {
        description: "Temporarily deprioritize a user (for suspected spammers)",
        tags: ["Admin API"],
        body: {
          type: "object",
          properties: {
            userId: { type: "string" },
            reason: { type: "string" },
            duration: { type: "number", description: "Duration in minutes" },
          },
          required: ["userId"],
        },
      },
    },
    deprioritizeUser
  );
};

const debugRoutes: FastifyPluginAsync = async (app) => {
  // GET /debug/queue/:key - Get queue information for debugging
  app.get(
    "/queue/:key",
    {
      schema: {
        description:
          "Get queue information for debugging (operator access only)",
        tags: ["Debug API"],
        params: {
          type: "object",
          properties: {
            key: {
              type: "string",
              description: "Queue key (e.g., 'strict_queue', 'loose_en')",
            },
          },
          required: ["key"],
        },
        querystring: {
          type: "object",
          properties: {
            page: { type: "string", description: "Page number for pagination" },
            limit: { type: "string", description: "Items per page" },
          },
        },
      },
    },
    getQueueInfo
  );
};

export { adminRoutes, debugRoutes };
