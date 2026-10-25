-- Migration: Tambah policy Public Insert pada contact_messages dan kolom instagram_url pada profiles
-- Tanggal: 2026-10-24

-- 1. Beri izin publik (anon/visitor) untuk mengirim pesan ke tabel contact_messages
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'contact_messages' AND policyname = 'Public insert'
  ) THEN
    CREATE POLICY "Public insert" ON public.contact_messages 
    FOR INSERT 
    WITH CHECK (true);
  END IF;
END
$$;

-- 2. Tambah kolom instagram_url ke tabel profiles jika belum ada
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS instagram_url TEXT;
