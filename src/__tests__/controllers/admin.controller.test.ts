import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { buildApp } from "../../app";
import type { FastifyInstance } from "fastify";

describe("Admin Controller", () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = buildApp();
    await app.ready();
  });

  afterEach(async () => {
    await app?.close();
  });

  describe("POST /api/v1/admin/ban", () => {
    it("should ban user successfully", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/v1/admin/ban",
        payload: {
          userId: "user123",
          reason: "Spam behavior",
        },
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data.success).toBe(true);
      expect(data.message).toContain("banned successfully");
    });

    it("should return 400 for invalid request", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/v1/admin/ban",
        payload: {
          userId: "user123",
          // Missing reason
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it("should require both userId and reason", async () => {
      // Missing userId
      const response1 = await app.inject({
        method: "POST",
        url: "/api/v1/admin/ban",
        payload: {
          reason: "Spam",
        },
      });

      // Missing reason
      const response2 = await app.inject({
        method: "POST",
        url: "/api/v1/admin/ban",
        payload: {
          userId: "user123",
        },
      });

      expect(response1.statusCode).toBe(400);
      expect(response2.statusCode).toBe(400);
    });
  });

  describe("POST /api/v1/admin/deprioritize", () => {
    it("should deprioritize user successfully", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/v1/admin/deprioritize",
        payload: {
          userId: "user123",
          reason: "Suspected spam",
          duration: 60,
        },
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data.success).toBe(true);
      expect(data.message).toContain("deprioritized");
    });

    it("should work with just userId", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/v1/admin/deprioritize",
        payload: {
          userId: "user123",
        },
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data.success).toBe(true);
    });

    it("should use default duration when not specified", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/v1/admin/deprioritize",
        payload: {
          userId: "user123",
          reason: "Test",
        },
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data.message).toContain("60 minutes");
    });

    it("should return 400 for missing userId", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/v1/admin/deprioritize",
        payload: {
          reason: "Test",
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe("GET /api/v1/debug/queue/:key", () => {
    it("should get queue information", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/v1/debug/queue/strict_queue",
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data).toHaveProperty("queueKey");
      expect(data).toHaveProperty("length");
      expect(data).toHaveProperty("users");
      expect(data).toHaveProperty("pagination");
    });

    it("should support pagination", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/v1/debug/queue/strict_queue?page=2&limit=5",
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data.pagination.page).toBe(2);
      expect(data.pagination.limit).toBe(5);
    });

    it("should use default pagination when not specified", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/v1/debug/queue/loose_javascript",
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data.pagination.page).toBe(1);
      expect(data.pagination.limit).toBe(10);
    });

    it("should handle empty queues", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/v1/debug/queue/empty_queue",
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data.length).toBe(0);
      expect(data.users).toEqual([]);
    });
  });
});
