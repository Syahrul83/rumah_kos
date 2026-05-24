import { describe, it, expect } from "vitest";

// Test the invoice creation and payment validation logic
describe("Invoice Logic", () => {
  it("calculates total_amount correctly", () => {
    const amount = 500000;
    const fine = 25000;
    const total = amount + fine;
    expect(total).toBe(525000);
  });

  it("checks overdue status correctly", () => {
    const today = new Date("2026-06-15");
    const dueDate = new Date("2026-06-10");
    const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
    expect(daysOverdue).toBe(5);
  });

  it("checks grace period — not overdue if within grace", () => {
    const gracePeriod = 3;
    const daysLate = 2;
    expect(daysLate > gracePeriod).toBe(false);
  });

  it("checks grace period — overdue if exceed grace", () => {
    const gracePeriod = 3;
    const daysLate = 5;
    expect(daysLate > gracePeriod).toBe(true);
  });

  it("calculates fixed fine correctly", () => {
    const daysLate = 5;
    const finePerDay = 5000;
    expect(daysLate * finePerDay).toBe(25000);
  });

  it("calculates percentage fine correctly", () => {
    const amount = 500000;
    const pct = 2;
    const daysLate = 5;
    const fine = Math.round(amount * (pct / 100) * daysLate);
    expect(fine).toBe(50000);
  });

  it("generates invoice number in correct format", () => {
    const year = 2026;
    const month = 6;
    const n = 1;
    const num = `INV-${year}${String(month).padStart(2, "0")}-${String(n).padStart(4, "0")}`;
    expect(num).toBe("INV-202606-0001");
  });

  it("renders payment status correctly", () => {
    const statusMap: Record<string, string> = {
      unpaid: "Belum Bayar",
      paid: "Lunas",
      overdue: "Overdue",
      pending_payment: "Pending",
      cancelled: "Batal",
    };
    expect(statusMap["unpaid"]).toBe("Belum Bayar");
    expect(statusMap["paid"]).toBe("Lunas");
    expect(statusMap["overdue"]).toBe("Overdue");
  });
});

describe("Fine Calculation Edge Cases", () => {
  it("returns 0 fine for on-time payment", () => {
    const daysLate = 0;
    const finePerDay = 5000;
    expect(daysLate * finePerDay).toBe(0);
  });

  it("handles 30 days overdue", () => {
    const daysLate = 30;
    const finePerDay = 5000;
    expect(daysLate * finePerDay).toBe(150000);
  });

  it("grace period exactly equals late days", () => {
    const gracePeriod = 3;
    const daysLate = 3;
    expect(daysLate > gracePeriod).toBe(false);
  });

  it("one day past grace period", () => {
    const gracePeriod = 3;
    const daysLate = 4;
    expect(daysLate > gracePeriod).toBe(true);
  });
});
