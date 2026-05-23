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
