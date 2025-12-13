import { z } from "zod";

// Enums
export const UserStatus = z.enum([
  "OFFLINE",
  "ONLINE",
  "WAITING_STRICT",
  "WAITING_LOOSE",
  "IN_CALL",
]);

export const MatchMode = z.enum(["STRICT", "LOOSE"]);

// User Preferences Schema (10 profile fields)
export const UserPreferencesSchema = z.object({
  language: z.string().describe("Programming language preference"),
  techStack: z.array(z.string()).describe("Technology stack preferences"),
  domain: z.string().describe("Domain/industry preference"),
  region: z.string().describe("Geographic region"),
  experience: z.string().describe("Experience level (e.g., '1-3 years')"),
  availability: z.string().describe("Time availability"),
  timezone: z.string().describe("User timezone"),
  projectType: z.string().describe("Type of project preferred"),
  communicationStyle: z.string().describe("Communication preference"),
  goals: z.array(z.string()).describe("Learning/collaboration goals"),
});

// User Schema
export const UserSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  displayName: z.string().optional(),
  email: z.string().email().optional(),
  preferences: UserPreferencesSchema,
  strictPrefKey: z
    .string()
    .optional()
    .describe("Normalized preference string for strict matching"),
  ratingScore: z.number().default(0),
  ratingCount: z.number().default(0),
  reportsCount: z.number().default(0),
  status: UserStatus.default("OFFLINE"),
  lastSeen: z.date().optional(),
  currentMatchId: z.string().optional(),
});

// Match Schema
export const MatchSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  endedAt: z.date().optional(),
  mode: MatchMode,
  prefKey: z.string().optional(),
  userAId: z.string(),
  userBId: z.string(),
  ratingA: z.number().min(1).max(5).optional(),
  ratingB: z.number().min(1).max(5).optional(),
  tagsA: z.array(z.string()).optional(),
  tagsB: z.array(z.string()).optional(),
});

// Feedback Schema
export const FeedbackSchema = z.object({
  id: z.string(),
  matchId: z.string(),
  fromUserId: z.string(),
  toUserId: z.string(),
  rating: z.number().min(1).max(5),
  tags: z.array(z.string()).optional(),
  createdAt: z.date(),
});

// Type exports
export type UserStatus = z.infer<typeof UserStatus>;
export type MatchMode = z.infer<typeof MatchMode>;
export type UserPreferences = z.infer<typeof UserPreferencesSchema>;
export type User = z.infer<typeof UserSchema>;
export type Match = z.infer<typeof MatchSchema>;
export type Feedback = z.infer<typeof FeedbackSchema>;
