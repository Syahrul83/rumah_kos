import { describe, it, expect } from "vitest";
import { z } from "zod";

const expenseSchema = z.object({
  description: z.string().min(1, "Deskripsi wajib diisi").max(200).trim(),
  amount: z.number().int().min(1000, "Minimal Rp 1.000").max(100_000_000),
  category: z.enum(["listrik", "air", "kebersihan", "perbaikan", "gaji", "internet", "keamanan", "lainnya"]),
  custom_category: z.string().max(100).optional().nullable(),
  date: z.string().min(1, "Tanggal wajib diisi"),
  notes: z.string().max(200).optional().nullable(),
});

describe("Expense Schema", () => {
  it("accepts valid expense", () => {
    const r = expenseSchema.safeParse({
      description: "Token Listrik 100kWh",
      amount: 300000,
      category: "listrik",
      date: "2026-06-01",
    });
    expect(r.success).toBe(true);
  });

  it("accepts custom category", () => {
    const r = expenseSchema.safeParse({
      description: "Biaya lain",
      amount: 50000,
      category: "lainnya",
      custom_category: "Parkir",
      date: "2026-06-01",
    });
    expect(r.success).toBe(true);
  });

  it("rejects empty description", () => {
    const r = expenseSchema.safeParse({
      description: "",
      amount: 1000,
      category: "listrik",
      date: "2026-06-01",
    });
    expect(r.success).toBe(false);
  });

  it("rejects amount < 1000", () => {
    const r = expenseSchema.safeParse({
      description: "Test",
      amount: 500,
      category: "listrik",
      date: "2026-06-01",
    });
    expect(r.success).toBe(false);
  });

  it("rejects amount > 100jt", () => {
    const r = expenseSchema.safeParse({
      description: "Test",
      amount: 999_000_000,
      category: "listrik",
      date: "2026-06-01",
    });
    expect(r.success).toBe(false);
  });

  it("rejects invalid category", () => {
    const r = expenseSchema.safeParse({
      description: "Test",
      amount: 10000,
      category: "makanan",
      date: "2026-06-01",
    });
    expect(r.success).toBe(false);
  });

  it("rejects empty date", () => {
    const r = expenseSchema.safeParse({
      description: "Test",
      amount: 10000,
      category: "listrik",
      date: "",
    });
    expect(r.success).toBe(false);
  });

  it("accepts all valid categories", () => {
    const cats = ["listrik", "air", "kebersihan", "perbaikan", "gaji", "internet", "keamanan", "lainnya"];
    cats.forEach((cat) => {
      const r = expenseSchema.safeParse({ description: "Test", amount: 10000, category: cat, date: "2026-06-01" });
      expect(r.success).toBe(true);
    });
  });

  it("rejects notes > 200 chars", () => {
    const r = expenseSchema.safeParse({
      description: "Test", amount: 10000, category: "listrik", date: "2026-06-01", notes: "x".repeat(201),
    });
    expect(r.success).toBe(false);
  });

  it("accepts max length description", () => {
    const r = expenseSchema.safeParse({
      description: "x".repeat(200), amount: 10000, category: "listrik", date: "2026-06-01",
    });
    expect(r.success).toBe(true);
  });
});
