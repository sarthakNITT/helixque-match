import { FastifyPluginAsync } from "fastify";
import {
  joinMatch,
  cancelMatch,
  submitFeedback,
  markMatchEnd,
} from "../controllers/match.controller";
// Schema imports are handled by Fastify JSON Schema validation

const matchRoutes: FastifyPluginAsync = async (app) => {
  // POST /match/join - Internal endpoint for joining matching queue
  app.post(
    "/join",
    {
      schema: {
        description: "Join matching queue (strict or loose mode)",
        tags: ["Internal Match API"],
        body: {
          type: "object",
          properties: {
            userId: { type: "string" },
            mode: { type: "string", enum: ["strict", "loose"] },
            preferences: { type: "object" },
            requestId: { type: "string" },
          },
          required: ["userId", "mode", "preferences"],
        },
      },
    },
    joinMatch
  );

  // POST /match/cancel - Internal endpoint for cancelling match
  app.post(
    "/cancel",
    {
      schema: {
        description: "Cancel pending match request and remove from queue",
        tags: ["Internal Match API"],
        body: {
          type: "object",
          properties: {
            userId: { type: "string" },
            mode: { type: "string", enum: ["strict", "loose"] },
          },
          required: ["userId"],
        },
      },
    },
    cancelMatch
  );

  // POST /match/feedback - Internal endpoint for submitting feedback
  app.post(
    "/feedback",
    {
      schema: {
        description: "Submit rating and feedback for a completed match",
        tags: ["Internal Match API"],
        body: {
          type: "object",
          properties: {
            matchId: { type: "string" },
            fromUserId: { type: "string" },
            toUserId: { type: "string" },
            rating: { type: "number", minimum: 1, maximum: 5 },
            tags: { type: "array", items: { type: "string" } },
          },
          required: ["matchId", "fromUserId", "toUserId", "rating"],
        },
      },
    },
    submitFeedback
  );

  // POST /match/mark_end - Internal endpoint for marking match as ended
  app.post(
    "/mark_end",
    {
      schema: {
        description: "Mark a match as ended and update user statuses",
        tags: ["Internal Match API"],
        body: {
          type: "object",
          properties: {
            matchId: { type: "string" },
            userId: { type: "string" },
            reason: { type: "string" },
          },
          required: ["matchId", "userId"],
        },
      },
    },
    markMatchEnd
  );
};

export default matchRoutes;
