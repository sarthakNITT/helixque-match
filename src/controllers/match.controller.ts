import { FastifyReply, FastifyRequest } from "fastify";
import {
  InternalJoinRequestSchema,
  InternalJoinResponse,
  InternalCancelRequestSchema,
  InternalCancelResponse,
  InternalFeedbackRequestSchema,
  InternalMarkEndRequestSchema,
  SuccessResponse,
  ErrorResponse,
} from "../schemas/api.schema";

// Mock data stores (in production, these would be Redis/PostgreSQL)
const queues: Map<string, Array<Record<string, unknown>>> = new Map();
const userQueues: Map<string, Record<string, unknown>> = new Map();
const matches: Map<string, Record<string, unknown>> = new Map();
const bannedUsers: Set<string> = new Set();
const _deprioritizedUsers: Map<string, { until: Date; reason: string }> =
  new Map();

/**
 * Internal endpoint: Join matching queue
 * POST /match/join
 */
export const joinMatch = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const result = InternalJoinRequestSchema.safeParse(request.body);

    if (!result.success) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 400,
          message: "Invalid request payload",
          details: result.error.message,
        },
      } as ErrorResponse);
    }

    const { userId, mode, preferences, requestId } = result.data;

    // Check for idempotency
    if (requestId && userQueues.has(`${userId}:${requestId}`)) {
      const existingResponse = userQueues.get(`${userId}:${requestId}`);
      return reply.send(existingResponse);
    }

    // User validation passed

    // Check if user is banned
    if (bannedUsers.has(userId)) {
      return reply.status(403).send({
        success: false,
        error: {
          code: 403,
          message: "User is banned from matching",
        },
      } as ErrorResponse);
    }

    // Mock user validation
    const _user = {
      id: userId,
      status: "OFFLINE",
      preferences,
      totalMatches: 0,
      rating: 0,
      feedback: [],
    };

    // Mock matching logic
    const queueKey =
      mode === "strict" ? "strict_queue" : `loose_${preferences.language}`;
    const queue = queues.get(queueKey) || [];

    // Simple mock matching: if queue has someone, match immediately
    if (queue.length > 0) {
      const partner = queue.shift();
      queues.set(queueKey, queue);

      const matchId = `match_${Date.now()}`;
      const match = {
        id: matchId,
        userAId: (partner as Record<string, unknown>).userId,
        userBId: userId,
        mode: mode.toUpperCase(),
        createdAt: new Date(),
        status: "active",
      };

      matches.set(matchId, match);

      const response: InternalJoinResponse = {
        status: "matched",
        matchId,
        peerId: (partner as Record<string, unknown>).userId as string,
        prefKey: mode === "strict" ? generatePrefKey(preferences) : undefined,
      };

      if (requestId) {
        userQueues.set(`${userId}:${requestId}`, response);
      }

      return reply.send(response);
    } else {
      // Add to queue
      queue.push({ userId, preferences, joinedAt: new Date() });
      queues.set(queueKey, queue);

      const response: InternalJoinResponse = {
        status: "waiting",
      };

      if (requestId) {
        userQueues.set(`${userId}:${requestId}`, response);
      }

      return reply.send(response);
    }
  } catch (error) {
    request.log.error({ error }, "Error in joinMatch");
    return reply.status(500).send({
      success: false,
      error: {
        code: 500,
        message: "Internal server error",
      },
    } as ErrorResponse);
  }
};

/**
 * Internal endpoint: Cancel matching
 * POST /match/cancel
 */
export const cancelMatch = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const result = InternalCancelRequestSchema.safeParse(request.body);

    if (!result.success) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 400,
          message: "Invalid request payload",
        },
      } as ErrorResponse);
    }

    const { userId, mode } = result.data;

    // Remove user from all relevant queues
    const queuesToCheck = mode
      ? [mode === "strict" ? "strict_queue" : "loose_queue"]
      : Array.from(queues.keys());

    for (const queueKey of queuesToCheck) {
      const queue = queues.get(queueKey) || [];
      const filteredQueue = queue.filter(
        (item: Record<string, unknown>) => item.userId !== userId
      );
      queues.set(queueKey, filteredQueue);
    }

    const response: InternalCancelResponse = {
      status: "cancelled",
    };

    return reply.send(response);
  } catch (error) {
    request.log.error({ error }, "Error in cancelMatch");
    return reply.status(500).send({
      success: false,
      error: {
        code: 500,
        message: "Internal server error",
      },
    } as ErrorResponse);
  }
};

/**
 * Internal endpoint: Submit feedback
 * POST /match/feedback
 */
export const submitFeedback = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const result = InternalFeedbackRequestSchema.safeParse(request.body);

    if (!result.success) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 400,
          message: "Invalid feedback payload",
        },
      } as ErrorResponse);
    }

    const { matchId, fromUserId, toUserId, rating, tags } = result.data;

    // Mock: Store feedback and update user rating
    const feedbackId = `feedback_${Date.now()}`;
    const _feedback = {
      id: feedbackId,
      matchId,
      fromUserId,
      toUserId,
      rating,
      tags,
      createdAt: new Date(),
    };

    // Mock: Store feedback (in production: save to PostgreSQL)
    const _feedbackRecord = {
      id: feedbackId,
      matchId,
      fromUserId,
      toUserId,
      rating,
      tags,
      createdAt: new Date(),
    };

    // Note: User rating updates would be handled in production database

    const response: SuccessResponse = {
      success: true,
      message: "Feedback submitted successfully",
      data: { feedbackId },
    };

    return reply.send(response);
  } catch (error) {
    request.log.error({ error }, "Error in submitFeedback");
    return reply.status(500).send({
      success: false,
      error: {
        code: 500,
        message: "Internal server error",
      },
    } as ErrorResponse);
  }
};

/**
 * Internal endpoint: Mark match as ended
 * POST /match/mark_end
 */
export const markMatchEnd = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const result = InternalMarkEndRequestSchema.safeParse(request.body);

    if (!result.success) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 400,
          message: "Invalid request payload",
        },
      } as ErrorResponse);
    }

    const { matchId, userId, reason } = result.data;

    // Mock: Update match record
    const match = matches.get(matchId);
    if (!match) {
      return reply.status(404).send({
        success: false,
        error: {
          code: 404,
          message: "Match not found",
        },
      } as ErrorResponse);
    }

    const updatedMatch = {
      ...match,
      endedAt: new Date(),
      endedBy: userId,
      endReason: reason,
      status: "ended",
    };

    matches.set(matchId, updatedMatch);

    const response: SuccessResponse = {
      success: true,
      message: "Match ended successfully",
    };

    return reply.send(response);
  } catch (error) {
    request.log.error({ error }, "Error in markMatchEnd");
    return reply.status(500).send({
      success: false,
      error: {
        code: 500,
        message: "Internal server error",
      },
    } as ErrorResponse);
  }
};

// Helper function to generate preference key for strict matching
function generatePrefKey(preferences: Record<string, unknown>): string {
  const prefs = preferences as Record<string, unknown>;
  const keys = [
    `lang=${prefs.language}`,
    `domain=${prefs.domain}`,
    `exp=${prefs.experience}`,
    `stack=${Array.isArray(prefs.techStack) ? prefs.techStack.sort().join(",") : ""}`,
  ];
  return keys.join("|");
}
