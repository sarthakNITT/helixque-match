import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { buildApp } from "../../app";
import type { FastifyInstance } from "fastify";

describe("Preferences Controller", () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = buildApp();
    await app.ready();
  });

  afterEach(async () => {
    await app?.close();
  });

  const validLegacyPreference = {
    domain: "frontend",
    techStacks: ["react", "typescript"],
    languages: ["javascript", "typescript"],
    experience: "2-5 years",
  };

  const validEnhancedPreference = {
    language: "javascript",
    techStack: ["react", "node"],
    domain: "frontend",
    region: "us-west",
    experience: "2-5",
    availability: "evenings",
    timezone: "PST",
    projectType: "web-app",
    communicationStyle: "collaborative",
    goals: ["learning", "networking"],
  };

  describe("GET /api/v1/preferences", () => {
    it("should list preferences successfully", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/v1/preferences",
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data).toHaveProperty("data");
      expect(data).toHaveProperty("message");
      expect(data).toHaveProperty("count");
      expect(Array.isArray(data.data)).toBe(true);
    });
  });

  describe("POST /api/v1/preferences", () => {
    it("should create legacy preference successfully", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/v1/preferences",
        payload: validLegacyPreference,
      });

      expect(response.statusCode).toBe(201);
      const data = JSON.parse(response.body);
      expect(data.data.domain).toBe(validLegacyPreference.domain);
      expect(data.data).toHaveProperty("id");
      expect(data.data).toHaveProperty("createdAt");
    });

    it("should validate required fields", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/v1/preferences",
        payload: {
          domain: "frontend",
          // Missing experience
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it("should validate array fields", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/v1/preferences",
        payload: {
          ...validLegacyPreference,
          techStacks: "not-an-array",
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe("POST /api/v1/preferences/enhanced", () => {
    it("should create enhanced preference successfully", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/v1/preferences/enhanced",
        payload: validEnhancedPreference,
      });

      expect(response.statusCode).toBe(201);
      const data = JSON.parse(response.body);
      expect(data.data.language).toBe(validEnhancedPreference.language);
      expect(data.data).toHaveProperty("id");
      expect(data.data).toHaveProperty("strictPrefKey");
    });

    it("should generate strict preference key", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/v1/preferences/enhanced",
        payload: validEnhancedPreference,
      });

      expect(response.statusCode).toBe(201);
      const data = JSON.parse(response.body);
      expect(data.data.strictPrefKey).toContain("lang=javascript");
      expect(data.data.strictPrefKey).toContain("domain=frontend");
    });

    it("should validate all required enhanced fields", async () => {
      const incompletePreference = { ...validEnhancedPreference };
      delete (incompletePreference as Record<string, unknown>).timezone;

      const response = await app.inject({
        method: "POST",
        url: "/api/v1/preferences/enhanced",
        payload: incompletePreference,
      });

      expect(response.statusCode).toBe(400);
    });

    it("should validate array fields in enhanced preferences", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/v1/preferences/enhanced",
        payload: {
          ...validEnhancedPreference,
          goals: "not-an-array",
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe("GET /api/v1/preferences/:id", () => {
    it("should get preference by id", async () => {
      // First create a preference
      const createResponse = await app.inject({
        method: "POST",
        url: "/api/v1/preferences",
        payload: validLegacyPreference,
      });

      const createdData = JSON.parse(createResponse.body);
      const preferenceId = createdData.data.id;

      // Then get it
      const getResponse = await app.inject({
        method: "GET",
        url: `/api/v1/preferences/${preferenceId}`,
      });

      expect(getResponse.statusCode).toBe(200);
      const data = JSON.parse(getResponse.body);
      expect(data.data.id).toBe(preferenceId);
    });

    it("should return 404 for non-existent preference", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/v1/preferences/nonexistent",
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe("PUT /api/v1/preferences/:id", () => {
    it("should update preference successfully", async () => {
      // First create a preference
      const createResponse = await app.inject({
        method: "POST",
        url: "/api/v1/preferences",
        payload: validLegacyPreference,
      });

      const createdData = JSON.parse(createResponse.body);
      const preferenceId = createdData.data.id;

      // Then update it
      const updatedPreference = {
        ...validLegacyPreference,
        domain: "backend",
      };

      const updateResponse = await app.inject({
        method: "PUT",
        url: `/api/v1/preferences/${preferenceId}`,
        payload: updatedPreference,
      });

      expect(updateResponse.statusCode).toBe(200);
      const data = JSON.parse(updateResponse.body);
      expect(data.data.domain).toBe("backend");
      expect(data.data).toHaveProperty("updatedAt");
    });

    it("should return 404 for non-existent preference", async () => {
      const response = await app.inject({
        method: "PUT",
        url: "/api/v1/preferences/nonexistent",
        payload: validLegacyPreference,
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe("DELETE /api/v1/preferences/:id", () => {
    it("should delete preference successfully", async () => {
      // First create a preference
      const createResponse = await app.inject({
        method: "POST",
        url: "/api/v1/preferences",
        payload: validLegacyPreference,
      });

      const createdData = JSON.parse(createResponse.body);
      const preferenceId = createdData.data.id;

      // Then delete it
      const deleteResponse = await app.inject({
        method: "DELETE",
        url: `/api/v1/preferences/${preferenceId}`,
      });

      expect(deleteResponse.statusCode).toBe(200);
      const data = JSON.parse(deleteResponse.body);
      expect(data.message).toContain("deleted");

      // Verify it's gone
      const getResponse = await app.inject({
        method: "GET",
        url: `/api/v1/preferences/${preferenceId}`,
      });

      expect(getResponse.statusCode).toBe(404);
    });

    it("should return 404 for non-existent preference", async () => {
      const response = await app.inject({
        method: "DELETE",
        url: "/api/v1/preferences/nonexistent",
      });

      expect(response.statusCode).toBe(404);
    });
  });
});
