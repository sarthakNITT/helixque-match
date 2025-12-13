import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { buildApp } from "../../app";
import type { FastifyInstance } from "fastify";

describe("WebSocket Routes", () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = buildApp();
    await app.ready();
  });

  afterEach(async () => {
    await app?.close();
  });

  describe("POST /api/v1/ws/docs", () => {
    it("should return websocket documentation", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/v1/ws/docs",
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data).toHaveProperty("message");
      expect(data).toHaveProperty("websocket_url");
      expect(data).toHaveProperty("client_messages");
      expect(data).toHaveProperty("server_messages");
      expect(Array.isArray(data.client_messages)).toBe(true);
      expect(Array.isArray(data.server_messages)).toBe(true);
    });

    it("should include all expected message types", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/v1/ws/docs",
      });

      const data = JSON.parse(response.body);

      // Check client message types
      expect(data.client_messages).toContain("join_strict");
      expect(data.client_messages).toContain("join_loose");
      expect(data.client_messages).toContain("cancel");
      expect(data.client_messages).toContain("signal");
      expect(data.client_messages).toContain("call_end");
      expect(data.client_messages).toContain("feedback");
      expect(data.client_messages).toContain("heartbeat");
      expect(data.client_messages).toContain("reconnect");

      // Check server message types
      expect(data.server_messages).toContain("match_found");
      expect(data.server_messages).toContain("waiting");
      expect(data.server_messages).toContain("cancelled");
      expect(data.server_messages).toContain("error");
      expect(data.server_messages).toContain("feedback_received");
      expect(data.server_messages).toContain("pong");
    });
  });

  describe("GET /api/v1/ws/examples", () => {
    it("should return websocket examples", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/v1/ws/examples",
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data).toHaveProperty("examples");
      expect(Array.isArray(data.examples)).toBe(true);
      expect(data.examples.length).toBeGreaterThan(0);
    });

    it("should include structured examples", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/v1/ws/examples",
      });

      const data = JSON.parse(response.body);
      const firstExample = data.examples[0];

      expect(firstExample).toHaveProperty("name");
      expect(firstExample).toHaveProperty("description");
      expect(firstExample).toHaveProperty("flow");
      expect(Array.isArray(firstExample.flow)).toBe(true);

      if (firstExample.flow.length > 0) {
        const flowStep = firstExample.flow[0];
        expect(flowStep).toHaveProperty("from");
        expect(flowStep).toHaveProperty("to");
        expect(flowStep).toHaveProperty("message");
      }
    });

    it("should include strict match example", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/v1/ws/examples",
      });

      const data = JSON.parse(response.body);
      const strictExample = data.examples.find((ex: Record<string, unknown>) =>
        (ex.name as string).toLowerCase().includes("strict")
      );

      expect(strictExample).toBeDefined();
      expect(strictExample.flow.length).toBeGreaterThan(0);
    });

    it("should include loose match example", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/v1/ws/examples",
      });

      const data = JSON.parse(response.body);
      const looseExample = data.examples.find((ex: Record<string, unknown>) =>
        (ex.name as string).toLowerCase().includes("loose")
      );

      expect(looseExample).toBeDefined();
      expect(looseExample.flow.length).toBeGreaterThan(0);
    });

    it("should include feedback flow example", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/v1/ws/examples",
      });

      const data = JSON.parse(response.body);
      const feedbackExample = data.examples.find(
        (ex: Record<string, unknown>) =>
          (ex.name as string).toLowerCase().includes("feedback") ||
          (ex.name as string).toLowerCase().includes("cancel")
      );

      expect(feedbackExample).toBeDefined();
      expect(feedbackExample.flow.length).toBeGreaterThan(0);
    });
  });
});
