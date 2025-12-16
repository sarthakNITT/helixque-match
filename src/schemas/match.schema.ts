import { z } from "zod";
import { PreferenceSchema } from "./preferences.schema";

export const JoinMatchSchema = z.object({
  userId: z.string(),
  mode: z.enum(["strict", "loose"]),
  prefs: PreferenceSchema,
});

export const LeaveMatchSchema = z.object({
  userId: z.string(),
});
