import { describe, it, expect } from "vitest";

// Test the verifySignature function logic
function verifySignatureLogic(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  serverKey: string
): string {
  const crypto = require("crypto");
  const payload = orderId + statusCode + grossAmount + serverKey;
  return crypto.createHash("sha512").update(payload).digest("hex");
}

describe("Midtrans Signature Verification", () => {
  it("should produce consistent signature", () => {
    const orderId = "INV-202406-001-KOS001";
    const statusCode = "200";
    const grossAmount = "500000";
    const serverKey = "SB-Mid-server-test123";

    const sig1 = verifySignatureLogic(orderId, statusCode, grossAmount, serverKey);
    const sig2 = verifySignatureLogic(orderId, statusCode, grossAmount, serverKey);

    expect(sig1).toBe(sig2);
    expect(sig1.length).toBe(128); // SHA512 hash length
  });

  it("should produce different signatures for different inputs", () => {
    const serverKey = "test-key";
    const sig1 = verifySignatureLogic("ORDER-1", "200", "500000", serverKey);
    const sig2 = verifySignatureLogic("ORDER-2", "200", "500000", serverKey);

    expect(sig1).not.toBe(sig2);
  });

  it("should produce correct SHA512 format", () => {
    const sig = verifySignatureLogic("ORDER-001", "200", "1000000", "my-key");
    expect(sig).toMatch(/^[a-f0-9]{128}$/);
  });
});
