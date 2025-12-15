import { z } from "zod";
import { UserPreferencesSchema } from "./user.schema";

// Legacy schema for backward compatibility
export const PreferenceSchema = z.object({
  domain: z.string(),
  techStacks: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  experience: z.string(),
});

// Enhanced schema that matches the matching system requirements
export const EnhancedPreferenceSchema = UserPreferencesSchema;

export type Preference = z.infer<typeof PreferenceSchema>;
export type EnhancedPreference = z.infer<typeof EnhancedPreferenceSchema>;
