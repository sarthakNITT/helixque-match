import { z } from "zod";
import { PreferenceSchema } from "./preferences.schema";

export const JoinMatchSchema = z.object({
  userId: z.string(),
  mode: z.enum(["strict", "loose"]),
  prefs: PreferenceSchema,
});

export const LeaveMatchSchema = z.object({
  userId: z.string(),
  mode: z.enum(["strict", "loose"]).optional(),
});

export const FeedbackSchema = z.object({
  matchId: z.string(),
  fromUserId: z.string(),
  toUserId: z.string(),
  rating: z.number().min(1).max(5),
  tags: z.array(z.string()).optional(),
});

export const MarkMatchEndSchema = z.object({
  matchId: z.string(),
  userId: z.string(),
  reason: z.string(),
});
