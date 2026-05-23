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
