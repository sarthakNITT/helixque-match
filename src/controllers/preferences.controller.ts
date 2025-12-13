import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import {
  PreferenceSchema,
  EnhancedPreferenceSchema,
} from "../schemas/preferences.schema";

type PreferencePayload = z.infer<typeof PreferenceSchema>;
type EnhancedPreferencePayload = z.infer<typeof EnhancedPreferenceSchema>;

// Mock data store (in production: PostgreSQL)
const enhancedPreferences: Map<string, Record<string, unknown>> = new Map();

export const listPreferences = async (
  _request: FastifyRequest,
  reply: FastifyReply
) => {
  const preferences = Array.from(enhancedPreferences.values());

  return reply.send({
    data: preferences,
    message: "Preferences fetched successfully",
    count: preferences.length,
  });
};

export const createPreference = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const result = PreferenceSchema.safeParse(request.body);

  if (!result.success) {
    return reply.status(400).send({
      message: "Invalid preference payload",
      errors: result.error.flatten(),
    });
  }

  const payload: PreferencePayload = result.data;

  // Generate ID and store in mock data store
  const preferenceId = `pref_${Date.now()}`;
  const preferenceWithId = {
    id: preferenceId,
    ...payload,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  enhancedPreferences.set(preferenceId, preferenceWithId);

  return reply.code(201).send({
    data: preferenceWithId,
    message: "Preference created",
  });
};

export const createEnhancedPreference = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const result = EnhancedPreferenceSchema.safeParse(request.body);

  if (!result.success) {
    return reply.status(400).send({
      message: "Invalid enhanced preference payload",
      errors: result.error.flatten(),
    });
  }

  const payload: EnhancedPreferencePayload = result.data;

  // Generate ID and store in mock data store
  const preferenceId = `enhanced_pref_${Date.now()}`;
  const preferenceWithId = {
    id: preferenceId,
    ...payload,
    createdAt: new Date(),
    updatedAt: new Date(),
    strictPrefKey: generateStrictPrefKey(payload),
  };

  enhancedPreferences.set(preferenceId, preferenceWithId);

  return reply.code(201).send({
    data: preferenceWithId,
    message: "Enhanced preference created",
  });
};

export const getPreference = async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  const { id } = request.params;
  const preference = enhancedPreferences.get(id);

  if (!preference) {
    return reply.status(404).send({
      message: "Preference not found",
    });
  }

  return reply.send({
    data: preference,
    message: "Preference retrieved",
  });
};

export const updatePreference = async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  const { id } = request.params;
  const existingPreference = enhancedPreferences.get(id);

  if (!existingPreference) {
    return reply.status(404).send({
      message: "Preference not found",
    });
  }

  // Determine which schema to use based on existing preference structure
  const isEnhanced = "techStack" in existingPreference;
  const schema = isEnhanced ? EnhancedPreferenceSchema : PreferenceSchema;

  const result = schema.safeParse(request.body);

  if (!result.success) {
    return reply.status(400).send({
      message: "Invalid preference payload",
      errors: result.error.flatten(),
    });
  }

  const updatedPreference = {
    ...existingPreference,
    ...result.data,
    updatedAt: new Date(),
    strictPrefKey: isEnhanced
      ? generateStrictPrefKey(result.data as EnhancedPreferencePayload)
      : undefined,
  };

  enhancedPreferences.set(id, updatedPreference);

  return reply.send({
    data: updatedPreference,
    message: "Preference updated",
  });
};

export const deletePreference = async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  const { id } = request.params;
  const deleted = enhancedPreferences.delete(id);

  if (!deleted) {
    return reply.status(404).send({
      message: "Preference not found",
    });
  }

  return reply.send({
    message: "Preference deleted successfully",
  });
};

// Helper function to generate strict preference key
function generateStrictPrefKey(preferences: EnhancedPreferencePayload): string {
  const keys = [
    `lang=${preferences.language}`,
    `domain=${preferences.domain}`,
    `exp=${preferences.experience}`,
    `stack=${preferences.techStack.sort().join(",")}`,
  ];
  return keys.join("|");
}
