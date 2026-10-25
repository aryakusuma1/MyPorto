-- ==============================================================================
-- Migration: Tambah Kolom about_photo_url (profiles) dan photos (experiences)
-- Sesuai dengan spesifikasi SDD (docs/specs/requirements.md & tasks.md)
-- ==============================================================================

-- 1. Tambah kolom about_photo_url pada tabel public.profiles untuk foto khusus Section Tentang Saya
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS about_photo_url TEXT;

-- 2. Tambah kolom photos (array TEXT) pada tabel public.experiences untuk galeri 1 s/d 4 foto mini
ALTER TABLE public.experiences 
ADD COLUMN IF NOT EXISTS photos TEXT[] DEFAULT '{}';
