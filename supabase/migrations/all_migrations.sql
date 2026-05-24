-- ============================================================
-- FILE: 001_profiles.sql
-- ============================================================
-- 001: profiles table + auto-create trigger
-- Run in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'penghuni' CHECK (role IN ('super_admin', 'admin', 'penghuni')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  deactivated_reason TEXT,
  deactivated_at TIMESTAMPTZ,
  deactivated_by UUID REFERENCES public.profiles(id),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_role ON public.profiles(role);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto-create profile after signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'penghuni'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();



-- ============================================================
-- FILE: 002_rooms.sql
-- ============================================================
-- 002: rooms table

CREATE TABLE IF NOT EXISTS public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  price INTEGER NOT NULL CHECK (price >= 100000),
  floor INTEGER NOT NULL DEFAULT 1 CHECK (floor >= 1),
  status TEXT NOT NULL DEFAULT 'tersedia' CHECK (status IN ('tersedia', 'terisi', 'perbaikan')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_rooms_status ON public.rooms(status);

CREATE TRIGGER set_rooms_updated_at
  BEFORE UPDATE ON public.rooms
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();



-- ============================================================
-- FILE: 003_tenants.sql
-- ============================================================
-- 003: tenants table

CREATE TABLE IF NOT EXISTS public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES public.profiles(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  identity_number TEXT,
  emergency_contact TEXT,
  address TEXT,
  status TEXT NOT NULL DEFAULT 'tidak_aktif' CHECK (status IN ('aktif', 'tidak_aktif')),
  check_in_date DATE,
  check_out_date DATE,
  room_id UUID REFERENCES public.rooms(id) ON DELETE SET NULL,
  is_blacklisted BOOLEAN NOT NULL DEFAULT false,
  blacklist_reason TEXT,
  blacklisted_at TIMESTAMPTZ,
  blacklisted_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_tenants_status ON public.tenants(status);
CREATE INDEX idx_tenants_room_id ON public.tenants(room_id);
CREATE INDEX idx_tenants_user_id ON public.tenants(user_id);

CREATE TRIGGER set_tenants_updated_at
  BEFORE UPDATE ON public.tenants
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();



-- ============================================================
-- FILE: 004_rental_contracts.sql
-- ============================================================
-- 004: rental_contracts table

CREATE TABLE IF NOT EXISTS public.rental_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE RESTRICT,
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE RESTRICT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  duration_months INTEGER NOT NULL CHECK (duration_months >= 1),
  monthly_price INTEGER NOT NULL CHECK (monthly_price >= 100000),
  deposit INTEGER NOT NULL DEFAULT 0 CHECK (deposit >= 0),
  status TEXT NOT NULL DEFAULT 'aktif' CHECK (status IN ('aktif', 'selesai', 'dibatalkan')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT valid_date_range CHECK (end_date > start_date)
);

CREATE INDEX idx_rental_contracts_tenant ON public.rental_contracts(tenant_id);
CREATE INDEX idx_rental_contracts_room ON public.rental_contracts(room_id);
CREATE INDEX idx_rental_contracts_status ON public.rental_contracts(status);

CREATE TRIGGER set_rental_contracts_updated_at
  BEFORE UPDATE ON public.rental_contracts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();



-- ============================================================
-- FILE: 005_invoices.sql
-- ============================================================
-- 005: invoices table

CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES public.rental_contracts(id) ON DELETE RESTRICT,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE RESTRICT,
  invoice_number TEXT NOT NULL UNIQUE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  amount INTEGER NOT NULL CHECK (amount > 0),
  fine_amount INTEGER NOT NULL DEFAULT 0 CHECK (fine_amount >= 0),
  total_amount INTEGER NOT NULL CHECK (total_amount >= 0),
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'unpaid'
    CHECK (status IN ('unpaid', 'paid', 'overdue', 'pending_payment', 'cancelled')),
  notes TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT valid_period CHECK (period_end >= period_start),
  CONSTRAINT unique_period UNIQUE (contract_id, period_start)
);

CREATE INDEX idx_invoices_status ON public.invoices(status);
CREATE INDEX idx_invoices_tenant ON public.invoices(tenant_id);
CREATE INDEX idx_invoices_contract ON public.invoices(contract_id);
CREATE INDEX idx_invoices_due_date ON public.invoices(due_date);

CREATE TRIGGER set_invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();



-- ============================================================
-- FILE: 006_payments.sql
-- ============================================================
-- 006: payments table

CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE RESTRICT,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE RESTRICT,
  amount INTEGER NOT NULL CHECK (amount > 0),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'transfer', 'midtrans')),
  midtrans_transaction_id TEXT UNIQUE,
  midtrans_order_id TEXT,
  payment_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'settlement'
    CHECK (status IN ('pending', 'settlement', 'failed', 'refund')),
  proof_image TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_payments_invoice ON public.payments(invoice_id);
