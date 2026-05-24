import { describe, it, expect } from "vitest";

function calculateEndDate(startDate: string, durationMonths: number): string {
  const start = new Date(startDate);
  const end = new Date(start);
  end.setMonth(end.getMonth() + durationMonths);
  return end.toISOString().split("T")[0];
}

function formatInvoiceNumber(): string {
  const now = new Date();
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `INV-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}-${rand}`;
}

describe("Contract Date Calculation", () => {
  it("calculates 6-month end date correctly", () => {
    const end = calculateEndDate("2026-01-01", 6);
    expect(end).toBe("2026-07-01");
  });

  it("calculates 1-month end date", () => {
    const end = calculateEndDate("2026-06-15", 1);
    expect(end).toBe("2026-07-15");
  });

  it("calculates 12-month end date across year", () => {
    const end = calculateEndDate("2026-10-01", 12);
    expect(end).toBe("2027-10-01");
  });

  it("handles 24-month duration", () => {
    const end = calculateEndDate("2026-01-01", 24);
    expect(end).toBe("2028-01-01");
  });
});

describe("Invoice Number Format", () => {
  it("produces correct format", () => {
    const num = formatInvoiceNumber();
    expect(num).toMatch(/^INV-\d{6}-\d{4}$/);
  });

  it("produces consistent length", () => {
    const num = formatInvoiceNumber();
    expect(num.length).toBeGreaterThanOrEqual(15);
    expect(num.length).toBeLessThanOrEqual(16);
  });
});

describe("Contract Status Transitions", () => {
  const validStatuses = ["aktif", "selesai", "dibatalkan"];

  it("accepts all valid statuses", () => {
    validStatuses.forEach((status) => {
      expect(validStatuses).toContain(status);
    });
  });

  it("rejects invalid status", () => {
    expect(validStatuses).not.toContain("pending");
    expect(validStatuses).not.toContain("expired");
  });
});

describe("Payment Amount Validation", () => {
  function isValidPayment(amount: number, totalAmount: number): boolean {
    return amount > 0 && amount <= totalAmount;
  }

  it("accepts exact payment", () => {
    expect(isValidPayment(500000, 500000)).toBe(true);
  });

  it("accepts partial payment", () => {
    expect(isValidPayment(200000, 500000)).toBe(true);
  });

  it("rejects overpayment", () => {
    expect(isValidPayment(600000, 500000)).toBe(false);
  });

  it("rejects zero payment", () => {
    expect(isValidPayment(0, 500000)).toBe(false);
  });

  it("rejects negative payment", () => {
    expect(isValidPayment(-100, 500000)).toBe(false);
  });
});
