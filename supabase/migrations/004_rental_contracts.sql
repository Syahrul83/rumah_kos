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