CREATE INDEX idx_payments_tenant ON public.payments(tenant_id);
CREATE INDEX idx_payments_status ON public.payments(status);
CREATE INDEX idx_payments_date ON public.payments(payment_date);

CREATE TRIGGER set_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();



-- ============================================================
-- FILE: 007_expenses.sql
-- ============================================================
-- 007: expenses table

CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  description TEXT NOT NULL,
  amount INTEGER NOT NULL CHECK (amount >= 1000),
  category TEXT NOT NULL
    CHECK (category IN ('listrik', 'air', 'kebersihan', 'perbaikan', 'gaji', 'internet', 'keamanan', 'lainnya')),
  custom_category TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  proof_image TEXT,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_expenses_date ON public.expenses(date);
CREATE INDEX idx_expenses_category ON public.expenses(category);
CREATE INDEX idx_expenses_created_by ON public.expenses(created_by);



-- ============================================================
-- FILE: 008_notifications.sql
-- ============================================================
-- 008: notifications table

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info'
    CHECK (type IN ('info', 'warning', 'payment', 'success')),
  is_read BOOLEAN NOT NULL DEFAULT false,
  link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(user_id, is_read);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;



-- ============================================================
-- FILE: 009_settings.sql
-- ============================================================
-- 009: settings table

CREATE TABLE IF NOT EXISTS public.settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Default settings
INSERT INTO public.settings (key, value, description) VALUES
  ('fine_method', 'fixed', 'Metode denda: fixed atau percentage'),
  ('fine_fixed_daily', '5000', 'Denda tetap per hari dalam Rupiah'),
  ('fine_percentage_daily', '2', 'Persentase denda per hari dari harga sewa'),
  ('grace_period_days', '3', 'Masa tenggang setelah jatuh tempo (hari)'),
  ('generate_day', '1', 'Tanggal generate invoice setiap bulan (1-28)'),
  ('due_day', '10', 'Tanggal jatuh tempo invoice setiap bulan (1-28)'),
  ('kost_name', 'Kost Bahagia', 'Nama kost'),
  ('kost_address', 'Jl. Merdeka No. 123', 'Alamat kost'),
  ('kost_phone', '08123456789', 'No telepon kost'),
  ('kost_code', 'KOS001', 'Kode unik kost untuk prefix invoice'),
  ('midtrans_mode', 'sandbox', 'Midtrans mode: sandbox atau production'),
  ('midtrans_enabled_payments', 'bca_va,bni_va,bri_va,mandiri_va,gopay,dana,ovo,shopeepay',
   'Metode pembayaran Midtrans yang diaktifkan');



-- ============================================================
-- FILE: 010_audit_logs.sql
-- ============================================================
-- 010: audit_logs table

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id TEXT,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_table ON public.audit_logs(table_name);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at);



-- ============================================================
-- FILE: 011_rls_policies.sql
-- ============================================================
-- 011: Row Level Security (RLS) policies for all tables

-- Helper function to get current user role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Helper: check if user is active
CREATE OR REPLACE FUNCTION public.is_user_active()
RETURNS BOOLEAN AS $$
  SELECT is_active FROM public.profiles WHERE user_id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- â”€â”€â”€ PROFILES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.get_user_role() IN ('super_admin', 'admin'));

CREATE POLICY "Super admin can insert profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (public.get_user_role() = 'super_admin');

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Super admin can update any profile"
  ON public.profiles FOR UPDATE
  USING (public.get_user_role() = 'super_admin')
  WITH CHECK (public.get_user_role() = 'super_admin');

CREATE POLICY "Super admin can delete profiles"
  ON public.profiles FOR DELETE
  USING (public.get_user_role() = 'super_admin');

-- â”€â”€â”€ ROOMS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated can view rooms"
  ON public.rooms FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage rooms"
  ON public.rooms FOR INSERT
  WITH CHECK (public.get_user_role() IN ('super_admin', 'admin') AND public.is_user_active());

CREATE POLICY "Admins can update rooms"
  ON public.rooms FOR UPDATE
  USING (public.get_user_role() IN ('super_admin', 'admin') AND public.is_user_active());

CREATE POLICY "Super admin can delete rooms"
  ON public.rooms FOR DELETE
  USING (public.get_user_role() = 'super_admin' AND public.is_user_active());

-- â”€â”€â”€ TENANTS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all tenants"
  ON public.tenants FOR SELECT
  USING (public.get_user_role() IN ('super_admin', 'admin'));

CREATE POLICY "Tenants can view own record"
  ON public.tenants FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage tenants"
  ON public.tenants FOR INSERT
  WITH CHECK (public.get_user_role() IN ('super_admin', 'admin') AND public.is_user_active());

