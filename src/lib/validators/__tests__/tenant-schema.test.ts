import { describe, it, expect } from "vitest";
import {
  tenantSchema,
  tenantWithAccountSchema,
} from "@/lib/validators/tenant-schema";

describe("Tenant Schema (Without Account)", () => {
  it("accepts valid tenant data", () => {
    const r = tenantSchema.safeParse({
      full_name: "Andi Pratama",
      phone: "081234567890",
      identity_number: "3271011234567890",
      emergency_contact: "081298765432",
      address: "Jl. Merdeka No. 123",
    });
    expect(r.success).toBe(true);
  });

  it("accepts minimal valid data", () => {
    const r = tenantSchema.safeParse({
      full_name: "Budi",
      phone: "081234567890",
    });
    expect(r.success).toBe(true);
  });

  it("rejects name < 3 chars", () => {
    const r = tenantSchema.safeParse({
      full_name: "AB",
      phone: "081234567890",
    });
    expect(r.success).toBe(false);
  });

  it("rejects invalid phone format (letters)", () => {
    const r = tenantSchema.safeParse({
      full_name: "Andi",
      phone: "abcdef",
    });
    expect(r.success).toBe(false);
  });

  it("rejects invalid phone format (too short)", () => {
    const r = tenantSchema.safeParse({
      full_name: "Andi",
      phone: "0812",
    });
    expect(r.success).toBe(false);
  });

  it("accepts phone with +62 prefix", () => {
    const r = tenantSchema.safeParse({
      full_name: "Andi",
      phone: "+6281234567890",
    });
    expect(r.success).toBe(true);
  });

  it("accepts phone with 62 prefix", () => {
    const r = tenantSchema.safeParse({
      full_name: "Andi",
      phone: "6281234567890",
    });
    expect(r.success).toBe(true);
  });

  it("rejects invalid KTP (not 16 digits)", () => {
    const r = tenantSchema.safeParse({
      full_name: "Andi",
      phone: "081234567890",
      identity_number: "12345",
    });
    expect(r.success).toBe(false);
  });

  it("rejects KTP with letters", () => {
    const r = tenantSchema.safeParse({
      full_name: "Andi",
      phone: "081234567890",
      identity_number: "327101123456789a",
    });
    expect(r.success).toBe(false);
  });

  it("accepts empty optional fields", () => {
    const emptyOk = tenantSchema.safeParse({
      full_name: "Andi",
      phone: "081234567890",
      identity_number: "",
      emergency_contact: "",
      address: "",
    });
    expect(emptyOk.success).toBe(true);
  });
});

describe("Tenant Schema (With Account)", () => {
  it("accepts valid with-account data", () => {
    const r = tenantWithAccountSchema.safeParse({
      full_name: "Andi Pratama",
      phone: "081234567890",
      email: "andi@email.com",
      password: "StrongPass1!",
    });
    expect(r.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const r = tenantWithAccountSchema.safeParse({
      full_name: "Andi",
      phone: "081234567890",
      email: "invalid-email",
      password: "StrongPass1!",
    });
    expect(r.success).toBe(false);
  });

  it("rejects password < 8 chars", () => {
    const r = tenantWithAccountSchema.safeParse({
      full_name: "Andi",
      phone: "081234567890",
      email: "andi@email.com",
      password: "Abc1",
    });
    expect(r.success).toBe(false);
  });

  it("rejects password without number", () => {
    const r = tenantWithAccountSchema.safeParse({
      full_name: "Andi",
      phone: "081234567890",
      email: "andi@email.com",
      password: "abcdefgh",
    });
    expect(r.success).toBe(false);
  });

  it("rejects password without letter", () => {
    const r = tenantWithAccountSchema.safeParse({
      full_name: "Andi",
      phone: "081234567890",
      email: "andi@email.com",
      password: "12345678",
    });
    expect(r.success).toBe(false);
  });
});
