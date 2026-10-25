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
    - _Requirements: 12.7, 12.8_

  - [x] 7.9 Buat migrasi database Supabase untuk kolom `about_photo_url` pada tabel `profiles` dan `photos TEXT[]` pada tabel `experiences`
    - _Requirements: 3.1, 7.7, 12.2, 12.3_

  - [x] 7.10 Buat komponen Multi-Image Uploader (maksimal 4 foto mini) dan integrasikan pada `ExperienceForm.vue`
    - Pratinjau thumbnail 1 s/d 4 foto, upload ke folder `experiences/`, dan tombol hapus individual per foto
    - _Requirements: 7.7, 12.3_

  - [x] 7.11 Buat halaman Admin Profil (`ProfileView.vue`) untuk kelola biodata, foto Hero (`photo_url`), foto Tentang Saya (`about_photo_url`), dan CV PDF (`cv_url`)
    - Tambahkan rute `/admin/profile` dan menu navigasi pada `AdminSidebar.vue`
    - _Requirements: 3.1, 12.1, 12.2_

  - [x] 7.12 Buat komponen ImageCropperModal.vue dan integrasikan pada ImageUploader.vue dan MultiImageUploader.vue
    - Modal interaktif dengan pan/drag posisi foto, zoom slider, preset rasio aspek (16:9, 4:3, 3:4, 1:1, Free), dan canvas export
    - Berfungsi universal di semua upload foto admin: Profil (Hero & About), Projects (Cover & Screenshot), Certificates, dan Experience (Pendidikan & Pekerjaan)
    - _Requirements: 12.4, 12.9_

  - [x] 7.13 Perbaiki styling modal SkillForm.vue dan card SkillsView.vue agar berlatar belakang solid (`bg-surface-alt`) konsisten dengan CRUD lainnya
    - _Requirements: 12.4_

  - [x] 7.14 Tambahkan tombol penataan urutan foto (Geser Kiri ◀ / Geser Kanan ▶) pada MultiImageUploader.vue
    - Memungkinkan admin menukar urutan foto #1, #2, #3, #4 secara instan tanpa perlu hapus dan upload ulang
    - _Requirements: 12.3_

  - [x] 7.15 Terapkan pengurutan `sort_order` pada Pengalaman & Pendidikan dengan tombol Naikkan (▲) dan Turunkan (▼) di Admin
    - Urutkan entri di frontend & store berdasarkan `sort_order ASC, start_date DESC` agar entri yang ingin di atas tidak tergantung tanggal
    - _Requirements: 12.5_

  - [x] 7.16 Pisahkan CRUD Pengalaman Kerja (`ExperienceView.vue`) dan Pendidikan Formal (`EducationView.vue`) di Admin Panel
    - Tambahkan rute `/admin/education` dan navigasi menu terpisah di `AdminSidebar.vue`
    - _Requirements: 12.1_

  - [x] 7.17 Susun ulang urutan navigasi `AdminSidebar.vue`: Dashboard -> Profil -> Pendidikan -> Pengalaman -> Skills -> Projects -> Certificates -> Pesan Masuk
    - _Requirements: 12.1_

  - [x] 7.18 Hapus toggle kategori manual pada `ExperienceForm.vue` dan jadikan judul/label/placeholder otomatis menyesuaikan konteks (`education` vs `work`)
    - _Requirements: 12.3_

  - [x] 7.19 Terapkan kontrol penataan urutan posisi (Naikkan ▲ / Turunkan ▼) dan `sort_order` pada CRUD Admin Skills (`SkillsView.vue`), Projects (`ProjectsView.vue`, `ProjectForm.vue`), dan Certificates (`CertificatesView.vue`)
    - _Requirements: 12.5_

