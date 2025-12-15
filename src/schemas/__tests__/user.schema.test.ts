import { describe, it, expect } from "vitest";
import {
  UserStatus,
  MatchMode,
  UserPreferencesSchema,
  MatchSchema,
  FeedbackSchema,
} from "../user.schema";

describe("User Schema", () => {
  describe("UserStatus enum", () => {
    it("should validate valid user status values", () => {
      const validStatuses = [
        "OFFLINE",
        "ONLINE",
        "WAITING_STRICT",
        "WAITING_LOOSE",
        "IN_CALL",
      ];

      validStatuses.forEach((status) => {
        expect(UserStatus.parse(status)).toBe(status);
      });
    });

    it("should reject invalid user status values", () => {
      expect(() => UserStatus.parse("INVALID_STATUS")).toThrow();
    });
  });

  describe("MatchMode enum", () => {
    it("should validate valid match modes", () => {
      expect(MatchMode.parse("STRICT")).toBe("STRICT");
      expect(MatchMode.parse("LOOSE")).toBe("LOOSE");
    });

    it("should reject invalid match modes", () => {
      expect(() => MatchMode.parse("INVALID_MODE")).toThrow();
    });
  });

  describe("UserPreferencesSchema", () => {
    const validPreferences = {
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

    it("should validate complete user preferences", () => {
      const result = UserPreferencesSchema.parse(validPreferences);
      expect(result).toEqual(validPreferences);
    });

    it("should require all preference fields", () => {
      const incompletePreferences = { ...validPreferences };
      delete (incompletePreferences as Record<string, unknown>).language;

      expect(() =>
        UserPreferencesSchema.parse(incompletePreferences)
      ).toThrow();
    });

    it("should validate techStack as array", () => {
      expect(() =>
        UserPreferencesSchema.parse({
          ...validPreferences,
          techStack: "not-an-array",
        })
      ).toThrow();
    });

    it("should validate goals as array", () => {
      expect(() =>
        UserPreferencesSchema.parse({
          ...validPreferences,
          goals: "not-an-array",
        })
      ).toThrow();
    });
  });

  describe("MatchSchema", () => {
    const validMatch = {
      id: "match-123",
      createdAt: new Date(),
      mode: "STRICT" as const,
      userAId: "user-1",
      userBId: "user-2",
      prefKey: "lang=javascript|domain=frontend",
      ratingA: 5,
      ratingB: 4,
      tagsA: ["great", "helpful"],
      tagsB: ["knowledgeable"],
    };

    it("should validate complete match object", () => {
      const result = MatchSchema.parse(validMatch);
      expect(result.id).toBe(validMatch.id);
      expect(result.mode).toBe(validMatch.mode);
    });

    it("should validate rating range", () => {
      expect(() =>
        MatchSchema.parse({
          ...validMatch,
          ratingA: 0,
        })
      ).toThrow();

      expect(() =>
        MatchSchema.parse({
          ...validMatch,
          ratingB: 6,
        })
      ).toThrow();
    });

    it("should allow optional fields to be undefined", () => {
      const minimalMatch = {
        id: "match-123",
        createdAt: new Date(),
        mode: "LOOSE" as const,
        userAId: "user-1",
        userBId: "user-2",
      };

      const result = MatchSchema.parse(minimalMatch);
      expect(result.id).toBe(minimalMatch.id);
    });
  });

  describe("FeedbackSchema", () => {
    const validFeedback = {
      id: "feedback-123",
      matchId: "match-456",
      fromUserId: "user-1",
      toUserId: "user-2",
      rating: 5,
      tags: ["great", "helpful"],
      createdAt: new Date(),
    };

    it("should validate complete feedback object", () => {
      const result = FeedbackSchema.parse(validFeedback);
      expect(result.id).toBe(validFeedback.id);
      expect(result.rating).toBe(validFeedback.rating);
    });

    it("should validate rating range", () => {
      expect(() =>
        FeedbackSchema.parse({
          ...validFeedback,
          rating: 0,
        })
      ).toThrow();

      expect(() =>
        FeedbackSchema.parse({
          ...validFeedback,
          rating: 6,
        })
      ).toThrow();
    });

    it("should allow tags to be optional", () => {
      const feedbackWithoutTags = { ...validFeedback };
      delete (feedbackWithoutTags as Record<string, unknown>).tags;

      const result = FeedbackSchema.parse(feedbackWithoutTags);
      expect(result.id).toBe(feedbackWithoutTags.id);
    });
  });
});
