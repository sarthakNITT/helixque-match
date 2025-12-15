import { describe, it, expect } from "vitest";
import {
  ClientWSMessageSchema,
  ServerWSMessageSchema,
  JoinStrictMessageSchema,
  CancelMessageSchema,
  SignalMessageSchema,
  FeedbackMessageSchema,
  HeartbeatMessageSchema,
  MatchFoundMessageSchema,
  WaitingMessageSchema,
  ErrorMessageSchema,
  PongMessageSchema,
} from "../websocket.schema";

describe("WebSocket Schema", () => {
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

  describe("Client -> Server Messages", () => {
    describe("JoinStrictMessageSchema", () => {
      it("should validate join strict message", () => {
        const message = {
          type: "join_strict",
          requestId: "550e8400-e29b-41d4-a716-446655440000",
          payload: {
            userId: "user123",
            preferences: mockPreferences,
          },
        };

        const result = JoinStrictMessageSchema.parse(message);
        expect(result.type).toBe("join_strict");
        expect(result.payload.userId).toBe("user123");
      });

      it("should reject message with wrong type", () => {
        const message = {
          type: "join_loose",
          payload: {
            userId: "user123",
            preferences: mockPreferences,
          },
        };

        expect(() => JoinStrictMessageSchema.parse(message)).toThrow();
      });

      it("should work without requestId", () => {
        const message = {
          type: "join_strict",
          payload: {
            userId: "user123",
            preferences: mockPreferences,
          },
        };

        const result = JoinStrictMessageSchema.parse(message);
        expect(result.requestId).toBeUndefined();
      });
    });

    describe("CancelMessageSchema", () => {
      it("should validate cancel message", () => {
        const message = {
          type: "cancel",
          payload: {
            userId: "user123",
            mode: "strict",
          },
        };

        const result = CancelMessageSchema.parse(message);
        expect(result.type).toBe("cancel");
        expect(result.payload.mode).toBe("strict");
      });

      it("should work without mode", () => {
        const message = {
          type: "cancel",
          payload: {
            userId: "user123",
          },
        };

        const result = CancelMessageSchema.parse(message);
        expect(result.payload.mode).toBeUndefined();
      });

      it("should reject invalid mode", () => {
        const message = {
          type: "cancel",
          payload: {
            userId: "user123",
            mode: "invalid",
          },
        };

        expect(() => CancelMessageSchema.parse(message)).toThrow();
      });
    });

    describe("SignalMessageSchema", () => {
      it("should validate signal message", () => {
        const message = {
          type: "signal",
          payload: {
            matchId: "match123",
            to: "user456",
            signal: { type: "offer", sdp: "mock-sdp" },
          },
        };

        const result = SignalMessageSchema.parse(message);
        expect(result.type).toBe("signal");
        expect(result.payload.matchId).toBe("match123");
      });
    });

    describe("FeedbackMessageSchema", () => {
      it("should validate feedback message", () => {
        const message = {
          type: "feedback",
          payload: {
            matchId: "match123",
            fromUserId: "user1",
            toUserId: "user2",
            rating: 5,
            tags: ["great", "helpful"],
          },
        };

        const result = FeedbackMessageSchema.parse(message);
        expect(result.payload.rating).toBe(5);
        expect(result.payload.tags).toEqual(["great", "helpful"]);
      });

      it("should validate rating range", () => {
        const message = {
          type: "feedback",
          payload: {
            matchId: "match123",
            fromUserId: "user1",
            toUserId: "user2",
            rating: 0,
          },
        };

        expect(() => FeedbackMessageSchema.parse(message)).toThrow();
      });
    });

    describe("HeartbeatMessageSchema", () => {
      it("should validate heartbeat message", () => {
        const message = {
          type: "heartbeat",
          payload: {
            userId: "user123",
          },
        };

        const result = HeartbeatMessageSchema.parse(message);
        expect(result.type).toBe("heartbeat");
      });
    });
  });

  describe("Server -> Client Messages", () => {
    describe("MatchFoundMessageSchema", () => {
      it("should validate match found message", () => {
        const message = {
          type: "match_found",
          requestId: "550e8400-e29b-41d4-a716-446655440000",
          payload: {
            matchId: "match123",
            peerId: "user456",
            mode: "STRICT",
            roomMeta: { created: "2024-12-04T10:00:00Z" },
          },
        };

        const result = MatchFoundMessageSchema.parse(message);
        expect(result.payload.matchId).toBe("match123");
        expect(result.payload.mode).toBe("STRICT");
      });

      it("should work without roomMeta", () => {
        const message = {
          type: "match_found",
          payload: {
            matchId: "match123",
            peerId: "user456",
            mode: "LOOSE",
          },
        };

        const result = MatchFoundMessageSchema.parse(message);
        expect(result.payload.roomMeta).toBeUndefined();
      });
    });

    describe("WaitingMessageSchema", () => {
      it("should validate waiting message", () => {
        const message = {
          type: "waiting",
          payload: {
            message: "Added to queue",
            position: 3,
          },
        };

        const result = WaitingMessageSchema.parse(message);
        expect(result.payload.position).toBe(3);
      });
    });

    describe("ErrorMessageSchema", () => {
      it("should validate error message", () => {
        const message = {
          type: "error",
          payload: {
            code: 400,
            message: "Invalid request",
            details: "Missing required field",
          },
        };

        const result = ErrorMessageSchema.parse(message);
        expect(result.payload.code).toBe(400);
        expect(result.payload.details).toBe("Missing required field");
      });
    });

    describe("PongMessageSchema", () => {
      it("should validate pong message", () => {
        const message = {
          type: "pong",
          payload: {
            timestamp: Date.now(),
          },
        };

        const result = PongMessageSchema.parse(message);
        expect(typeof result.payload.timestamp).toBe("number");
      });
    });
  });

  describe("Union Schemas", () => {
    describe("ClientWSMessageSchema", () => {
      it("should validate all client message types", () => {
        const messages = [
          {
            type: "join_strict",
            payload: { userId: "user123", preferences: mockPreferences },
          },
          {
            type: "cancel",
            payload: { userId: "user123" },
          },
          {
            type: "heartbeat",
            payload: { userId: "user123" },
          },
        ];

        messages.forEach((message) => {
          expect(() => ClientWSMessageSchema.parse(message)).not.toThrow();
        });
      });

      it("should reject invalid message types", () => {
        const invalidMessage = {
          type: "invalid_type",
          payload: { userId: "user123" },
        };

        expect(() => ClientWSMessageSchema.parse(invalidMessage)).toThrow();
      });
    });

    describe("ServerWSMessageSchema", () => {
      it("should validate all server message types", () => {
        const messages = [
          {
            type: "match_found",
            payload: { matchId: "match123", peerId: "user456", mode: "STRICT" },
          },
          {
            type: "waiting",
            payload: { message: "Waiting for match" },
          },
          {
            type: "error",
            payload: { code: 400, message: "Bad request" },
          },
        ];

        messages.forEach((message) => {
          expect(() => ServerWSMessageSchema.parse(message)).not.toThrow();
        });
      });
    });
  });
});