- [ ] 8. Checkpoint akhir - Polish & Deploy
  - [x] 8.1 Reset scroll ke Hero saat refresh (manual scroll restoration & router reset)
  - [x] 8.2 Terapkan Staggered Entrance Animation & Scale-in Glow pada Hero Section
  - [x] 8.3 Terapkan Page Entrance & Scroll Reveal Animation pada Halaman Detail (Projects & Certificates)
  - [x] 8.4 Tambahkan foto potret terpisah pada Section About (about_photo_url & layout 2 kolom visual)
  - [x] 8.5 Restrukturisasi Section Journey dengan Tab Switcher (Tab 1: Pendidikan, Tab 2: Pengalaman, Tab 3: Keahlian)
  - [x] 8.6 Perbaiki posisi vertikal foto agar benar-benar berada di tengah kartu (flex-1 flex items-center tanpa konflik space-y) dengan badge kalender tetap terkunci di baris paling atas sejajar judul
  - [x] 8.7 Terapkan modern squircle icon grid dengan subtle glow pada tab Keahlian Teknis
  - [x] 8.8 Perbarui tautan navigasi navbar utama untuk merujuk ke Section Journey
  - [x] 8.13 Bangun Interactive 3D Coverflow Showcase Carousel pada `ProjectsSection.vue` (slider horizontal, active center card, detail view di bawah, tombol navigasi ◀ ▶, dots, dan touch swipe)
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [x] 8.14 Bangun Interactive 3D Coverflow Showcase Carousel pada `CertificatesSection.vue` (slider horizontal, active center card, detail view di bawah, tombol navigasi ◀ ▶, dots, dan touch swipe)
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_
  - [x] 8.15 Optimasi Spacing & Flat Stack Showcase Gallery (ProjectsSection.vue dan CertificatesSection.vue): rapatkan jarak vertikal dari judul section, pindahkan pagination dots tepat di bawah gambar, dan limit deskripsi line-clamp-2
    - _Requirements: 5.1, 8.1_
  - [x] 8.16 Bangun Kontak Section 2-Kolom & Dual-Delivery Messaging (`ContactSection.vue`): List kontak (Email, GitHub, LinkedIn, Instagram) di kolom kiri, Formulir kirim pesan interaktif di kolom kanan, integrasi pengiriman email instan + arsip Supabase `contact_messages`, dan field Instagram di `ProfileView.vue`
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8, 10.9_

  - [x] 8.17 Optimasi & Penyelarasan Ketinggian Kartu Formulir Kontak (`ContactSection.vue`): Sejajarkan tinggi kartu formulir pesan dengan list kontak dan tulisan pengantar di kolom kiri (*equal-height symmetry*), terapkan grid 2-kolom untuk input nama & email, kurangi padding berlebih, dan rampingkan textarea agar tertata rapi
    - _Requirements: 10.1, 10.2, 10.9_

  - [x] 8.18 Refaktor CRUD Skill ke List Layout, Standarisasi Modal Pesan Masuk, dan Global Sort Order (`SkillsView.vue`, `SkillForm.vue`, `MessagesView.vue`, `skill.store.js`):
    - Ubah kartu modal pesan masuk admin dari transparan/bening menjadi solid konsisten (`bg-surface-alt`, `bg-black/80 backdrop-blur-sm`).
    - Ubah tampilan CRUD Skill dari kartu 3-kolom menjadi tabel list baris yang kompak dan mudah diatur urutannya.
    - Perbaiki logika pengurutan skill: inisialisasi nomor urut sekuensial global (1..N) di database, terapkan sorting berdasarkan `sort_order` di store dan frontend, serta hapus batasan scoped helper text "dalam kategori yang sama".
    - _Requirements: 8.1, 8.4, 10.9_

  - [x] 8.19 Otomatisasi Posisi Akhir Item Baru & Penghapusan Input Manual Urutan (`SkillForm.vue`, `ExperienceForm.vue`, `CertificateForm.vue`, `ProjectForm.vue`):
    - Hapus seluruh input field manual "Urutan Tampilan / Sort Order" dari semua modal form CRUD (Keahlian, Pendidikan, Pengalaman, Sertifikasi).
    - Terapkan logika auto-append (`MAX(sort_order) + 1`): Setiap penambahan data baru otomatis ditempatkan di posisi paling akhir daftar (misal ada 1..4 maka data baru menjadi ke-5).
    - Pertahankan nomor urut yang sudah ada saat edit data agar posisi tidak terganggu.
    - _Requirements: 8.1, 8.4, 10.9_

  - [x] 8.20 Preservasi Format Teks Multiline, Paragraf, dan Poin-Poin Riwayat (`JourneySection.vue`, `AboutSection.vue`):
    - Terapkan kelas utilitas `whitespace-pre-line` pada seluruh elemen peraga deskripsi riwayat Pendidikan dan Pengalaman (baik layout desktop zigzag maupun mobile).
    - Memastikan setiap enter/baris baru, jarak antar paragraf, dan daftar poin-poin yang diketik di CRUD admin tampil persis sesuai format aslinya pada halaman portofolio pengunjung.
    - _Requirements: 6.1, 6.2, 6.3, 10.9_

  - [x] 8.21 Refaktor Grid Keahlian Menjadi 6 Kolom Kompak (`JourneySection.vue`):
    - Ubah tata letak kartu keahlian teknis dari 5 kolom menjadi 6 kolom per baris (`lg:grid-cols-6`) dengan kontainer `max-w-6xl`.
    - Perkecil ukuran kartu keahlian (*compact squircle*): kurangi padding (`p-3.5 sm:p-4`), perkecil ukuran ikon teknologi (`w-11 h-11 sm:w-12 sm:h-12`), dan rapatkan jarak antar kartu (`gap-3 sm:gap-4`) agar tampil proporsional, rapi, dan padat.
    - _Requirements: 7.1, 7.2, 10.9_

  - [x] 8.22 Fitur Upload Ikon Keahlian Langsung & Preservasi Ikon Bawaan Otomatis (`SkillForm.vue`, `TechIcon.vue`, `JourneySection.vue`, `SkillsView.vue`):
    - Ganti input teks/link manual pada form Keahlian dengan area upload file langsung (`SVG`, `PNG`, `WebP`) yang terintegrasi ke Supabase Storage (`portfolio-images/skills/`).
    - Pertahankan fitur fallback otomatis: jika form dikosongkan (tidak mengunggah ikon), sistem secara otomatis menggunakan ikon SVG resmi bawaan sesuai nama keahlian (Vue, React, PHP, Laravel, Tailwind, MySQL, PostgreSQL, dll.).
    - Tampilkan live preview ikon bawaan di form ketika belum mengunggah, serta opsi ganti atau hapus ikon custom kapan saja.
    - _Requirements: 7.1, 7.2, 10.9_

  - [ ] 8.9 Periksa tampilan responsif di mobile, tablet, desktop
  - [ ] 8.10 Periksa konsistensi warna, spacing, dan tipografi
  - [ ] 8.11 Pastikan semua navigation guard admin bekerja
  - [ ] 8.12 Deploy ke Vercel dengan environment variables yang benar (setelah user menyetujui)
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

