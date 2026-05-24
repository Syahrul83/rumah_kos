import { describe, it, expect } from "vitest";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Email tidak valid").trim(),
  password: z.string().min(1, "Password wajib diisi"),
});

const registerSchema = z.object({
  full_name: z.string().min(3).max(100).trim(),
  email: z.string().email().trim(),
  password: z.string().min(8).regex(/[a-zA-Z]/).regex(/[0-9]/).trim(),
  phone: z.string().regex(/^(0|62|\+62)[0-9]{8,13}$/).optional().or(z.literal("")),
});

describe("Login Schema", () => {
  it("accepts valid login", () => {
    const r = loginSchema.safeParse({ email: "andi@email.com", password: "secret123" });
    expect(r.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const r = loginSchema.safeParse({ email: "invalid", password: "secret" });
    expect(r.success).toBe(false);
  });

  it("rejects empty password", () => {
    const r = loginSchema.safeParse({ email: "andi@email.com", password: "" });
    expect(r.success).toBe(false);
  });

  it("rejects email with whitespace (before trim)", () => {
    const r = loginSchema.safeParse({ email: "  test@email.com  ", password: "pass" });
    expect(r.success).toBe(false);
  });
});

describe("Register Schema", () => {
  it("accepts valid registration", () => {
    const r = registerSchema.safeParse({
      full_name: "Andi Pratama",
      email: "andi@email.com",
      password: "Secret123",
      phone: "081234567890",
    });
    expect(r.success).toBe(true);
  });

  it("accepts without phone", () => {
    const r = registerSchema.safeParse({
      full_name: "Andi",
      email: "andi@email.com",
      password: "Secret123",
      phone: "",
    });
    expect(r.success).toBe(true);
  });

  it("rejects short name", () => {
    const r = registerSchema.safeParse({
      full_name: "AB",
      email: "andi@email.com",
      password: "Secret123",
    });
    expect(r.success).toBe(false);
  });

  it("rejects password without number", () => {
    const r = registerSchema.safeParse({
      full_name: "Andi",
      email: "andi@email.com",
      password: "OnlyLetters",
    });
    expect(r.success).toBe(false);
  });

  it("rejects password without letter", () => {
    const r = registerSchema.safeParse({
      full_name: "Andi",
      email: "andi@email.com",
      password: "12345678",
    });
    expect(r.success).toBe(false);
  });

  it("rejects short password", () => {
    const r = registerSchema.safeParse({
      full_name: "Andi",
      email: "andi@email.com",
      password: "Abc12",
    });
    expect(r.success).toBe(false);
  });
});

describe("Role-based Dashboard Redirect", () => {
  function getDashboard(role: string): string {
    return role === "super_admin" || role === "admin" ? "/admin" : "/tenant";
  }

  it("redirects admin to /admin", () => {
    expect(getDashboard("admin")).toBe("/admin");
  });

  it("redirects super_admin to /admin", () => {
    expect(getDashboard("super_admin")).toBe("/admin");
  });

  it("redirects penghuni to /tenant", () => {
    expect(getDashboard("penghuni")).toBe("/tenant");
  });
});
