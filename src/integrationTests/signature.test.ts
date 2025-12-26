import { describe, it, expect } from "vitest";
import { BuildSignature } from "../utils/buildSignature";

describe("BuildSignature", () => {
  it("should generate correct signature string", () => {
    const prefs = {
      language: "javascript",
      domain: "Frontend",
      techStack: ["React", "Node"],
      experience: "1-3",
      country: "IN",
    };

    const signature = BuildSignature(prefs);
    expect(signature).toBe(
      "country=in|domain=frontend|experience=1-3|language=javascript|techstack=node,react"
    );
  });
});
