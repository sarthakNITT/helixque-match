import { z } from "zod";
import { UserPreferencesSchema } from "./user.schema";

// Internal API Schemas (signaling ↔ matching service)

// 1. Internal Join Match Request
export const InternalJoinRequestSchema = z.object({
  userId: z.string(),
  mode: z.enum(["strict", "loose"]),
  preferences: UserPreferencesSchema,
  requestId: z.string().uuid().optional(),
});

// 2. Internal Join Match Response
export const InternalJoinResponseSchema = z.object({
  status: z.enum(["waiting", "matched"]),
  matchId: z.string().optional(),
  peerId: z.string().optional(),
  prefKey: z.string().optional(),
});

// 3. Internal Cancel Request
export const InternalCancelRequestSchema = z.object({
  userId: z.string(),
  mode: z.enum(["strict", "loose"]).optional(),
});

// 4. Internal Cancel Response
export const InternalCancelResponseSchema = z.object({
  status: z.literal("cancelled"),
});

// 5. Internal Feedback Request
export const InternalFeedbackRequestSchema = z.object({
  matchId: z.string(),
  fromUserId: z.string(),
  toUserId: z.string(),
  rating: z.number().min(1).max(5),
  tags: z.array(z.string()).optional(),
});

// 6. Internal Mark End Request
export const InternalMarkEndRequestSchema = z.object({
  matchId: z.string(),
  userId: z.string(),
  reason: z.string().optional(),
});

// Admin API Schemas

// 1. Ban User Request
export const BanUserRequestSchema = z.object({
  userId: z.string(),
  reason: z.string(),
});

// 2. Ban User Response
export const BanUserResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

// 3. Deprioritize User Request
export const DeprioritizeUserRequestSchema = z.object({
  userId: z.string(),
  reason: z.string().optional(),
  duration: z.number().optional().describe("Duration in minutes"),
});

// 4. Deprioritize User Response
export const DeprioritizeUserResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

// 5. Queue Debug Response
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

// Health Check Response
export const HealthCheckResponseSchema = z.object({
  status: z.literal("healthy"),
  timestamp: z.date(),
  services: z.object({
    redis: z.boolean(),
    postgres: z.boolean(),
  }),
  uptime: z.number(),
});

// Metrics Response
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

// Generic Success Response
export const SuccessResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.any().optional(),
});

// Generic Error Response
export const ErrorResponseSchema = z.object({
  success: z.boolean().default(false),
  error: z.object({
    code: z.number(),
    message: z.string(),
    details: z.string().optional(),
  }),
});

// Type exports
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
