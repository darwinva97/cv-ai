import { describe, it, expect } from "vitest";
import { classifyError, isKeyError } from "@/lib/system-keys";

describe("classifyError (failover error classification)", () => {
  it("classifies auth errors", () => {
    expect(classifyError({ statusCode: 401 })).toBe("auth");
    expect(classifyError({ status: 403 })).toBe("auth");
    expect(classifyError({ message: "Invalid API key" })).toBe("auth");
  });

  it("classifies rate-limit / quota errors", () => {
    expect(classifyError({ statusCode: 429 })).toBe("ratelimit");
    expect(classifyError({ message: "resource_exhausted: quota" })).toBe("ratelimit");
  });

  it("classifies everything else as other", () => {
    expect(classifyError({ message: "schema validation failed" })).toBe("other");
    expect(classifyError(new Error("bad prompt"))).toBe("other");
  });
});

describe("isKeyError (should this error burn the key and try the next?)", () => {
  it("burns the key on auth and rate-limit", () => {
    expect(isKeyError({ statusCode: 401 })).toBe(true);
    expect(isKeyError({ statusCode: 429 })).toBe(true);
  });

  it("burns the key on transient upstream unavailability", () => {
    expect(isKeyError({ message: "503 model overloaded" })).toBe(true);
  });

  it("does NOT burn the key on prompt/schema errors", () => {
    expect(isKeyError({ message: "schema validation failed" })).toBe(false);
    expect(isKeyError(new Error("invalid prompt"))).toBe(false);
  });
});