CREATE POLICY "Admins can update tenants"
  ON public.tenants FOR UPDATE
  USING (public.get_user_role() IN ('super_admin', 'admin') AND public.is_user_active());

CREATE POLICY "Super admin can delete tenants"
  ON public.tenants FOR DELETE
  USING (public.get_user_role() = 'super_admin' AND public.is_user_active());

-- â”€â”€â”€ RENTAL CONTRACTS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
ALTER TABLE public.rental_contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all contracts"
  ON public.rental_contracts FOR SELECT
  USING (public.get_user_role() IN ('super_admin', 'admin'));

CREATE POLICY "Tenants can view own contracts"
  ON public.rental_contracts FOR SELECT
  USING (tenant_id IN (SELECT id FROM public.tenants WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage contracts"
  ON public.rental_contracts FOR INSERT
  WITH CHECK (public.get_user_role() IN ('super_admin', 'admin') AND public.is_user_active());

CREATE POLICY "Admins can update contracts"
  ON public.rental_contracts FOR UPDATE
  USING (public.get_user_role() IN ('super_admin', 'admin') AND public.is_user_active());

CREATE POLICY "Super admin can delete contracts"
  ON public.rental_contracts FOR DELETE
  USING (public.get_user_role() = 'super_admin' AND public.is_user_active());

-- â”€â”€â”€ INVOICES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all invoices"
  ON public.invoices FOR SELECT
  USING (public.get_user_role() IN ('super_admin', 'admin'));

CREATE POLICY "Tenants can view own invoices"
  ON public.invoices FOR SELECT
  USING (tenant_id IN (SELECT id FROM public.tenants WHERE user_id = auth.uid()));

CREATE POLICY "Admins can insert invoices"
  ON public.invoices FOR INSERT
  WITH CHECK (public.get_user_role() IN ('super_admin', 'admin') AND public.is_user_active());

CREATE POLICY "Admins can update invoices"
  ON public.invoices FOR UPDATE
  USING (public.get_user_role() IN ('super_admin', 'admin') AND public.is_user_active());

CREATE POLICY "Super admin can delete invoices"
  ON public.invoices FOR DELETE
  USING (public.get_user_role() = 'super_admin' AND public.is_user_active());

-- â”€â”€â”€ PAYMENTS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all payments"
  ON public.payments FOR SELECT
  USING (public.get_user_role() IN ('super_admin', 'admin'));

CREATE POLICY "Tenants can view own payments"
  ON public.payments FOR SELECT
  USING (tenant_id IN (SELECT id FROM public.tenants WHERE user_id = auth.uid()));

CREATE POLICY "Admins can record payments"
  ON public.payments FOR INSERT
  WITH CHECK (public.get_user_role() IN ('super_admin', 'admin') AND public.is_user_active());

CREATE POLICY "Admins can update payments"
  ON public.payments FOR UPDATE
  USING (public.get_user_role() IN ('super_admin', 'admin') AND public.is_user_active());

CREATE POLICY "Super admin can delete payments"
  ON public.payments FOR DELETE
  USING (public.get_user_role() = 'super_admin' AND public.is_user_active());

-- â”€â”€â”€ EXPENSES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all expenses"
  ON public.expenses FOR SELECT
  USING (public.get_user_role() IN ('super_admin', 'admin'));

CREATE POLICY "Admins can manage expenses"
  ON public.expenses FOR INSERT
  WITH CHECK (public.get_user_role() IN ('super_admin', 'admin') AND public.is_user_active());

CREATE POLICY "Admins can update expenses"
  ON public.expenses FOR UPDATE
  USING (public.get_user_role() IN ('super_admin', 'admin') AND public.is_user_active());

CREATE POLICY "Admins can delete expenses"
  ON public.expenses FOR DELETE
  USING (public.get_user_role() IN ('super_admin', 'admin') AND public.is_user_active());

-- â”€â”€â”€ NOTIFICATIONS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "System can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own notifications"
  ON public.notifications FOR DELETE
  USING (user_id = auth.uid());

-- â”€â”€â”€ SETTINGS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated can view settings"
  ON public.settings FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Super admin can manage settings"
  ON public.settings FOR INSERT
  WITH CHECK (public.get_user_role() = 'super_admin' AND public.is_user_active());

CREATE POLICY "Super admin can update settings"
  ON public.settings FOR UPDATE
  USING (public.get_user_role() = 'super_admin' AND public.is_user_active());

CREATE POLICY "Super admin can delete settings"
  ON public.settings FOR DELETE
  USING (public.get_user_role() = 'super_admin' AND public.is_user_active());

-- â”€â”€â”€ AUDIT LOGS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs"
  ON public.audit_logs FOR SELECT
  USING (public.get_user_role() IN ('super_admin', 'admin'));

CREATE POLICY "System can insert audit logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (true);


