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
