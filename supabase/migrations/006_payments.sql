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
