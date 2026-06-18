import { describe, it, expect } from "vitest";
import { encryptSecret, decryptSecret, maskSecret, safeEqual } from "@/lib/crypto";

describe("crypto (AES-256-GCM secrets at rest)", () => {
  it("round-trips plaintext", () => {
    const plain = "AIzaSyA-secret-key-value";
    const blob = encryptSecret(plain);
    expect(blob).not.toContain(plain); // ciphertext doesn't leak plaintext
    expect(blob.split(":")).toHaveLength(3); // iv:tag:ciphertext
    expect(decryptSecret(blob)).toBe(plain);
  });

  it("uses a random IV (distinct ciphertext for same input)", () => {
    const a = encryptSecret("same");
    const b = encryptSecret("same");
    expect(a).not.toBe(b);
    expect(decryptSecret(a)).toBe("same");
    expect(decryptSecret(b)).toBe("same");
  });

  it("detects tampering (GCM auth tag)", () => {
    const blob = encryptSecret("tamper-me");
    const [iv, tag, ct] = blob.split(":");
    // Flip a byte in the ciphertext.
    const buf = Buffer.from(ct, "base64");
    buf[0] = buf[0] ^ 0xff;
    const tampered = [iv, tag, buf.toString("base64")].join(":");
    expect(() => decryptSecret(tampered)).toThrow();
  });

  it("rejects malformed ciphertext", () => {
    expect(() => decryptSecret("not-a-valid-blob")).toThrow("Invalid ciphertext format");
  });

  it("maskSecret never reveals the full value", () => {
    const masked = maskSecret("AIzaSyAbCdEfGhIjKlMnOp");
    expect(masked).not.toContain("CdEfGhIjKlMn");
    expect(masked.startsWith("AIza")).toBe(true);
    expect(maskSecret("short")).toBe("••••");
  });

  it("safeEqual compares constant-time", () => {
    expect(safeEqual("abc", "abc")).toBe(true);
    expect(safeEqual("abc", "abd")).toBe(false);
    expect(safeEqual("abc", "abcd")).toBe(false);
  });
});
