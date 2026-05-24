/**
 * Seed script — Populate database with development dummy data
 * Usage: npm run seed        (insert data)
 *        npm run seed:reset  (truncate + re-insert)
 *
 * Uses SUPABASE_SERVICE_ROLE_KEY to bypass RLS
 */

import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types";

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const shouldReset = process.argv.includes("--reset");

// ─── Helpers ──────────────────────────────────────────────

function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function formatInvoiceNumber(index: number, month: number, year: number): string {
  return `INV-${year}${String(month).padStart(2, "0")}-${String(index).padStart(4, "0")}`;
}

// ─── Main ─────────────────────────────────────────────────

async function main() {
  console.log("🌱 Seeding database...");

  if (shouldReset) {
    console.log("  Resetting existing data...");
    const tables = [
      "audit_logs", "notifications", "payments", "invoices",
      "rental_contracts", "tenants", "expenses", "settings", "rooms", "profiles",
    ];
    for (const t of tables) {
      await supabase.from(t).delete().neq("id", "00000000-0000-0000-0000-000000000000");
    }
    // Delete auth users (except yourself if needed)
    console.log("  Data reset complete.");
  }

  // ── Settings ──
  console.log("  Inserting settings...");
  const settings = [
    { key: "fine_method", value: "fixed", description: "Metode denda: fixed atau percentage" },
    { key: "fine_fixed_daily", value: "5000", description: "Denda tetap per hari" },
    { key: "fine_percentage_daily", value: "2", description: "Persentase denda per hari" },
    { key: "grace_period_days", value: "3", description: "Masa tenggang (hari)" },
    { key: "generate_day", value: "1", description: "Tanggal generate invoice" },
    { key: "due_day", value: "10", description: "Tanggal jatuh tempo" },
    { key: "kost_name", value: "Kost Bahagia", description: "Nama kost" },
    { key: "kost_address", value: "Jl. Merdeka No. 123", description: "Alamat kost" },
    { key: "kost_phone", value: "08123456789", description: "No telepon kost" },
    { key: "kost_code", value: "KOS001", description: "Kode unik kost untuk prefix invoice" },
    { key: "midtrans_mode", value: "sandbox", description: "Midtrans mode: sandbox atau production" },
    {
      key: "midtrans_enabled_payments",
      value: "bca_va,bni_va,bri_va,mandiri_va,gopay,dana,ovo,shopeepay",
      description: "Metode pembayaran Midtrans",
    },
  ];

  for (const s of settings) {
    await supabase.from("settings").upsert(s, { onConflict: "key" });
  }

  // ── Auth Users + Profiles ──
  console.log("  Creating auth users...");
  const defaultPassword = process.env.SEED_PASSWORD || "Admin123!";
  const users = [
    { email: "superadmin@kost.com", password: defaultPassword, email_confirm: true, options: { data: { full_name: "Super Admin" } } },
    { email: "admin@kost.com", password: defaultPassword, email_confirm: true, options: { data: { full_name: "Admin Budi" } } },
    { email: "penghuni@kost.com", password: defaultPassword, email_confirm: true, options: { data: { full_name: "Andi Pratama" } } },
  ];

  const userIds: string[] = [];
  for (const u of users) {
    const { data, error } = await supabase.auth.admin.createUser(u);
    if (error && !error.message.includes("already")) {
      console.error("  Auth user error:", error.message);
      // Try to get existing
      const { data: existing } = await supabase.auth.admin.getUserByEmail(u.email);
      if (existing?.user) userIds.push(existing.user.id);
    } else if (data?.user) {
      userIds.push(data.user.id);
    }
  }

  // Ensure profiles are correct
  const profileData = [
    { user_id: userIds[0], full_name: "Super Admin", role: "super_admin", is_active: true },
    { user_id: userIds[1], full_name: "Admin Budi", role: "admin", is_active: true },
    { user_id: userIds[2], full_name: "Andi Pratama", role: "penghuni", is_active: true },
  ];

  for (const p of profileData) {
    if (p.user_id) {
      await supabase.from("profiles").upsert(p, { onConflict: "user_id" });
    }
  }

  // ── Rooms ──
  console.log("  Inserting rooms...");
  const rooms = [
    { name: "A-01", floor: 1, price: 500000, status: "tersedia" },
    { name: "A-02", floor: 1, price: 500000, status: "terisi" },
    { name: "A-03", floor: 1, price: 600000, status: "tersedia" },
    { name: "B-01", floor: 2, price: 750000, status: "terisi" },
    { name: "B-02", floor: 2, price: 750000, status: "perbaikan" },
    { name: "B-03", floor: 2, price: 1000000, status: "tersedia" },
  ];
  const roomIds: Record<string, string> = {};
  for (const r of rooms) {
    const { data } = await supabase.from("rooms").upsert(r, { onConflict: "name" }).select().single();
    if (data) roomIds[data.name] = data.id;
  }

  // ── Tenants ──
  console.log("  Inserting tenants...");
  const tenants = [
    { user_id: userIds[2], full_name: "Andi Pratama", phone: "081234567890", status: "aktif", room_id: roomIds["A-02"], check_in_date: "2026-01-01" },
    { user_id: null, full_name: "Budi Setiawan", phone: "081298765432", status: "aktif", room_id: roomIds["B-01"], check_in_date: "2026-02-01" },
    { user_id: null, full_name: "Caca Dewi", phone: "081255566677", status: "tidak_aktif", check_in_date: "2025-06-01", check_out_date: "2025-12-31", room_id: roomIds["A-02"] },
    { user_id: null, full_name: "Doni Rusli", phone: "081244433322", status: "tidak_aktif", is_blacklisted: true, blacklist_reason: "Merusak fasilitas kamar" },
  ];
  const tenantIds: Record<string, string> = {};
  for (const t of tenants) {
    const { data } = await supabase.from("tenants").insert(t).select().single();
    if (data) tenantIds[data.full_name] = data.id;
  }

  // ── Rental Contracts ──
  console.log("  Inserting contracts...");
  const contracts = [
    { tenant_id: tenantIds["Andi Pratama"], room_id: roomIds["A-02"], start_date: "2026-01-01", end_date: "2026-06-30", duration_months: 6, monthly_price: 500000, deposit: 500000, status: "aktif" },
    { tenant_id: tenantIds["Budi Setiawan"], room_id: roomIds["B-01"], start_date: "2026-02-01", end_date: "2026-07-31", duration_months: 6, monthly_price: 750000, deposit: 750000, status: "aktif" },
    { tenant_id: tenantIds["Caca Dewi"], room_id: roomIds["A-02"], start_date: "2025-06-01", end_date: "2025-12-31", duration_months: 7, monthly_price: 500000, deposit: 500000, status: "selesai" },
  ];
  const contractIds: Record<string, string> = {};
  for (const c of contracts) {
    const { data } = await supabase.from("rental_contracts").insert(c).select().single();
    if (data) contractIds[data.tenant_id] = data.id;
  }

  // ── Invoices ──
  console.log("  Inserting invoices...");
  let invCounter = 1;
  const invoicePayloads: any[] = [];

  // Andi - Jan to Jun 2026 (Jan-May paid, Jun unpaid)
  for (let m = 1; m <= 6; m++) {
    const paid = m <= 5;
    invoicePayloads.push({
      contract_id: contractIds[tenantIds["Andi Pratama"]],
      tenant_id: tenantIds["Andi Pratama"],
      invoice_number: formatInvoiceNumber(invCounter++, 1, 2026),
      period_start: `2026-${String(m).padStart(2, "0")}-01`,
      period_end: `2026-${String(m).padStart(2, "0")}-28`,
      amount: 500000,
      fine_amount: 0,
      total_amount: 500000,
      due_date: `2026-${String(m).padStart(2, "0")}-10`,
      status: paid ? "paid" : "unpaid",
      paid_at: paid ? `2026-${String(m).padStart(2, "0")}-08` : null,
    });
  }

  // Budi - Feb to Jul 2026 (Feb-May paid, Jun unpaid)
  for (let m = 2; m <= 7; m++) {
    const paid = m <= 5;
    invoicePayloads.push({
      contract_id: contractIds[tenantIds["Budi Setiawan"]],
      tenant_id: tenantIds["Budi Setiawan"],
      invoice_number: formatInvoiceNumber(invCounter++, m, 2026),
      period_start: `2026-${String(m).padStart(2, "0")}-01`,
      period_end: `2026-${String(m).padStart(2, "0")}-28`,
      amount: 750000,
      fine_amount: 0,
      total_amount: 750000,
      due_date: `2026-${String(m).padStart(2, "0")}-10`,
      status: paid ? "paid" : "unpaid",
      paid_at: paid ? `2026-${String(m).padStart(2, "0")}-05` : null,
    });
  }

  // Caca - history paid
  for (let m = 6; m <= 12; m++) {
    invoicePayloads.push({
      contract_id: contractIds[tenantIds["Caca Dewi"]],
      tenant_id: tenantIds["Caca Dewi"],
      invoice_number: formatInvoiceNumber(invCounter++, m, 2025),
      period_start: `2025-${String(m).padStart(2, "0")}-01`,
      period_end: `2025-${String(m).padStart(2, "0")}-28`,
      amount: 500000,
      fine_amount: 0,
      total_amount: 500000,
      due_date: `2025-${String(m).padStart(2, "0")}-10`,
      status: "paid",
      paid_at: `2025-${String(m).padStart(2, "0")}-08`,
    });
  }

  const invoiceIds: string[] = [];
  for (const inv of invoicePayloads) {
    const { data } = await supabase.from("invoices").upsert(inv, { onConflict: "invoice_number" }).select().single();
    if (data) invoiceIds.push(data.id);
  }

  // ── Payments ──
  console.log("  Inserting payments...");
  const paymentMethods = ["cash", "transfer", "midtrans"];
  const paymentStatuses = ["settlement"];

  for (const inv of invoicePayloads) {
    if (inv.status === "paid") {
      await supabase.from("payments").insert({
        invoice_id: inv.contract_id, // will be overwritten by invoice_ids lookup
        tenant_id: inv.tenant_id,
        amount: inv.total_amount,
        payment_method: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
        payment_date: inv.paid_at!,
        status: "settlement",
        notes: "Pembayaran dari seed data",
      });
    }
  }

  // ── Expenses ──
  console.log("  Inserting expenses...");
  const expenses = [
    { description: "Token Listrik Juni", amount: 300000, category: "listrik", date: "2026-06-01", created_by: userIds[0] },
    { description: "PDAM Juni", amount: 100000, category: "air", date: "2026-06-05", created_by: userIds[0] },
    { description: "Gaji Admin Juni", amount: 500000, category: "gaji", date: "2026-06-01", created_by: userIds[0] },
    { description: "Ganti kran kamar mandi", amount: 150000, category: "perbaikan", date: "2026-06-10", created_by: userIds[0] },
    { description: "WiFi IndiHome Juni", amount: 250000, category: "internet", date: "2026-06-01", created_by: userIds[0] },
  ];
  for (const e of expenses) {
    await supabase.from("expenses").insert(e);
  }

  // ── Notifications ──
  console.log("  Inserting notifications...");
  const notifs = [
    { user_id: userIds[2], title: "Tagihan Juni Terbit", message: "Tagihan bulan Juni 2026 sebesar Rp 500.000 telah terbit. Batas bayar: 10 Juni 2026.", type: "info" },
    { user_id: userIds[2], title: "Pembayaran Mei Diterima", message: "Pembayaran tagihan bulan Mei 2026 sebesar Rp 500.000 telah diterima. Terima kasih!", type: "success" },
    { user_id: userIds[0], title: "Tagihan Baru Terbit", message: "Tagihan bulan Juni telah digenerate otomatis untuk 2 kontrak aktif.", type: "info" },
    { user_id: userIds[1], title: "Pengingat: Tagihan Belum Dibayar", message: "1 tagihan belum dibayar: Andi Pratama (A-02) Rp 500.000. Segera tindak lanjuti.", type: "warning" },
  ];
  for (const n of notifs) {
    await supabase.from("notifications").insert(n);
  }

  console.log("✅ Seed complete!");
  console.log("");
  console.log("  Users:");
  console.log("    Super Admin → superadmin@kost.com / " + defaultPassword);
  console.log("    Admin       → admin@kost.com / " + defaultPassword);
  console.log("    Penghuni    → penghuni@kost.com / " + defaultPassword);
  console.log("");
  console.log("  Rooms: 6 | Tenants: 4 | Contracts: 3 | Invoices: " + invoicePayloads.length);
  console.log("  Expenses: 5 | Notifications: 4");
}

main().catch(console.error);
