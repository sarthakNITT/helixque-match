import { describe, it, expect } from "vitest";
import {
  InternalJoinRequestSchema,
  InternalJoinResponseSchema,
  InternalCancelRequestSchema,
  InternalFeedbackRequestSchema,
  BanUserRequestSchema,
  DeprioritizeUserRequestSchema,
  HealthCheckResponseSchema,
  MetricsResponseSchema,
} from "../../schemas/api.schema";

describe("API Schema", () => {
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

  describe("Internal API Schemas", () => {
    describe("InternalJoinRequestSchema", () => {
      it("should validate join request", () => {
        const request = {
          userId: "user123",
          mode: "strict" as const,
          preferences: mockPreferences,
          requestId: "550e8400-e29b-41d4-a716-446655440000",
        };

        const result = InternalJoinRequestSchema.parse(request);
        expect(result.userId).toBe("user123");
        expect(result.mode).toBe("strict");
      });

      it("should work without requestId", () => {
        const request = {
          userId: "user123",
          mode: "loose" as const,
          preferences: mockPreferences,
        };

        const result = InternalJoinRequestSchema.parse(request);
        expect(result.requestId).toBeUndefined();
      });

      it("should reject invalid mode", () => {
        const request = {
          userId: "user123",
          mode: "invalid",
          preferences: mockPreferences,
        };

        expect(() => InternalJoinRequestSchema.parse(request)).toThrow();
      });
    });

    describe("InternalJoinResponseSchema", () => {
      it("should validate waiting response", () => {
        const response = {
          status: "waiting" as const,
        };

        const result = InternalJoinResponseSchema.parse(response);
        expect(result.status).toBe("waiting");
      });

      it("should validate matched response", () => {
        const response = {
          status: "matched" as const,
          matchId: "match123",
          peerId: "user456",
          prefKey: "lang=javascript|domain=frontend",
        };

        const result = InternalJoinResponseSchema.parse(response);
        expect(result.status).toBe("matched");
        expect(result.matchId).toBe("match123");
      });
    });

    describe("InternalCancelRequestSchema", () => {
      it("should validate cancel request", () => {
        const request = {
          userId: "user123",
          mode: "strict" as const,
        };

        const result = InternalCancelRequestSchema.parse(request);
        expect(result.userId).toBe("user123");
        expect(result.mode).toBe("strict");
      });

      it("should work without mode", () => {
        const request = {
          userId: "user123",
        };

        const result = InternalCancelRequestSchema.parse(request);
        expect(result.mode).toBeUndefined();
      });
    });

    describe("InternalFeedbackRequestSchema", () => {
      it("should validate feedback request", () => {
        const request = {
          matchId: "match123",
          fromUserId: "user1",
          toUserId: "user2",
          rating: 5,
          tags: ["great", "helpful"],
        };

        const result = InternalFeedbackRequestSchema.parse(request);
        expect(result.rating).toBe(5);
        expect(result.tags).toEqual(["great", "helpful"]);
      });

      it("should work without tags", () => {
        const request = {
          matchId: "match123",
          fromUserId: "user1",
          toUserId: "user2",
          rating: 4,
        };

        const result = InternalFeedbackRequestSchema.parse(request);
        expect(result.tags).toBeUndefined();
      });

      it("should validate rating range", () => {
        const request = {
          matchId: "match123",
          fromUserId: "user1",
          toUserId: "user2",
          rating: 0,
        };

        expect(() => InternalFeedbackRequestSchema.parse(request)).toThrow();
      });
    });
  });

  describe("Admin API Schemas", () => {
    describe("BanUserRequestSchema", () => {
      it("should validate ban request", () => {
        const request = {
          userId: "user123",
          reason: "Spam behavior",
        };

        const result = BanUserRequestSchema.parse(request);
        expect(result.userId).toBe("user123");
        expect(result.reason).toBe("Spam behavior");
      });

      it("should require both fields", () => {
        expect(() =>
          BanUserRequestSchema.parse({ userId: "user123" })
        ).toThrow();
        expect(() => BanUserRequestSchema.parse({ reason: "Spam" })).toThrow();
      });
    });

    describe("DeprioritizeUserRequestSchema", () => {
      it("should validate deprioritize request", () => {
        const request = {
          userId: "user123",
          reason: "Suspected spam",
          duration: 60,
        };

        const result = DeprioritizeUserRequestSchema.parse(request);
        expect(result.userId).toBe("user123");
        expect(result.duration).toBe(60);
      });

      it("should work with just userId", () => {
        const request = {
          userId: "user123",
        };

        const result = DeprioritizeUserRequestSchema.parse(request);
        expect(result.reason).toBeUndefined();
        expect(result.duration).toBeUndefined();
      });
    });
  });

  describe("System API Schemas", () => {
    describe("HealthCheckResponseSchema", () => {
      it("should validate health check response", () => {
        const response = {
          status: "healthy" as const,
          timestamp: new Date(),
          services: {
            redis: true,
            postgres: true,
          },
          uptime: 123456,
        };

        const result = HealthCheckResponseSchema.parse(response);
        expect(result.status).toBe("healthy");
        expect(result.services.redis).toBe(true);
      });
    });

    describe("MetricsResponseSchema", () => {
      it("should validate metrics response", () => {
        const response = {
          queues: {
            strict_total: 10,
            loose_total: 25,
            by_language: {
              javascript: 15,
              python: 8,
              java: 12,
            },
          },
          matches: {
            total_active: 5,
            completed_today: 42,
            average_wait_time: 15.5,
          },
          system: {
            memory_usage: 128.5,
            cpu_usage: 35.2,
            connections: 150,
          },
        };

        const result = MetricsResponseSchema.parse(response);
        expect(result.queues.strict_total).toBe(10);
        expect(result.matches.total_active).toBe(5);
        expect(result.system.memory_usage).toBe(128.5);
      });
    });
  });
});
