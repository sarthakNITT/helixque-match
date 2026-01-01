import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { buildApp } from "../../app";
import type { FastifyInstance } from "fastify";

vi.mock("../../clients/redis", () => {
  return {
    getUserState: vi.fn(),
    saveUserState: vi.fn(),
    addToStrictQueue: vi.fn(),
    atomicPopFromStrictQueue: vi.fn(),
    removeFromStrictQueue: vi.fn(),
    addToLooseIndex: vi.fn(),
    fetchTopNFromIndex: vi.fn(),
    removeUserFromAllLooseIndexes: vi.fn(),
    addToWaitingSet: vi.fn(),
    removeFromWaitingSet: vi.fn(),
    acquireLock: vi.fn().mockResolvedValue(true),
    releaseLock: vi.fn().mockResolvedValue(true),
    getQualityScore: vi.fn().mockResolvedValue(100),
    default: {
      on: vi.fn(),
      get: vi.fn(),
      set: vi.fn(),
      del: vi.fn(),
      zadd: vi.fn(),
      zrem: vi.fn(),
      zrevrange: vi.fn(),
      sadd: vi.fn(),
      srem: vi.fn(),
    },
  };
});

import * as redis from "../../clients/redis";

describe("Match Controller", () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    vi.clearAllMocks();

    (redis.getUserState as any).mockResolvedValue(null);
    (redis.saveUserState as any).mockResolvedValue(undefined);
    (redis.atomicPopFromStrictQueue as any).mockResolvedValue(null);
    (redis.addToStrictQueue as any).mockResolvedValue(undefined);
    (redis.addToWaitingSet as any).mockResolvedValue(undefined);
    (redis.fetchTopNFromIndex as any).mockResolvedValue([]);

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
          prefs: mockPreferences,
          requestId: "550e8400-e29b-41d4-a716-446655440000",
        },
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data.status).toMatch(/waiting|matched|queued/);
    });

    it("should handle join loose request successfully", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/v1/match/join",
        payload: {
          userId: "user456",
          mode: "loose",
          prefs: mockPreferences,
        },
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data.status).toMatch(/waiting|matched|queued/);
    });

    it("should return 400 for invalid request", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/v1/match/join",
        payload: {
          userId: "user123",
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it("should handle idempotency with requestId", async () => {
      const requestId = "550e8400-e29b-41d4-a716-446655440000";

      const response1 = await app.inject({
        method: "POST",
        url: "/api/v1/match/join",
        payload: {
          userId: "user123",
          mode: "strict",
          prefs: mockPreferences,
          requestId,
        },
      });

      const response2 = await app.inject({
        method: "POST",
        url: "/api/v1/match/join",
        payload: {
          userId: "user123",
          mode: "strict",
          prefs: mockPreferences,
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
        url: "/api/v1/match/leave",
        payload: {
          userId: "user123",
          mode: "strict",
        },
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data.status).toBe("ok");
    });

    it("should work without specifying mode", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/v1/match/leave",
        payload: {
          userId: "user123",
        },
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data.status).toBe("ok");
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
          rating: 0,
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe("POST /api/v1/match/mark_end", () => {
    it("should mark match as ended successfully", async () => {
      (redis.getUserState as any).mockResolvedValue({
        sessionId: "match123",
        prefs: {},
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
      (redis.getUserState as any).mockResolvedValue(null);

      const response = await app.inject({
        method: "POST",
        url: "/api/v1/match/mark_end",
        payload: {
          matchId: "nonexistent",
          userId: "user1",
          reason: "test",
        },
      });

      expect(response.statusCode).toBe(404);
    });
  });
});
