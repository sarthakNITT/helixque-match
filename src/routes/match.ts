import { FastifyPluginAsync } from "fastify";
import {
  joinMatch,
  leaveMatch,
  submitMatchFeedback,
  markMatchAsEnded,
} from "../controllers/match.controller";

const matchRoutes: FastifyPluginAsync = async (app) => {
  app.post(
    "/join",
    {
      schema: {
        description: "Join a match queue (strict or loose mode)",
        tags: ["Internal Match API"],
        body: {
          type: "object",
          required: ["userId", "mode", "prefs"],
          properties: {
            userId: { type: "string" },
            mode: { type: "string", enum: ["strict", "loose"] },
            prefs: {
              type: "object",
              required: ["domain", "experience"],
              properties: {
                domain: { type: "string" },
                techStacks: { type: "array", items: { type: "string" } },
                languages: { type: "array", items: { type: "string" } },
                experience: { type: "string" },
              },
            },
          },
          examples: [
            {
              userId: "user_123",
              mode: "strict",
              prefs: {
                domain: "Software",
                techStacks: ["Node.js", "React"],
                languages: ["English"],
                experience: "Intermediate",
              },
            },
          ],
        },
        response: {
          200: {
            type: "object",
            properties: {
              message: { type: "string" },
              matchId: { type: "string" },
              status: { type: "string" },
            },
          },
        },
      },
    },
    joinMatch
  );

  app.post(
    "/leave",
    {
      schema: {
        description: "Leave the match queue",
        tags: ["Internal Match API"],
        body: {
          type: "object",
          required: ["userId"],
          properties: {
            userId: { type: "string" },
            mode: { type: "string", enum: ["strict", "loose"] },
          },
          examples: [
            {
              userId: "user_123",
              mode: "strict",
            },
          ],
        },
        response: {
          200: {
            type: "object",
            properties: {
              message: { type: "string" },
            },
          },
        },
      },
    },
    leaveMatch
  );

  app.post(
    "/feedback",
    {
      schema: {
        description: "Submit feedback for a match",
        tags: ["Internal Match API"],
        body: {
          type: "object",
          required: ["matchId", "fromUserId", "toUserId", "rating"],
          properties: {
            matchId: { type: "string" },
            fromUserId: { type: "string" },
            toUserId: { type: "string" },
            rating: { type: "number", minimum: 1, maximum: 5 },
            tags: { type: "array", items: { type: "string" } },
          },
          examples: [
            {
              matchId: "match_abc",
              fromUserId: "user_123",
              toUserId: "user_456",
              rating: 5,
              tags: ["knowledgeable", "friendly"],
            },
          ],
        },
        response: {
          200: {
            type: "object",
            properties: {
              message: { type: "string" },
              feedbackId: { type: "string" },
            },
          },
        },
      },
    },
    submitMatchFeedback
  );

  app.post(
    "/mark_end",
    {
      schema: {
        description: "Mark a match as ended",
        tags: ["Internal Match API"],
        body: {
          type: "object",
          required: ["matchId", "userId", "reason"],
          properties: {
            matchId: { type: "string" },
            userId: { type: "string" },
            reason: { type: "string" },
          },
          examples: [
            {
              matchId: "match_abc",
              userId: "user_123",
              reason: "completed",
            },
          ],
        },
        response: {
          200: {
            type: "object",
            properties: {
              message: { type: "string" },
            },
          },
        },
      },
    },
    markMatchAsEnded
  );
};

export default matchRoutes;
