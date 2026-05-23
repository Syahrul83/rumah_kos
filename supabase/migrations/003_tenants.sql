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
