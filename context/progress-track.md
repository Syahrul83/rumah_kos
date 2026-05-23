# PROGRESS TRACK — Kost Management App (KostKu)

**Stack:** Next.js 16 + TypeScript + Supabase + Midtrans + Tailwind v4
**Start:** 23-05-2026
**Today:** 23-05-2026 (Sesi 1-2)
**Target:** 16 Phase, 95+ Tasks | **Progress: 50% (8/16 Phase)**

---

## PHASE 0: PROJECT INITIALIZATION              ✅ COMPLETED
──────────────────────────────────────────────────────────────
Status: ✅ | Started: 23-05-2026 | Completed: 23-05-2026

  ✅ 0.1  Create Next.js project + TypeScript + Tailwind ....... (23-05-2026)
  ✅ 0.2  Install core dependencies ............................. (23-05-2026)
  ✅ 0.3  Install shadcn/ui components ......................... (23-05-2026)
  ✅ 0.4  Buat folder structure ................................ (23-05-2026)
  ✅ 0.5  Setup .env.local ..................................... (23-05-2026)
  ✅ 0.6  Setup Supabase clients .............................. (23-05-2026)
  ✅ 0.7  Setup TypeScript types .............................. (23-05-2026)
  ✅ 0.8  Setup Tailwind theme (Terracotta palette) ........... (23-05-2026)
  ✅ 0.9  Setup vercel.json (cron schedules) .................. (23-05-2026)
  ✅ 0.10 Create .gitignore ................................... (23-05-2026)
  ✅ 0.11 Initial commit ...................................... (23-05-2026)

COMMIT: "feat: initial project setup — Next.js 16 + Supabase + Tailwind v4"

CRITICAL CHECK:
  ⚠️ Service Role Key TIDAK boleh pakai prefix NEXT_PUBLIC_
  ⚠️ Tailwind v4 pakai @theme directives di CSS, bukan tailwind.config.ts

COMMIT: "feat: initial project setup — Next.js 16 + Supabase + Tailwind v4"

---

## PHASE 1: DATABASE SCHEMA & MIGRATIONS           ✅ COMPLETED
──────────────────────────────────────────────────────────────
Status: ☐ | Started: - | Completed: -
Memory: DB_Schema, RLS_Policies, DB_Triggers

  ☐ 1.1  Migration: profiles (extends auth.users) ............... ☐
         -> Test: Run migration, verify table di Supabase Dashboard

  ☐ 1.2  Trigger: auto-create-profile setelah signup ............ ☐
         -> Test: Register user manual, cek profile otomatis terbuat

  ☐ 1.3  Migration: rooms ........................................ ☐
         (name, description, price, floor, status, created_at, updated_at)
         -> Test: INSERT via Supabase SQL Editor

  ☐ 1.4  Migration: tenants ...................................... ☐
         (user_id FK, full_name, phone, identity_number, emergency_contact,
          address, status, check_in_date, check_out_date, room_id,
          is_blacklisted, blacklist_reason, blacklisted_at, blacklisted_by)
         -> Test: INSERT + SELECT data

  ☐ 1.5  Migration: rental_contracts ............................ ☐
         (tenant_id FK, room_id FK, start_date, end_date,
          duration_months, monthly_price, deposit, status)
         -> Test: INSERT + verify FK constraints

  ☐ 1.6  Migration: invoices ..................................... ☐
         (contract_id FK, tenant_id FK, invoice_number UNIQUE,
          period_start, period_end, amount, fine_amount,
          total_amount, due_date, status, notes)
         -> Test: INSERT + cek UNIQUE constraint

  ☐ 1.7  Migration: payments ..................................... ☐
         (invoice_id FK, tenant_id FK, amount, payment_method,
          midtrans_transaction_id UNIQUE, midtrans_order_id,
          payment_date, status, proof_image, notes)
         -> Test: INSERT + UNIQUE constraint midtrans_transaction_id

  ☐ 1.8  Migration: expenses ..................................... ☐
         (description, amount, category, date, notes, created_by FK)
         -> Test: INSERT + verify FK ke profiles

  ☐ 1.9  Migration: notifications ............................... ☐
         (user_id FK, title, message, type, is_read, link)
         -> Test: INSERT + enable REPLICA IDENTITY FULL

  ☐ 1.10 Migration: settings ..................................... ☐
         (key UNIQUE, value, description)
         -> Test: INSERT default settings

  ☐ 1.11 Migration: audit_logs ................................... ☐
         (user_id FK, action, table_name, record_id,
          old_data jsonb, new_data jsonb, ip_address, timestamp)
         -> Test: INSERT log entry

  ☐ 1.12 Setup ALL Row Level Security (RLS) ...................... ☐
         -> Policy SELECT untuk authenticated
         -> Policy INSERT/UPDATE/DELETE: admin, super_admin only
         -> Policy penghuni: hanya data sendiri
         -> Test: Login sebagai admin & penghuni, uji akses

  ☐ 1.13 Finalize types in src/types/index.ts ................... ☐
          -> Test: Match dengan schema database

