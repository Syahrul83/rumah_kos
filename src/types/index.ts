// ─── Database Schema Types ──────────────────────────────────

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Role = "super_admin" | "admin" | "penghuni";
export type RoomStatus = "tersedia" | "terisi" | "perbaikan";
export type TenantStatus = "aktif" | "tidak_aktif";
export type ContractStatus = "aktif" | "selesai" | "dibatalkan";
export type InvoiceStatus = "unpaid" | "paid" | "overdue" | "pending_payment" | "cancelled";
export type PaymentMethod = "cash" | "transfer" | "midtrans";
export type PaymentStatus = "pending" | "settlement" | "failed" | "refund";
export type ExpenseCategory = "listrik" | "air" | "kebersihan" | "perbaikan" | "gaji" | "internet" | "keamanan" | "lainnya";
export type NotificationType = "info" | "warning" | "payment" | "success";

// ─── Tables ─────────────────────────────────────────────────

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  phone: string | null;
  role: Role;
  is_active: boolean;
  deactivated_reason: string | null;
  deactivated_at: string | null;
  deactivated_by: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Room {
  id: string;
  name: string;
  description: string | null;
  price: number;
  floor: number;
  status: RoomStatus;
  created_at: string;
  updated_at: string;
}

export interface Tenant {
  id: string;
  user_id: string | null;
  full_name: string;
  phone: string;
  identity_number: string | null;
  emergency_contact: string | null;
  address: string | null;
  status: TenantStatus;
  check_in_date: string;
  check_out_date: string | null;
  room_id: string | null;
  is_blacklisted: boolean;
  blacklist_reason: string | null;
  blacklisted_at: string | null;
  blacklisted_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface RentalContract {
  id: string;
  tenant_id: string;
  room_id: string;
  start_date: string;
  end_date: string;
  duration_months: number;
  monthly_price: number;
  deposit: number;
  status: ContractStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  contract_id: string;
  tenant_id: string;
  invoice_number: string;
  period_start: string;
  period_end: string;
  amount: number;
  fine_amount: number;
  total_amount: number;
  due_date: string;
  status: InvoiceStatus;
  notes: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  invoice_id: string;
  tenant_id: string;
  amount: number;
  payment_method: PaymentMethod;
  midtrans_transaction_id: string | null;
  midtrans_order_id: string | null;
  payment_date: string;
  status: PaymentStatus;
  proof_image: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  custom_category: string | null;
  date: string;
  notes: string | null;
  proof_image: string | null;
  created_by: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  link: string | null;
  created_at: string;
}

export interface Setting {
  id: string;
  key: string;
  value: string;
  description: string | null;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  table_name: string;
  record_id: string | null;
  old_data: Json | null;
  new_data: Json | null;
  ip_address: string | null;
  created_at: string;
}

// ─── Database type for Supabase client ──────────────────────

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Profile, "id">>;
      };
      rooms: {
        Row: Room;
        Insert: Omit<Room, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Room, "id">>;
      };
      tenants: {
        Row: Tenant;
        Insert: Omit<Tenant, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Tenant, "id">>;
      };
      rental_contracts: {
        Row: RentalContract;
        Insert: Omit<RentalContract, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<RentalContract, "id">>;
      };
      invoices: {
        Row: Invoice;
        Insert: Omit<Invoice, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Invoice, "id">>;
      };
      payments: {
        Row: Payment;
        Insert: Omit<Payment, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Payment, "id">>;
      };
      expenses: {
        Row: Expense;
        Insert: Omit<Expense, "id" | "created_at">;
        Update: Partial<Omit<Expense, "id">>;
      };
      notifications: {
        Row: Notification;
        Insert: Omit<Notification, "id" | "created_at">;
        Update: Partial<Omit<Notification, "id">>;
      };
      settings: {
        Row: Setting;
        Insert: Omit<Setting, "id" | "updated_at">;
        Update: Partial<Omit<Setting, "id">>;
      };
      audit_logs: {
        Row: AuditLog;
        Insert: Omit<AuditLog, "id" | "created_at">;
        Update: Partial<Omit<AuditLog, "id">>;
      };
    };
    Enums: {
      role: Role;
      room_status: RoomStatus;
      tenant_status: TenantStatus;
      contract_status: ContractStatus;
      invoice_status: InvoiceStatus;
      payment_method: PaymentMethod;
      payment_status: PaymentStatus;
      expense_category: ExpenseCategory;
      notification_type: NotificationType;
    };
  };
}

// ─── Join Query Types ───────────────────────────────────────

export interface InvoiceWithDetails extends Invoice {
  tenant: Pick<Tenant, "full_name" | "phone">;
  room: Pick<Room, "name">;
  contract: Pick<RentalContract, "monthly_price" | "duration_months">;
}

export interface PaymentWithDetails extends Payment {
  invoice: Pick<Invoice, "invoice_number" | "period_start" | "period_end">;
  tenant: Pick<Tenant, "full_name">;
}

export interface DashboardStats {
  total_rooms: number;
  rooms_by_status: { status: RoomStatus; count: number }[];
  total_tenants: number;
  active_tenants: number;
  monthly_income: number;
  monthly_expense: number;
  overdue_count: number;
  overdue_total: number;
  occupancy_rate: number;
}

export interface MonthlyReport {
  month: string;
  income: number;
  expense: number;
  profit: number;
  occupancy_rate: number;
}
