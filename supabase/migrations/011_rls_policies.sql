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

-- ─── PROFILES ─────────────────────────────────────────────
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

-- ─── ROOMS ────────────────────────────────────────────────
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

-- ─── TENANTS ──────────────────────────────────────────────
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

-- ─── RENTAL CONTRACTS ─────────────────────────────────────
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

-- ─── INVOICES ─────────────────────────────────────────────
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

-- ─── PAYMENTS ─────────────────────────────────────────────
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

-- ─── EXPENSES ─────────────────────────────────────────────
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

-- ─── NOTIFICATIONS ────────────────────────────────────────
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

-- ─── SETTINGS ─────────────────────────────────────────────
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

-- ─── AUDIT LOGS ───────────────────────────────────────────
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs"
  ON public.audit_logs FOR SELECT
  USING (public.get_user_role() IN ('super_admin', 'admin'));

CREATE POLICY "System can insert audit logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (true);
