import { describe, it, expect } from "vitest";
import { priceOf, estimateCost } from "@/lib/credits";

const pricing = { baseCredits: 5, inputCreditsPer1k: 2, outputCreditsPer1k: 8 };

describe("priceOf (exact credit cost from usage; integers, ceil per 1k)", () => {
  it("charges base only for zero tokens", () => {
    expect(priceOf(pricing, { inputTokens: 0, outputTokens: 0, totalTokens: 0 })).toBe(5);
  });

  it("rounds each bucket up per 1k", () => {
    // 320 in -> ceil(0.32)=1 *2 ; 1532 out -> ceil(1.532)=2 *8 => 5 + 2 + 16 = 23
    expect(priceOf(pricing, { inputTokens: 320, outputTokens: 1532, totalTokens: 0 })).toBe(23);
  });

  it("treats 1000 as one unit and 1001 as two (ceil)", () => {
    expect(priceOf(pricing, { inputTokens: 1000, outputTokens: 0, totalTokens: 0 })).toBe(7);
    expect(priceOf(pricing, { inputTokens: 1001, outputTokens: 0, totalTokens: 0 })).toBe(9);
  });

  it("always returns an integer", () => {
    const c = priceOf(pricing, { inputTokens: 1234, outputTokens: 5678, totalTokens: 0 });
    expect(Number.isInteger(c)).toBe(true);
  });
});

describe("estimateCost (conservative pre-call estimate)", () => {
  it("includes a safety margin above the typical real cost", () => {
    // ~1200 prompt chars ≈ 300 input tokens
    const est = estimateCost(pricing, 1200);
    const typicalActual = priceOf(pricing, { inputTokens: 300, outputTokens: 1532, totalTokens: 0 });
    expect(est).toBeGreaterThanOrEqual(typicalActual);
    expect(Number.isInteger(est)).toBe(true);
  });

  it("is non-decreasing and grows once a 1k-token boundary is crossed", () => {
    // estimateCost is a step function (ceil per 1k input tokens), so small
    // bumps can be equal; a large jump must cost strictly more.
    expect(estimateCost(pricing, 4000)).toBeGreaterThanOrEqual(estimateCost(pricing, 400));
    expect(estimateCost(pricing, 20000)).toBeGreaterThan(estimateCost(pricing, 400));
  });
});
