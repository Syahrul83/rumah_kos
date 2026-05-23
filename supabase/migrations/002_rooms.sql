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
