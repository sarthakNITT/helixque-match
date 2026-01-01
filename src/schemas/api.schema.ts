import { z } from "zod";
import { UserPreferencesSchema } from "./user.schema";

export const InternalJoinRequestSchema = z.object({
  userId: z.string(),
  mode: z.enum(["strict", "loose"]),
  preferences: UserPreferencesSchema,
  requestId: z.string().uuid().optional(),
});

export const InternalJoinResponseSchema = z.object({
  status: z.enum(["waiting", "matched"]),
  matchId: z.string().optional(),
  peerId: z.string().optional(),
  prefKey: z.string().optional(),
});

export const InternalCancelRequestSchema = z.object({
  userId: z.string(),
  mode: z.enum(["strict", "loose"]).optional(),
});

export const InternalCancelResponseSchema = z.object({
  status: z.literal("cancelled"),
});

export const InternalFeedbackRequestSchema = z.object({
  matchId: z.string(),
  fromUserId: z.string(),
  toUserId: z.string(),
  rating: z.number().min(1).max(5),
  tags: z.array(z.string()).optional(),
});

export const InternalMarkEndRequestSchema = z.object({
  matchId: z.string(),
  userId: z.string(),
  reason: z.string().optional(),
});

export const BanUserRequestSchema = z.object({
  userId: z.string(),
  reason: z.string(),
});

export const BanUserResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export const DeprioritizeUserRequestSchema = z.object({
  userId: z.string(),
  reason: z.string().optional(),
  duration: z.number().optional().describe("Duration in minutes"),
});

export const DeprioritizeUserResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export const QueueDebugResponseSchema = z.object({
  queueKey: z.string(),
  length: z.number(),
  users: z.array(
    z.object({
      userId: z.string(),
      joinedAt: z.date(),
      preferences: UserPreferencesSchema.optional(),
    })
  ),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
  }),
});

export const HealthCheckResponseSchema = z.object({
  status: z.literal("healthy"),
  timestamp: z.date(),
  services: z.object({
    redis: z.boolean(),
    postgres: z.boolean(),
  }),
  uptime: z.number(),
});

export const MetricsResponseSchema = z.object({
  queues: z.object({
    strict_total: z.number(),
    loose_total: z.number(),
    by_language: z.record(z.string(), z.number()),
  }),
  matches: z.object({
    total_active: z.number(),
    completed_today: z.number(),
    average_wait_time: z.number(),
  }),
  system: z.object({
    memory_usage: z.number(),
    cpu_usage: z.number(),
    connections: z.number(),
  }),
});

export const SuccessResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.any().optional(),
});

export const ErrorResponseSchema = z.object({
  success: z.boolean().default(false),
  error: z.object({
    code: z.number(),
    message: z.string(),
    details: z.string().optional(),
  }),
});

export type InternalJoinRequest = z.infer<typeof InternalJoinRequestSchema>;
export type InternalJoinResponse = z.infer<typeof InternalJoinResponseSchema>;
export type InternalCancelRequest = z.infer<typeof InternalCancelRequestSchema>;
export type InternalCancelResponse = z.infer<
  typeof InternalCancelResponseSchema
>;
export type InternalFeedbackRequest = z.infer<
  typeof InternalFeedbackRequestSchema
>;
export type InternalMarkEndRequest = z.infer<
  typeof InternalMarkEndRequestSchema
>;
export type BanUserRequest = z.infer<typeof BanUserRequestSchema>;
export type BanUserResponse = z.infer<typeof BanUserResponseSchema>;
export type DeprioritizeUserRequest = z.infer<
  typeof DeprioritizeUserRequestSchema
>;
export type DeprioritizeUserResponse = z.infer<
  typeof DeprioritizeUserResponseSchema
>;
export type QueueDebugResponse = z.infer<typeof QueueDebugResponseSchema>;
export type HealthCheckResponse = z.infer<typeof HealthCheckResponseSchema>;
export type MetricsResponse = z.infer<typeof MetricsResponseSchema>;
export type SuccessResponse = z.infer<typeof SuccessResponseSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
