-- Migration: Menambahkan kolom about_philosophy dan about_highlights ke tabel profiles
-- Tanggal: 2026-10-24

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS about_philosophy TEXT;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS about_highlights JSONB DEFAULT '[]'::jsonb;
