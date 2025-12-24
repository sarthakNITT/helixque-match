import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { buildApp } from "../../app";
import type { FastifyInstance } from "fastify";

describe("Match Controller", () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = buildApp();
    await app.ready();
  });

  afterEach(async () => {
    await app?.close();
  });

  const mockPreferences = {
    language: "javascript",
    techStack: ["react", "node"],
    domain: "frontend",
    region: "us-west",
    experience: "2-5",
    availability: "evenings",
    timezone: "PST",
    projectType: "web-app",
    communicationStyle: "collaborative",
    goals: ["learning"],
  };

  describe("POST /api/v1/match/join", () => {
    it("should handle join strict request successfully", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/v1/match/join",
        payload: {
          userId: "user123",
          mode: "strict",
          preferences: mockPreferences,
          requestId: "550e8400-e29b-41d4-a716-446655440000",
        },
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data.status).toMatch(/waiting|matched/);
    });

    it("should handle join loose request successfully", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/v1/match/join",
        payload: {
          userId: "user456",
          mode: "loose",
          preferences: mockPreferences,
        },
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data.status).toMatch(/waiting|matched/);
    });

    it("should return 400 for invalid request", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/v1/match/join",
        payload: {
          userId: "user123",
          // Missing required fields
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it("should handle idempotency with requestId", async () => {
      const requestId = "550e8400-e29b-41d4-a716-446655440000";

      // First request
      const response1 = await app.inject({
        method: "POST",
        url: "/api/v1/match/join",
        payload: {
          userId: "user123",
          mode: "strict",
          preferences: mockPreferences,
          requestId,
        },
      });

      // Second request with same requestId
      const response2 = await app.inject({
        method: "POST",
        url: "/api/v1/match/join",
        payload: {
          userId: "user123",
          mode: "strict",
          preferences: mockPreferences,
          requestId,
        },
      });

      expect(response1.statusCode).toBe(200);
      expect(response2.statusCode).toBe(200);
      expect(response1.body).toBe(response2.body);
    });
  });

  describe("POST /api/v1/match/cancel", () => {
    it("should cancel match request successfully", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/v1/match/cancel",
        payload: {
          userId: "user123",
          mode: "strict",
        },
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data.status).toBe("cancelled");
    });

    it("should work without specifying mode", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/v1/match/cancel",
        payload: {
          userId: "user123",
        },
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data.status).toBe("cancelled");
    });
  });

  describe("POST /api/v1/match/feedback", () => {
    it("should submit feedback successfully", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/v1/match/feedback",
        payload: {
          matchId: "match123",
          fromUserId: "user1",
          toUserId: "user2",
          rating: 5,
          tags: ["great", "helpful"],
        },
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data.success).toBe(true);
      expect(data.message).toBe("Feedback submitted successfully");
    });

    it("should work without tags", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/v1/match/feedback",
        payload: {
          matchId: "match123",
          fromUserId: "user1",
          toUserId: "user2",
          rating: 4,
        },
      });

      expect(response.statusCode).toBe(200);
    });

    it("should validate rating range", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/v1/match/feedback",
        payload: {
          matchId: "match123",
          fromUserId: "user1",
          toUserId: "user2",
          rating: 0, // Invalid rating
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe("POST /api/v1/match/mark_end", () => {
    it("should mark match as ended successfully", async () => {
      // First create a match by joining
      await app.inject({
        method: "POST",
        url: "/api/v1/match/join",
        payload: {
          userId: "user1",
          mode: "strict",
          preferences: mockPreferences,
        },
      });

      await app.inject({
        method: "POST",
        url: "/api/v1/match/join",
        payload: {
          userId: "user2",
          mode: "strict",
          preferences: mockPreferences,
        },
      });

      const response = await app.inject({
        method: "POST",
        url: "/api/v1/match/mark_end",
        payload: {
          matchId: "match123",
          userId: "user1",
          reason: "call completed",
        },
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data.success).toBe(true);
    });

    it("should return 404 for non-existent match", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/v1/match/mark_end",
        payload: {
          matchId: "nonexistent",
          userId: "user1",
        },
      });

      expect(response.statusCode).toBe(404);
    });
  });
});
