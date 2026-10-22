# Implementation Plan: Web Portfolio Personal

## Gambaran Umum

Implementasi dilakukan secara bertahap: dimulai dari setup proyek dan koneksi Supabase, dilanjutkan pembangunan database, kemudian halaman publik section per section, lalu halaman detail, dan diakhiri dengan admin panel.

---

## Tasks

- [x] 1. Setup proyek dan konfigurasi awal
  - [x] 1.1 Inisialisasi proyek Vue 3 + Vite
    - Jalankan `npm create vite@latest . -- --template vue` di dalam folder `Portofolio Arya`
    - Install dependensi inti: `npm install vue-router@4 pinia @supabase/supabase-js lucide-vue-next`
    - Install dependensi styling: `npm install -D tailwindcss postcss autoprefixer` dan `npx tailwindcss init -p`
    - _Requirements: —_
    - Verifikasi: `npm run dev` berjalan tanpa error

  - [x] 1.2 Konfigurasi Tailwind CSS
    - Tambahkan direktif `@tailwind` ke `src/styles/main.css`
    - Daftarkan custom color token (surface, accent, ink, border) di `tailwind.config.js`
    - Import Google Fonts (Outfit, Inter) via `@import` di `main.css`
    - Daftarkan `fontFamily` custom di `tailwind.config.js`
    - _Requirements: —_
    - Verifikasi: class `bg-surface text-ink` bekerja di komponen

  - [x] 1.3 Setup Vue Router
    - Buat `src/router/index.js` dengan semua route sesuai design.md §2
    - Daftarkan navigation guard untuk semua route `/admin/*`
    - Pasang router di `src/main.js`
    - _Requirements: 1.1, 11.1_
    - Verifikasi: navigasi ke `/`, `/admin/login` berfungsi

  - [x] 1.4 Setup Pinia dan Supabase client
    - Buat `src/lib/supabase.js` dengan `createClient` menggunakan variabel env
    - Buat file `.env` dan `.env.example` dengan `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY`
    - Pasang Pinia di `src/main.js`
    - Buat `src/stores/auth.store.js` dengan state `session` dan action `initAuth()`
    - Panggil `initAuth()` di `App.vue` saat mounted
    - _Requirements: 11.1_
    - Verifikasi: tidak ada error console saat app dimuat

- [x] 2. Setup database Supabase via Migration CLI
  - [x] 2.1 Inisialisasi Supabase CLI dan berkas migrasi
    - Jalankan `npx supabase init` di root proyek untuk membuat struktur folder `supabase/migrations/`
    - Buat berkas migrasi `supabase/migrations/<timestamp>_init_schema.sql` memuat seluruh DDL dari design.md § 3 dan RLS dari design.md § 4 tanpa mengubah struktur data yang direncanakan
    - _Requirements: -_
    - Verifikasi: berkas migrasi tersimpan rapi di repositori git

  - [x] 2.2 Hubungkan ke proyek Supabase dan terapkan migrasi
    - Hubungkan proyek via `npx supabase link --project-ref <project-id>`
    - Jalankan `npx supabase db push` untuk mengeksekusi migrasi ke database Supabase Cloud
    - _Requirements: 11.1, 12.1_
    - Verifikasi: semua tabel dan kebijakan RLS aktif di Supabase Table Editor

  - [x] 2.3 Buat Supabase Storage buckets
    - Buat bucket `portfolio-images` (public) dan `documents` (private) via Supabase Dashboard / Storage
    - Tambahkan RLS policy: public dapat membaca `portfolio-images`; hanya admin yang dapat upload/delete
    - _Requirements: 12.4_
    - Verifikasi: upload gambar berhasil dari admin, URL publik dapat diakses

- [x] 3. Komponen UI dasar
  - [x] 3.1 Buat `src/components/ui/BaseButton.vue`
    - Props: `variant` ('primary' | 'secondary' | 'ghost'), `size` ('sm' | 'md' | 'lg'), `disabled`, `loading`
    - Emit: `click`
    - _Requirements: —_

  - [x] 3.2 Buat `src/components/ui/BaseCard.vue`
    - Props: `hoverable` (boolean)
    - Slot: default
    - _Requirements: —_

  - [x] 3.3 Buat `src/components/ui/BaseBadge.vue`
    - Props: `label` (string), `variant` ('default' | 'accent')
    - _Requirements: —_

  - [x] 3.4 Buat `src/components/ui/SectionTitle.vue`
    - Props: `tag` (string), `title` (string), `subtitle` (string, optional)
    - _Requirements: —_

  - [x] 3.5 Buat `src/components/ui/SkeletonLoader.vue`
    - Props: `type` ('card' | 'text' | 'avatar'), `count` (number)
    - Gunakan `animate-pulse` dari Tailwind
    - _Requirements: 5.5, 8.4_

  - [x] 3.6 Buat `src/components/layout/AppNavbar.vue`
    - Sticky top, blur backdrop
    - Daftar tautan navigasi ke semua section
    - State aktif berdasarkan scroll (gunakan composable `useScrollSpy`)
    - Hamburger menu untuk layar kecil
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_
    - Verifikasi: smooth scroll bekerja; tautan aktif berubah saat scroll

  - [x] 3.7 Buat `src/composables/useScrollSpy.js`
    - Gunakan `IntersectionObserver` untuk mendeteksi section aktif
    - Return: `{ activeSection }` (ref berisi id section aktif)
    - _Requirements: 1.4_

  - [x] 3.8 Buat `src/composables/useIntersection.js`
    - Gunakan `IntersectionObserver` untuk memicu animasi fade-in saat elemen masuk viewport
    - Return: `{ observe }` (fungsi yang menerima elemen ref)
    - _Requirements: 4.3_

