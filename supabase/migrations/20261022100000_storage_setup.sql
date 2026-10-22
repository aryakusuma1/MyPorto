-- ==============================================================================
-- Storage Bucket & RLS Policies for Portfolio Images
-- ==============================================================================

-- 1. Pastikan bucket 'portfolio-images' terdaftar dan bersifat public
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio-images', 'portfolio-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Kebijakan RLS untuk storage.objects
-- Izinkan publik untuk membaca/melihat gambar
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'portfolio-images' );

-- Izinkan pengguna terotentikasi (Admin) untuk mengunggah gambar
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'portfolio-images' );

-- Izinkan pengguna terotentikasi (Admin) untuk memperbarui gambar
DROP POLICY IF EXISTS "Authenticated users can update" ON storage.objects;
CREATE POLICY "Authenticated users can update"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'portfolio-images' );

-- Izinkan pengguna terotentikasi (Admin) untuk menghapus gambar
DROP POLICY IF EXISTS "Authenticated users can delete" ON storage.objects;
CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'portfolio-images' );
