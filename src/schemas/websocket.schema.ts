import { z } from "zod";
import { UserPreferencesSchema, MatchMode } from "./user.schema";

export const BaseWSMessageSchema = z.object({
  type: z.string(),
  requestId: z
    .string()
    .uuid()
    .optional()
    .describe("Optional UUID for idempotency"),
  payload: z.record(z.string(), z.any()),
});

export const JoinStrictMessageSchema = z.object({
  type: z.literal("join_strict"),
  requestId: z.string().uuid().optional(),
  payload: z.object({
    userId: z.string(),
    preferences: UserPreferencesSchema,
  }),
});

export const JoinLooseMessageSchema = z.object({
  type: z.literal("join_loose"),
  requestId: z.string().uuid().optional(),
  payload: z.object({
    userId: z.string(),
    preferences: UserPreferencesSchema,
  }),
});

export const CancelMessageSchema = z.object({
  type: z.literal("cancel"),
  requestId: z.string().uuid().optional(),
  payload: z.object({
    userId: z.string(),
    mode: z.enum(["strict", "loose"]).optional(),
  }),
});

export const SignalMessageSchema = z.object({
  type: z.literal("signal"),
  requestId: z.string().uuid().optional(),
  payload: z.object({
    matchId: z.string(),
    to: z.string().describe("Peer user ID"),
    signal: z.record(z.string(), z.any()).describe("SDP or ICE object"),
  }),
});

export const CallEndMessageSchema = z.object({
  type: z.literal("call_end"),
  requestId: z.string().uuid().optional(),
  payload: z.object({
    matchId: z.string(),
    userId: z.string(),
    reason: z.string().optional(),
  }),
});

export const FeedbackMessageSchema = z.object({
  type: z.literal("feedback"),
  requestId: z.string().uuid().optional(),
  payload: z.object({
    matchId: z.string(),
    fromUserId: z.string(),
    toUserId: z.string(),
    rating: z.number().min(1).max(5),
    tags: z.array(z.string()).optional(),
  }),
});

export const HeartbeatMessageSchema = z.object({
  type: z.literal("heartbeat"),
  requestId: z.string().uuid().optional(),
  payload: z.object({
    userId: z.string(),
  }),
});

export const ReconnectMessageSchema = z.object({
  type: z.literal("reconnect"),
  requestId: z.string().uuid().optional(),
  payload: z.object({
    userId: z.string(),
    previousRequestId: z.string().uuid().optional(),
  }),
});

export const MatchFoundMessageSchema = z.object({
  type: z.literal("match_found"),
  requestId: z.string().uuid().optional(),
  payload: z.object({
    matchId: z.string(),
    peerId: z.string(),
    mode: MatchMode,
    roomMeta: z
      .record(z.string(), z.any())
      .optional()
      .describe("Minimal metadata for UI"),
  }),
});

export const WaitingMessageSchema = z.object({
  type: z.literal("waiting"),
  requestId: z.string().uuid().optional(),
  payload: z.object({
    message: z.string().default("Added to queue, waiting for match"),
    position: z.number().optional().describe("Position in queue"),
  }),
});

export const CancelledMessageSchema = z.object({
  type: z.literal("cancelled"),
  requestId: z.string().uuid().optional(),
  payload: z.object({
    message: z.string().default("Successfully removed from queue"),
  }),
});

export const ErrorMessageSchema = z.object({
  type: z.literal("error"),
  requestId: z.string().uuid().optional(),
  payload: z.object({
    code: z.number(),
    message: z.string(),
    details: z.string().optional(),
  }),
});

export const FeedbackReceivedMessageSchema = z.object({
  type: z.literal("feedback_received"),
  requestId: z.string().uuid().optional(),
  payload: z.object({
    message: z.string().default("Feedback recorded successfully"),
  }),
});

export const PongMessageSchema = z.object({
  type: z.literal("pong"),
  requestId: z.string().uuid().optional(),
  payload: z.object({
    timestamp: z.number(),
  }),
});

export const ClientWSMessageSchema = z.discriminatedUnion("type", [
  JoinStrictMessageSchema,
  JoinLooseMessageSchema,
  CancelMessageSchema,
  SignalMessageSchema,
  CallEndMessageSchema,
  FeedbackMessageSchema,
  HeartbeatMessageSchema,
  ReconnectMessageSchema,
]);

export const ServerWSMessageSchema = z.discriminatedUnion("type", [
  MatchFoundMessageSchema,
  WaitingMessageSchema,
  CancelledMessageSchema,
  ErrorMessageSchema,
  FeedbackReceivedMessageSchema,
  PongMessageSchema,
]);

export type BaseWSMessage = z.infer<typeof BaseWSMessageSchema>;
export type JoinStrictMessage = z.infer<typeof JoinStrictMessageSchema>;
export type JoinLooseMessage = z.infer<typeof JoinLooseMessageSchema>;
export type CancelMessage = z.infer<typeof CancelMessageSchema>;
export type SignalMessage = z.infer<typeof SignalMessageSchema>;
export type CallEndMessage = z.infer<typeof CallEndMessageSchema>;
export type FeedbackMessage = z.infer<typeof FeedbackMessageSchema>;
export type HeartbeatMessage = z.infer<typeof HeartbeatMessageSchema>;
export type ReconnectMessage = z.infer<typeof ReconnectMessageSchema>;
export type MatchFoundMessage = z.infer<typeof MatchFoundMessageSchema>;
export type WaitingMessage = z.infer<typeof WaitingMessageSchema>;
export type CancelledMessage = z.infer<typeof CancelledMessageSchema>;
export type ErrorMessage = z.infer<typeof ErrorMessageSchema>;
export type FeedbackReceivedMessage = z.infer<
  typeof FeedbackReceivedMessageSchema
>;
export type PongMessage = z.infer<typeof PongMessageSchema>;
export type ClientWSMessage = z.infer<typeof ClientWSMessageSchema>;
export type ServerWSMessage = z.infer<typeof ServerWSMessageSchema>;
