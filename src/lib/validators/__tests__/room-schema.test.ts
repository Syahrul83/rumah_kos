import { describe, it, expect } from "vitest";
import { roomSchema } from "@/lib/validators/room-schema";

describe("Room Validator", () => {
  it("should accept valid room data", () => {
    const result = roomSchema.safeParse({
      name: "A-01",
      floor: 1,
      price: 500000,
      description: "Kamar nyaman",
      status: "tersedia",
    });
    expect(result.success).toBe(true);
  });

  it("should reject name shorter than 3 chars", () => {
    const result = roomSchema.safeParse({
      name: "AB",
      floor: 1,
      price: 500000,
      status: "tersedia",
    });
    expect(result.success).toBe(false);
  });

  it("should reject price below 100000", () => {
    const result = roomSchema.safeParse({
      name: "A-01",
      floor: 1,
      price: 50000,
      status: "tersedia",
    });
    expect(result.success).toBe(false);
  });

  it("should reject invalid floor", () => {
    const result = roomSchema.safeParse({
      name: "A-01",
      floor: 0,
      price: 500000,
      status: "tersedia",
    });
    expect(result.success).toBe(false);
  });

  it("should reject invalid status", () => {
    const result = roomSchema.safeParse({
      name: "A-01",
      floor: 1,
      price: 500000,
      status: "invalid",
    });
    expect(result.success).toBe(false);
  });
});
