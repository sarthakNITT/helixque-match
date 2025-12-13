import { FastifyReply, FastifyRequest } from "fastify";
import {
  BanUserRequestSchema,
  BanUserResponse,
  DeprioritizeUserRequestSchema,
  DeprioritizeUserResponse,
  ErrorResponse,
} from "../schemas/api.schema";

// Mock data stores (in production, these would be Redis/PostgreSQL)
const bannedUsers: Set<string> = new Set();
const deprioritizedUsers: Map<string, { until: Date; reason: string }> =
  new Map();
const queues: Map<string, Array<Record<string, unknown>>> = new Map();
const _matches: Map<string, Record<string, unknown>> = new Map();

/**
 * Admin endpoint: Ban a user
 * POST /admin/ban
 */
export const banUser = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const result = BanUserRequestSchema.safeParse(request.body);

    if (!result.success) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 400,
          message: "Invalid request payload",
        },
      } as ErrorResponse);
    }

    const { userId, reason } = result.data;

    // Mock: Add user to banned list
    bannedUsers.add(userId);

    // Remove from queues if present
    const _user = {
      id: userId,
      banned: true,
      bannedAt: new Date().toISOString(),
      banReason: reason,
    };

    // Remove from all queues
    for (const [queueKey, queue] of queues) {
      const filteredQueue = queue.filter(
        (item: Record<string, unknown>) => item.userId !== userId
      );
      queues.set(queueKey, filteredQueue);
    }

    const response: BanUserResponse = {
      success: true,
      message: `User ${userId} has been banned successfully`,
    };

    return reply.send(response);
  } catch (error) {
    request.log.error({ error }, "Error in banUser");
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
 * Admin endpoint: Deprioritize a user
 * POST /admin/deprioritize
 */
export const deprioritizeUser = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const result = DeprioritizeUserRequestSchema.safeParse(request.body);

    if (!result.success) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 400,
          message: "Invalid request payload",
        },
      } as ErrorResponse);
    }

    const {
      userId,
      reason = "No reason provided",
      duration = 60,
    } = result.data;

    // Store deprioritization info
    const deprioritizeUntil = new Date(Date.now() + duration * 60 * 1000);
    deprioritizedUsers.set(userId, { until: deprioritizeUntil, reason });

    const response: DeprioritizeUserResponse = {
      success: true,
      message: `User ${userId} has been deprioritized for ${duration} minutes`,
    };

    return reply.send(response);
  } catch (error) {
    request.log.error({ error }, "Error in deprioritizeUser");
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
 * Debug endpoint: Get queue information
 * GET /debug/queue/:key
 */
export const getQueueInfo = async (
  request: FastifyRequest<{
    Params: { key: string };
    Querystring: { page?: string; limit?: string };
  }>,
  reply: FastifyReply
) => {
  try {
    const { key } = request.params;
    const page = parseInt(request.query.page || "1");
    const limit = parseInt(request.query.limit || "10");
    const _offset = (page - 1) * limit;

    const queue = queues.get(key) || [];
    const totalItems = queue.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = queue.slice(startIndex, endIndex);

    return reply.send({
      queueKey: key,
      length: totalItems,
      users: paginatedUsers.map((user: Record<string, unknown>) => ({
        userId: user.userId,
        joinedAt: user.joinedAt,
        preferences: user.preferences,
      })),
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalItems / limit),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    request.log.error({ error }, "Error in getQueueInfo");
    return reply.status(500).send({
      success: false,
      error: {
        code: 500,
        message: "Internal server error",
      },
    } as ErrorResponse);
  }
};