CRITICAL CHECK:
  ⚠️ Semua tabel harus ENABLE ROW LEVEL SECURITY
  ⚠️ FOREIGN KEY constraints harus ON DELETE RESTRICT

COMMIT: "feat: database schema — 10 tables, triggers, and RLS policies"

---

## PHASE 2: AUTHENTICATION & ROLE SYSTEM            ✅ COMPLETED
──────────────────────────────────────────────────────────────
Status: ☐ | Started: - | Completed: -
Memory: Auth_Flow, Proxy_Logic, Role_Validation

  ☐ 2.1  Setup Supabase auth helpers ............................. ☐
         (signUp, signIn, signOut, getSession, getUser)
         -> Test: Test register + login via console

  ☐ 2.2  Buat proxy.ts (auth redirect + role check) .............. ☐
         (Protected: /admin/*, /tenant/*. Public: /login, /register, /)
         (Redirect berdasarkan role dari profiles)
         (Cek is_active = true)
         -> Test: Login tiap role, akses route yang dilarang

  ☐ 2.3  Buat halaman Login (/login) ............................ ☐
         (Form email + password, validasi, error state, loading)
         -> Test: Login sukses → redirect. Gagal → error message

  ☐ 2.4  Buat halaman Register (/register) ....................... ☐
         (Nama, email, password, konfirmasi, no HP)
         (Password strength indicator)
         -> Test: Register → redirect login

  ☐ 2.5  Buat auth callback route (/auth/callback) ............... ☐
         -> Test: Email verification redirect

  ☐ 2.6  Buat Server Action logout ............................... ☐
         -> Test: Logout → tidak bisa akses protected route

  ☐ 2.7  Buat layout untuk admin & tenant ........................ ☐
         (src/app/admin/layout.tsx, src/app/tenant/layout.tsx)
         -> Test: Halaman muncul sesuai role, redirect jika tidak berhak

CRITICAL CHECK:
  ⚠️ Proxy harus handle semua edge case: token expired, role tidak ditemukan, is_active=false
  ⚠️ Server Actions harus re-check auth sebelum proses data

COMMIT: "feat: auth system — login, register, proxy-guard, role-based access"

---

## PHASE 3: SEED / DUMMY DATA                       ✅ COMPLETED
──────────────────────────────────────────────────────────────
Status: ☐ | Started: - | Completed: -
Memory: Seed_Data, Dummy_Scenarios

  ☐ 3.1  Seed: Settings default .................................. ☐
         (fine_method=fixed, fine_fixed_daily=5000, grace_period=3,
          generate_day=1, due_day=10, kost_name, kost_code)
         -> Test: Query settings, verify

  ☐ 3.2  Seed: 3 Users via Supabase Auth API ..................... ☐
         (super_admin@kost.com, admin@kost.com, penghuni@kost.com)
         -> Test: Login as 3 roles

  ☐ 3.3  Seed: 6 Rooms (various status) .......................... ☐
         (A-01 tersedia, A-02 terisi, A-03 tersedia, B-01 terisi, B-02 perbaikan, B-03 tersedia)
         -> Test: Query rooms, verify status

  ☐ 3.4  Seed: 3 Tenants (2 aktif, 1 tidak aktif, 1 diblokir) ... ☐
         (Andi aktif di A-02, Budi aktif di B-01, Caca tidak aktif, Doni diblokir)
         -> Test: Query tenants, verify relasi

  ☐ 3.5  Seed: 2 Rental Contracts (aktif) ........................ ☐
         (Andi A-02 6 bln, Budi B-01 6 bln)
         -> Test: Query contracts, join rooms & tenants

  ☐ 3.6  Seed: 7 Invoices (mix unpaid, paid, overdue) ............ ☐
         -> Test: Query invoices by status

  ☐ 3.7  Seed: 9 Payments (history) .............................. ☐
         -> Test: Query payments, join invoices

  ☐ 3.8  Seed: 3 Expenses ........................................ ☐
         -> Test: Query expenses, verify categories

  ☐ 3.9  Seed: 3 Notifications ................................... ☐
         -> Test: Query notifications by user

  ☐ 3.10 Seed script runner (package.json scripts) ............... ☐
         ("seed": "tsx src/scripts/seed.ts")
         -> Test: npm run seed → data muncul di DB

CRITICAL CHECK:
  ⚠️ Seed harus IDEMPOTEN (bisa dijalankan ulang tanpa error)
  ⚠️ Password dummy dari .env.local (SEED_PASSWORD)

COMMIT: "feat: seed/dummy data for development and testing"

---

## PHASE 4: SHARED UI COMPONENTS & LAYOUT           ⏳ IN PROGRESS
──────────────────────────────────────────────────────────────
Status: ☐ | Started: - | Completed: -
Memory: UI_Components, Layout_System

  ☐ 4.1  Install & verify shadcn/ui components ................... ☐
         -> Test: Import semua komponen, pastikan tidak ada error

  ☐ 4.2  Buat Admin Layout (sidebar + topbar + content) .......... ☐
         (src/components/layout/admin-sidebar.tsx)
         (src/components/layout/admin-topbar.tsx)
         (Collapsible sidebar, breadcrumb, mobile responsive)
         -> Test: Klik setiap menu, verify navigasi

  ☐ 4.3  Buat Tenant Layout (bottom nav + content) ............... ☐
         (src/components/layout/tenant-layout.tsx)
         (src/components/layout/tenant-bottom-nav.tsx)
         -> Test: Klik 4 menu bottom nav

  ☐ 4.4  Buat DataTable component (reusable) ..................... ☐
         (Props: columns, data, searchable, pagination, loading, empty)
         (Support server-side pagination & search)
         -> Test: Render dengan mock data

  ☐ 4.5  Buat SearchWithDebounce component ....................... ☐
         (Input + 300ms debounce)
         -> Test: Ketik, cek debounce

  ☐ 4.6  Buat ConfirmDialog component ............................ ☐
         (Danger variant + ketik-ulang untuk delete)
         -> Test: Klik hapus → dialog → ketik → hapus

  ☐ 4.7  Buat StatusBadge component .............................. ☐
         (Mapping warna: hijau/merah/kuning/biru per status)
         -> Test: Render semua status

  ☐ 4.8  Buat EmptyState component ............................... ☐
         -> Test: Render di halaman kosong

  ☐ 4.9  Buat Form components (wrapper react-hook-form+zod) ...... ☐
         (FormField, FormInput, FormSelect, FormDatePicker, FormCurrency)
         -> Test: Submit form kosong → validasi muncul

  ☐ 4.10 Buat LoadingSkeleton (table, card, form) ................ ☐
          -> Test: Render skeleton loading

CRITICAL CHECK:
  ⚠️ Semua component reusable dan typed proper
  ⚠️ 'use client' hanya pada komponen yang butuh interaktivitas

COMMIT: "feat: shared UI components and layout system"

---

## PHASE 5: ROOM MANAGEMENT (CRUD)                  ⏳ IN PROGRESS
──────────────────────────────────────────────────────────────
Status: ☐ | Started: - | Completed: -
Memory: Room_Crud_Flow, Room_Validation

  ☐ 5.1  Zod schema: room-schema.ts .............................. ☐
         -> Test: Unit test berbagai input

  ☐ 5.2  Server Actions: create, update, delete, checkUnique ..... ☐
         -> Test: Panggil dari RSC, verify RLS

  ☐ 5.3  /admin/rooms — list + search + pagination ............... ☐
         -> Test: Load data, search, pagination, klik action

  ☐ 5.4  /admin/rooms/new — create form .......................... ☐
         (Real-time unique name check, auto-format Rupiah)
         -> Test: Submit valid, invalid, duplikat

  ☐ 5.5  /admin/rooms/[id]/edit — edit form ...................... ☐
         -> Test: Edit data, unique check exclude current

  ☐ 5.6  /admin/rooms/[id]/detail — detail + history ............. ☐
         -> Test: Relasi data muncul

  ☐ 5.7  Delete room dengan ConfirmDialog ........................ ☐
         (Cek kamar terisi → tolak. Kosong → delete/soft-delete)
         -> Test: Hapus kamar terisi → error. Kosong → sukses

CRITICAL CHECK:
  ⚠️ Tidak bisa hapus kamar yang sedang terisi

COMMIT: "feat: room CRUD with validation and server-side pagination"

---

## PHASE 6: TENANT MANAGEMENT (CRUD)                ☐ PENDING
──────────────────────────────────────────────────────────────
Status: ☐ | Started: - | Completed: -
Memory: Tenant_Crud_Flow, Tenant_Blacklist

  ☐ 6.1  Zod schema: tenant-schema.ts ............................ ☐
         (Kondisional: dengan akun / tanpa akun)
         -> Test: Unit test kedua tipe

  ☐ 6.2  Server Actions: create, update, blacklist, unblacklist .. ☐
         (With account → Supabase signUp + profile)
         (Without account → insert langsung)
         -> Test: Create with account, without account, blacklist

  ☐ 6.3  /admin/tenants — list + search + filter + pagination .... ☐
         (Filter: status, blacklisted)
         -> Test: Filter + search

  ☐ 6.4  /admin/tenants/new — create form ........................ ☐
         (Toggle: dengan/tanpa akun, conditional fields)
         -> Test: Submit both modes

  ☐ 6.5  /admin/tenants/[id]/detail — detail + history ........... ☐
         (Status kontrak, history, blacklist button)
         -> Test: Navigasi list → detail

  ☐ 6.6  /admin/tenants/[id]/edit — edit form .................... ☐
         -> Test: Update data

  ☐ 6.7  Delete tenant (hanya jika tidak ada kontrak aktif) ....... ☐
         -> Test: Hapus tenant aktif → error

CRITICAL CHECK:
  ⚠️ Tenant dengan kontrak aktif tidak bisa dihapus
  ⚠️ Blacklist harus disable akun login juga

COMMIT: "feat: tenant CRUD with blacklist system"

---

## PHASE 7: RENTAL CONTRACTS (CRUD)                 ☐ PENDING
──────────────────────────────────────────────────────────────
Status: ☐ | Started: - | Completed: -
Memory: Contract_Flow, Contract_Wizard

  ☐ 7.1  Zod schema: contract-schema.ts .......................... ☐
         -> Test: Unit test validasi

  ☐ 7.2  Server Actions: create, extend, terminate, check ......... ☐
         (Atomic: INSERT contract + UPDATE room + UPDATE tenant + INSERT invoice)
         -> Test: Validasi, rollback

  ☐ 7.3  /admin/contracts — list + filter + pagination ........... ☐
         -> Test: Load + filter

  ☐ 7.4  /admin/contracts/new — 3-step wizard .................... ☐
         (Step 1: Pilih tenant. Step 2: Pilih kamar. Step 3: Detail & konfirmasi)
         -> Test: Wizard flow, back-navigation, simpan

  ☐ 7.5  /admin/contracts/[id]/extend — perpanjang ............... ☐
         -> Test: End date berubah

  ☐ 7.6  /admin/contracts/[id]/terminate — check-out ............. ☐
         (Atomic: UPDATE tenant + contract + room)
         -> Test: Check-out → kamar tersedia, tenant tidak aktif

CRITICAL CHECK:
  ⚠️ Atomic transaction: gagal di tengah harus ROLLBACK
  ⚠️ Generate invoice pertama saat kontrak dibuat
  ⚠️ Kamar harus status 'tersedia' sebelum dipilih

COMMIT: "feat: rental contract CRUD with 3-step wizard"

---

## PHASE 8: INVOICES & MANUAL PAYMENTS              ☐ PENDING
──────────────────────────────────────────────────────────────
Status: ☐ | Started: - | Completed: -
Memory: Invoice_Flow, Payment_Flow

  ☐ 8.1  Server Action: generateInvoice (single) .................. ☐
         (Cek duplikasi: UNIQUE contract_id + period_start)
         -> Test: Generate → tidak duplikat

  ☐ 8.2  Server Action: generateMonthlyInvoices (batch/cron) ...... ☐
         -> Test: Panggil manual, verify

  ☐ 8.3  Server Action: recordPayment (cash/transfer) ............. ☐
         (Validasi: status unpaid/overdue, amount ≤ total)
         -> Test: Bayar penuh, sebagian, overpay → error

  ☐ 8.4  /admin/invoices — list + filter + search + pagination ... ☐
         (Filter: status, color coding)
         -> Test: Filter + search

  ☐ 8.5  /admin/invoices/pay — modal/form pembayaran ............. ☐
         (Detail, metode, jumlah, bukti, tgl, catatan)
         -> Test: Cash → settlement. Transfer → upload → settlement

CRITICAL CHECK:
  ⚠️ Cegah double payment — invoice paid harus ditolak
  ⚠️ Jumlah bayar tidak boleh > total_amount
  ⚠️ Midtrans transaction ID harus UNIQUE

COMMIT: "feat: invoice management and manual payment processing"

---

## PHASE 9: MIDTRANS PAYMENT INTEGRATION            ☐ PENDING
──────────────────────────────────────────────────────────────
Status: ☐ | Started: - | Completed: -
MCP Context7: /midtrans/midtrans-client
Memory: Midtrans_Flow, Midtrans_Security

  ☐ 9.1  Install & setup Midtrans Snap client .................... ☐
         (src/lib/midtrans/snap.ts, env config)
         -> Test: Ping Midtrans sandbox API

  ☐ 9.2  POST /api/midtrans/create-transaction ................... ☐
         (Validasi, lock invoice, create Snap transaction)
         -> Test: Dapatkan snap_token

  ☐ 9.3  POST /api/midtrans/callback (WEBHOOK) ................... ☐
         (Verify SHA512 signature, idempotency check)
         (Process: settlement/pending/failed/refund)
         -> Test: Simulasi callback

  ☐ 9.4  GET /api/midtrans/status?order_id=xxx ................... ☐
         -> Test: Cek status transaksi

  ☐ 9.5  MidtransSnapButton component ............................. ☐
         (Pop-up Snap, loading, error handling)
         -> Test: Bayar → pop-up → pilih VA → dapat VA number

  ☐ 9.6  MidtransPaymentStatus component .......................... ☐
         (Pending dengan VA number, settlement, failed)
         (Auto-check setiap 30 detik untuk pending)
         -> Test: Tampilkan status

  ☐ 9.7  Integrasi ke halaman Tagihan tenant ...................... ☐
         -> Test: Full flow bayar Midtrans SANDBOX

CRITICAL CHECK:
  ⚠️ Testing pakai Midtrans SANDBOX
  ⚠️ Signature verification DI WAJIBKAN di callback
  ⚠️ Idempotency: Midtrans bisa kirim callback 2x

COMMIT: "feat: full Midtrans payment integration with Snap + webhook"

---

## PHASE 10: FINE SYSTEM & CRON JOBS                ☐ PENDING
──────────────────────────────────────────────────────────────
Status: ☐ | Started: - | Completed: -
MCP Context7: /vercel/vercel (cron)
Memory: Fine_Algorithm, Cron_Setup

  ☐ 10.1 POST /api/cron/calculate-fines (auth: CRON_SECRET) ...... ☐
          (SELECT unpaid WHERE due_date < NOW(), hitung denda, update overdue)
          -> Test: Atur due_date kemarin, jalankan cron, cek overdue

  ☐ 10.2 POST /api/cron/generate-invoices (auth: CRON_SECRET) .... ☐
          (SELECT kontrak aktif, cek duplikasi, generate invoice)
          -> Test: Jalankan manual, cek invoice

  ☐ 10.3 vercel.json cron configuration .......................... ☐
          (calculate-fines: tiap hari 01:00)
          (generate-invoices: tgl 1 jam 07:00)
          -> Test: Deploy → cek execution log

  ☐ 10.4 Admin Panel: trigger manual .............................. ☐
          (Tombol [Generate Invoice] [Hitung Denda] di dashboard)
          -> Test: Klik manual trigger

CRITICAL CHECK:
  ⚠️ Cron endpoint harus dilindungi CRON_SECRET token
  ⚠️ Generate invoice harus cek duplikasi (periode sama ≠ double)

COMMIT: "feat: fine calculation, auto-generate invoices, Vercel cron"

---

## PHASE 11: NOTIFICATION SYSTEM                    ☐ PENDING
──────────────────────────────────────────────────────────────
Status: ☐ | Started: - | Completed: -
Memory: Notification_System

  ☐ 11.1 Supabase Realtime: enable REPLICA IDENTITY FULL ......... ☐
          (Subscribe: notifications:user_id=eq.{userId})
          -> Test: Insert notif via SQL → muncul real-time

  ☐ 11.2 NotificationBell component ............................... ☐
          (Badge count, dropdown panel, mark-read on click)
          -> Test: Klik bell → dropdown → klik notif

  ☐ 11.3 NotificationPanel component .............................. ☐
          (List 10 terbaru, [Tandai Semua Dibaca], real-time update)
          -> Test: Notif baru muncul saat panel terbuka

  ☐ 11.4 Server Actions: sendNotification, markAsRead, markAll ... ☐
          -> Test: Panggil action, cek di panel

  ☐ 11.5 Integrasi notifikasi ke semua flow ....................... ☐
          (Tagihan baru, bayar sukses, overdue, kontrak, check-out)
          -> Test: Trigger semua skenario

CRITICAL CHECK:
  ⚠️ Realtime subscription harus unsubscribe saat unmount
  ⚠️ RLS: user hanya lihat notifikasi miliknya

COMMIT: "feat: real-time notification system with Supabase Realtime"

---

## PHASE 12: EXPENSES (PENGELUARAN)                 ☐ PENDING
──────────────────────────────────────────────────────────────
Status: ☐ | Started: - | Completed: -
Memory: Expense_Crud

  ☐ 12.1 Zod schema + Server Actions (CRUD) ...................... ☐
          -> Test: Unit test validasi, CRUD

  ☐ 12.2 /admin/expenses — list + form + delete .................. ☐
          (Filter: kategori, bulan. Summary total pengeluaran)
          -> Test: CRUD lengkap

CRITICAL CHECK:
  ⚠️ Kategori "Lainnya" butuh custom text input

COMMIT: "feat: expense management CRUD"

---

## PHASE 13: REPORTS (LAPORAN)                      ☐ PENDING
──────────────────────────────────────────────────────────────
Status: ☐ | Started: - | Completed: -
MCP Context7: /recharts/recharts
Memory: Report_Queries

  ☐ 13.1 /admin/reports/finance — Laporan Keuangan ............... ☐
          (Filter bulan+thn, summary cards, bar chart 6 bulan)
          (Breakdown pemasukan & pengeluaran, tabel piutang)
          (Export PDF + Excel)
          -> Test: Filter, verify data, export file

  ☐ 13.2 /admin/reports/tenants — Laporan Penghuni ............... ☐
          (Summary, tabel, filter status, export)
          -> Test: Filter, export

  ☐ 13.3 /admin/reports/occupancy — Okupansi Kamar ............... ☐
          (Progress ring, chart per bulan, tabel per kamar)
          -> Test: Data matching

  ☐ 13.4 PDF export utility (src/lib/export/pdf.ts) .............. ☐
          -> Test: Download, buka file

  ☐ 13.5 Excel export utility (src/lib/export/excel.ts) ........... ☐
          -> Test: Download, buka file

CRITICAL CHECK:
  ⚠️ Data report pakai aggregate query di server, BUKAN counting di frontend
  ⚠️ Export harus include SEMUA data (tidak terbatas pagination)

COMMIT: "feat: complete reports with charts and export"

---

## PHASE 14: SETTINGS & USER MANAGEMENT             ☐ PENDING
──────────────────────────────────────────────────────────────
Status: ☐ | Started: - | Completed: -
Memory: Settings_Config

  ☐ 14.1 /admin/settings — tabs: Kost, Pembayaran, Midtrans ...... ☐
          (SA only. RLS + proxy guard)
          -> Test: Simpan setiap tab, cek data persist

  ☐ 14.2 /admin/users — daftar user + edit role + disable ........ ☐
          (SA only. Tidak bisa disable diri sendiri, min 1 SA)
          -> Test: Akses admin 403, verify SA-only

CRITICAL CHECK:
  ⚠️ Super Admin only (proxy + RLS + layout check)
  ⚠️ Midtrans keys disembunyikan di UI (••••)

COMMIT: "feat: settings portal + user management for super admin"

---

## PHASE 15: TENANT PORTAL                          ☐ PENDING
──────────────────────────────────────────────────────────────
Status: ☐ | Started: - | Completed: -
Memory: Tenant_Dashboard

  ☐ 15.1 /tenant — Dashboard ..................................... ☐
          (Greeting, tagihan card + countdown, status kamar,
           mini history, notifikasi)
          -> Test: Load data tenant, render countdown

  ☐ 15.2 /tenant/invoices — Tagihan Saya .......................... ☐
          (Filter status, card per tagihan, countdown timer)
          (Progress bar per item, tombol bayar urgent)
          (Sticky bottom bar untuk unpaid/overdue)
          -> Test: Semua status, countdown, bayar

  ☐ 15.3 CountdownTimer component ................................. ☐
          (Due date, "X hari lagi" / "Terlambat X hari")
          -> Test: Mock date masa depan & lampau

  ☐ 15.4 ProgressBar component (deadline) ......................... ☐
          (Warna: hijau → kuning → oranye → merah)
          -> Test: Render berbagai progress

  ☐ 15.5 /tenant/payments — Riwayat Pembayaran .................... ☐
          (Filter bulan, infinite scroll/pagination)
          -> Test: Load, filter

  ☐ 15.6 /tenant/profile — Profil Saya ............................ ☐
          (Edit data diri, detail kontrak, ganti password, logout)
          -> Test: Edit, ganti password, logout

CRITICAL CHECK:
  ⚠️ RLS: tenant HANYA lihat data sendiri
  ⚠️ Countdown harus real-time re-render

COMMIT: "feat: complete tenant portal — dashboard, invoices, payment history"

---

## PHASE 16: DEPLOYMENT & FINAL TESTING             ☐ PENDING
──────────────────────────────────────────────────────────────
Status: ☐ | Started: - | Completed: -
MCP Context7: /vercel/vercel

  ☐ 16.1 Setup Vercel Project (connect repo, env vars) ............ ☐
          -> Test: Deploy preview

  ☐ 16.2 Setup Supabase Production ................................ ☐
          (Ganti env, jalankan migrations)
          -> Test: Koneksi ke production

  ☐ 16.3 Deploy Preview (Staging) ................................. ☐
          (Test FULL flow: register, login, CRUD, payment, reports)
          -> Test: Semua scenario

  ☐ 16.4 Ganti Midtrans Production keys ........................... ☐
          -> Test: Pembayaran production (nominal kecil)

  ☐ 16.5 Final Security Checklist ................................. ☐
          (Proxy guard, RLS, callback signature, input validation,
           XSS escape, service key not exposed)
          -> Test: Security audit

  ☐ 16.6 Deploy Production ........................................ ☐
          (Merge main → Vercel auto-deploy → custom domain)

CRITICAL CHECK:
  ⚠️ Backup database sebelum deploy production
  ⚠️ Midtrans production key diuji dulu nominal kecil

COMMIT: "chore: production deployment + final testing"

---

## LEGEND
──────────────────────────────────────────────────────────────
☐ PENDING     — Belum dimulai
⏳ IN PROGRESS — Sedang dikerjakan
✅ COMPLETED   — Selesai dan sudah di-test
❌ BLOCKED     — Terhambat, lihat catatan

## ERROR LOG
──────────────────────────────────────────────────────────────
(Isi error + solusi saat development)

## COMMIT HISTORY
──────────────────────────────────────────────────────────────
(Isi commit messages + date)
