import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { buildApp } from "../../app";
import type { FastifyInstance } from "fastify";

describe("System Controller", () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = buildApp();
    await app.ready();
  });

  afterEach(async () => {
    await app?.close();
  });

  describe("GET /healthz", () => {
    it("should return healthy status", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/healthz",
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data.status).toBe("healthy");
      expect(data).toHaveProperty("timestamp");
      expect(data).toHaveProperty("services");
      expect(data).toHaveProperty("uptime");
    });

    it("should include service status", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/healthz",
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data.services).toHaveProperty("redis");
      expect(data.services).toHaveProperty("postgres");
      expect(typeof data.services.redis).toBe("boolean");
      expect(typeof data.services.postgres).toBe("boolean");
    });

    it("should include uptime", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/healthz",
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(typeof data.uptime).toBe("number");
      expect(data.uptime).toBeGreaterThanOrEqual(0);
    });
  });

  describe("GET /metrics", () => {
    it("should return metrics data", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/metrics",
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data).toHaveProperty("queues");
      expect(data).toHaveProperty("matches");
      expect(data).toHaveProperty("system");
    });

    it("should include queue metrics", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/metrics",
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);

      expect(data.queues).toHaveProperty("strict_total");
      expect(data.queues).toHaveProperty("loose_total");
      expect(data.queues).toHaveProperty("by_language");

      expect(typeof data.queues.strict_total).toBe("number");
      expect(typeof data.queues.loose_total).toBe("number");
      expect(typeof data.queues.by_language).toBe("object");
    });

    it("should include match metrics", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/metrics",
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);

      expect(data.matches).toHaveProperty("total_active");
      expect(data.matches).toHaveProperty("completed_today");
      expect(data.matches).toHaveProperty("average_wait_time");

      expect(typeof data.matches.total_active).toBe("number");
      expect(typeof data.matches.completed_today).toBe("number");
      expect(typeof data.matches.average_wait_time).toBe("number");
    });

    it("should include system metrics", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/metrics",
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);

      expect(data.system).toHaveProperty("memory_usage");
      expect(data.system).toHaveProperty("cpu_usage");
      expect(data.system).toHaveProperty("connections");

      expect(typeof data.system.memory_usage).toBe("number");
      expect(typeof data.system.cpu_usage).toBe("number");
      expect(typeof data.system.connections).toBe("number");
    });

    it("should have reasonable metric values", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/metrics",
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);

      // Queue counts should be non-negative
      expect(data.queues.strict_total).toBeGreaterThanOrEqual(0);
      expect(data.queues.loose_total).toBeGreaterThanOrEqual(0);

      // Match counts should be non-negative
      expect(data.matches.total_active).toBeGreaterThanOrEqual(0);
      expect(data.matches.completed_today).toBeGreaterThanOrEqual(0);
      expect(data.matches.average_wait_time).toBeGreaterThanOrEqual(0);

      // System metrics should be positive
      expect(data.system.memory_usage).toBeGreaterThan(0);
      expect(data.system.cpu_usage).toBeGreaterThanOrEqual(0);
      expect(data.system.cpu_usage).toBeLessThanOrEqual(100);
      expect(data.system.connections).toBeGreaterThanOrEqual(0);
    });
  });
});