- [x] 4. Halaman utama — section publik
  - [x] 4.1 Buat `HeroSection.vue`
    - Fetch data profil dari `profile.store.js`
    - Tampilkan nama, title (dengan typing effect sederhana), tagline, foto
    - Tombol CTA scroll ke `#projects` dan `#footer`
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [x] 4.2 Buat `profile.store.js` dengan action `fetchProfile()`
    - Query: `supabase.from('profiles').select('*').single()`
    - _Requirements: 2.1, 3.1_

  - [x] 4.3 Buat `AboutSection.vue`
    - Tampilkan foto, bio, fakta-fakta
    - Tombol download CV — tersembunyi jika `cv_url` null
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [x] 4.4 Buat `skill.store.js` dengan action `fetchSkills()`
    - Query: `supabase.from('skills').select('*').order('category').order('sort_order')`
    - _Requirements: 4.1_

  - [x] 4.5 Buat `SkillsSection.vue`
    - Kelompokkan skills per kategori menggunakan computed
    - Tampilkan indikator level dengan animasi saat masuk viewport
    - _Requirements: 4.1, 4.2, 4.3_

  - [x] 4.6 Buat `project.store.js` dengan action `fetchProjects()`
    - Query: `supabase.from('projects').select('id,title,slug,short_desc,cover_url,tech_stack,category,status,featured').order('sort_order')`
    - _Requirements: 5.1_

  - [x] 4.7 Buat `src/components/project/ProjectCard.vue`
    - Props: `project` (object)
    - Emit: `click` dengan slug project
    - Tampilkan: cover, judul, deskripsi singkat, badge tech stack
    - _Requirements: 5.2_

  - [x] 4.8 Buat `ProjectsSection.vue`
    - Tampilkan skeleton saat loading, ProjectCard saat data tersedia, pesan kosong jika tidak ada data
    - Klik card → navigate ke `/projects/:slug`
    - _Requirements: 5.1, 5.3, 5.4, 5.5_

  - [x] 4.9 Buat `experience.store.js` dengan action `fetchExperiences()`
    - Query: `supabase.from('experiences').select('*').order('start_date', { ascending: false })`
    - _Requirements: 7.1_

  - [x] 4.10 Buat `ExperienceSection.vue`
    - Tampilkan timeline vertikal, bedakan tipe `work` dan `education` secara visual
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [x] 4.11 Buat `certificate.store.js` dengan action `fetchCertificates()`
    - Query: `supabase.from('certificates').select('*').order('sort_order')`
    - _Requirements: 8.1_

  - [x] 4.12 Buat `src/components/certificate/CertificateCard.vue`
    - Props: `certificate` (object)
    - Tampilkan: thumbnail, nama, issuer, tanggal
    - _Requirements: 8.2_

  - [x] 4.13 Buat `CertificatesSection.vue`
    - Tampilkan skeleton saat loading, CertificateCard saat data tersedia
    - Klik card → navigate ke `/certificates/:id`
    - _Requirements: 8.1, 8.3, 8.4_

  - [x] 4.14 Buat `ContactSection.vue` (Footer)
    - Tampilkan tautan email, LinkedIn, GitHub
    - Teks copyright dengan tahun dinamis
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

  - [x] 4.15 Rakit semua section di `HomeView.vue`
    - Import dan render semua section dengan id yang sesuai (#hero, #about, dst)
    - _Requirements: 1.1_
    - Verifikasi: semua section tampil, navbar scroll spy bekerja

- [x] 5. Checkpoint — Halaman publik
  - Pastikan semua section tampil dengan data dari Supabase
  - Pastikan skeleton loading tampil saat data belum tersedia
  - Pastikan navigasi navbar bekerja dengan smooth scroll
  - Tanya pemilik jika ada yang perlu disesuaikan sebelum melanjutkan

- [x] 6. Halaman detail
  - [x] 6.1 Tambahkan action `fetchProjectBySlug(slug)` di `project.store.js`
    - Query: `supabase.from('projects').select('*, project_details(*)').eq('slug', slug).single()`
    - _Requirements: 6.1_

  - [x] 6.2 Buat `ProjectDetailView.vue`
    - Ambil slug dari `$route.params.slug`
    - Tampilkan semua field dari design.md §2 (overview, tech stack, arsitektur, fitur, tantangan, screenshots, tautan)
    - Tombol kembali ke `/#projects`
    - Redirect ke 404 jika slug tidak ditemukan
    - _Requirements: 6.1, 6.2, 6.3_

  - [x] 6.3 Tambahkan action `fetchCertificateById(id)` di `certificate.store.js`
    - Query: `supabase.from('certificates').select('*').eq('id', id).single()`
    - _Requirements: 9.1_

  - [x] 6.4 Buat `CertificateDetailView.vue`
    - Ambil id dari `$route.params.id`
    - Tampilkan gambar, nama, issuer, tanggal, kategori, deskripsi, tautan verifikasi
    - Tombol kembali ke `/#certificates`
    - _Requirements: 9.1, 9.2, 9.3_

- [x] 7. Admin panel
  - [x] 7.1 Buat `LoginView.vue`
    - Form email & password
    - Panggil `auth.store.signIn()` saat submit
    - Tampilkan error jika gagal
    - Redirect ke `/admin/dashboard` jika berhasil
    - _Requirements: 11.2, 11.3, 11.4, 11.5_

  - [x] 7.2 Buat `AdminLayout.vue` dengan `AdminSidebar.vue`
    - Sidebar dengan menu navigasi antar halaman admin
    - Tombol Keluar yang memanggil `auth.store.signOut()`
    - _Requirements: 11.6_

  - [x] 7.3 Buat `ImageUploader.vue`
    - Props: `bucket`, `path`, `currentUrl`
    - Upload file ke Supabase Storage, emit URL publik setelah berhasil
    - _Requirements: 12.4_

  - [x] 7.4 Buat CRUD Projects (`ProjectsView.vue` + `ProjectForm.vue`)
    - Daftar semua project dengan tombol Edit dan Hapus
    - Form tambah/edit: title, slug (auto-generate dari title), short_desc, tech_stack, category, status, featured, cover_url, github_url, demo_url
    - Tab terpisah untuk mengisi project_details (overview, architecture, diagram, features, challenges, screenshots)
    - Konfirmasi sebelum hapus
    - _Requirements: 12.1, 12.2, 12.3, 12.4_

  - [x] 7.5 Buat CRUD Certificates (`CertificatesView.vue` + `CertificateForm.vue`)
    - Daftar semua sertifikat dengan tombol Edit dan Hapus
    - Form: title, issuer, issue_date, expiry_date, credential_url, image_url, category, description
    - _Requirements: 12.1, 12.2, 12.3, 12.4_

  - [x] 7.6 Buat CRUD Skills (`SkillsView.vue` + `SkillForm.vue`)
    - Daftar semua skill dengan tombol Edit dan Hapus
    - Form: name, category, level, sort_order
    - _Requirements: 12.1, 12.2, 12.3_

  - [x] 7.7 Buat CRUD Experience & Education (`ExperienceView.vue` + `ExperienceForm.vue`)
    - Daftar semua entri dengan tombol Edit dan Hapus
    - Form: company, role, type (work/education), start_date, end_date, description
    - _Requirements: 12.1, 12.2, 12.3_

  - [x] 7.8 Buat halaman pesan masuk (`MessagesView.vue`)
    - Daftar semua pesan dengan status baca/belum
    - Klik pesan untuk melihat detail dan menandai sudah dibaca
    - _Requirements: 12.5, 12.6_

- [ ] 8. Checkpoint akhir — Polish & Deploy
  - Periksa tampilan responsif di mobile, tablet, desktop
  - Periksa konsistensi warna, spacing, dan tipografi
  - Pastikan semua navigation guard admin bekerja
  - Pastikan dark/light mode toggle bekerja
  - Deploy ke Vercel dengan environment variables yang benar
  - _Requirements: semua_

---

## Notes

- Setiap action di Pinia store harus menangani loading state dan error state
- Slug project di-generate otomatis dari title menggunakan `slugify` (lowercase + replace spasi dengan `-`)
- Urutan task mengikuti dependency: store harus ada sebelum komponen yang menggunakannya
- Checkpoint di task 5 adalah momen tinjauan bersama sebelum mengerjakan detail page dan admin

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["1.3", "1.4"] },
    { "id": 2, "tasks": ["2.1"] },
    { "id": 3, "tasks": ["2.2", "2.3"] },
    { "id": 4, "tasks": ["3.1", "3.2", "3.3", "3.4", "3.5"] },
    { "id": 5, "tasks": ["3.6", "3.7", "3.8"] },
    { "id": 6, "tasks": ["4.2", "4.4", "4.6", "4.9", "4.11"] },
    { "id": 7, "tasks": ["4.1", "4.3", "4.5", "4.7", "4.10", "4.12"] },
    { "id": 8, "tasks": ["4.8", "4.13", "4.14"] },
    { "id": 9, "tasks": ["4.15", "5"] },
    { "id": 10, "tasks": ["6.1", "6.3"] },
    { "id": 11, "tasks": ["6.2", "6.4"] },
    { "id": 12, "tasks": ["7.1", "7.3"] },
    { "id": 13, "tasks": ["7.2"] },
    { "id": 14, "tasks": ["7.4", "7.5", "7.6", "7.7", "7.8"] },
    { "id": 15, "tasks": ["8"] }
  ]
}
```

