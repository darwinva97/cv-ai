/**
 * Unit test for the pure credit pricing math (no DB).
 * Mirrors priceOf/estimateCost in src/lib/credits.ts.
 * Run: node --experimental-strip-types scripts/test-pricing.ts
 */
import assert from "node:assert";

interface Pricing {
  baseCredits: number;
  inputCreditsPer1k: number;
  outputCreditsPer1k: number;
}
interface Usage {
  inputTokens: number;
  outputTokens: number;
}

function priceOf(p: Pricing, u: Usage): number {
  return (
    p.baseCredits +
    Math.ceil(u.inputTokens / 1000) * p.inputCreditsPer1k +
    Math.ceil(u.outputTokens / 1000) * p.outputCreditsPer1k
  );
}
function estimateCost(p: Pricing, promptChars: number): number {
  const estInput = Math.ceil(promptChars / 4);
  const raw = priceOf(p, { inputTokens: estInput, outputTokens: 1600 });
  return Math.ceil(raw * 1.2) + 1;
}

const pricing: Pricing = { baseCredits: 5, inputCreditsPer1k: 2, outputCreditsPer1k: 8 };

// base only (0 tokens)
assert.strictEqual(priceOf(pricing, { inputTokens: 0, outputTokens: 0 }), 5);
// 320 input -> ceil(0.32)=1 *2; 1532 output -> ceil(1.532)=2 *8  => 5 + 2 + 16 = 23
assert.strictEqual(priceOf(pricing, { inputTokens: 320, outputTokens: 1532 }), 23);
// exactly 1000 -> 1 unit, 1001 -> 2 units (ceil per 1k)
assert.strictEqual(priceOf(pricing, { inputTokens: 1000, outputTokens: 0 }), 7);
assert.strictEqual(priceOf(pricing, { inputTokens: 1001, outputTokens: 0 }), 9);
console.log("✓ priceOf OK");

// estimate is an integer >= a typical actual cost, with margin
const est = estimateCost(pricing, 1200); // ~300 input tokens
const actual = priceOf(pricing, { inputTokens: 300, outputTokens: 1400 });
assert(Number.isInteger(est), "estimate is integer");
assert(est >= actual, `estimate (${est}) should cover a typical actual (${actual})`);
console.log(`✓ estimate OK (est=${est} >= typical actual=${actual})`);

// integer-only guarantee
for (const u of [
  { inputTokens: 1, outputTokens: 1 },
  { inputTokens: 999, outputTokens: 9999 },
  { inputTokens: 12345, outputTokens: 67890 },
]) {
  assert(Number.isInteger(priceOf(pricing, u)), "priceOf must be integer");
}
console.log("✓ integer-only OK");

console.log("\n✓ all pricing tests passed");
