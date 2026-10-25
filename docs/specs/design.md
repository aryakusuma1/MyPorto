# Design: Web Portfolio Personal

## 1. Arsitektur Sistem

```
Browser (Vue 3 SPA)
      |
      | HTTPS via @supabase/supabase-js SDK
      |
Supabase Cloud
      |-- PostgreSQL  (data: profiles, projects, certificates, skills, experiences)
      |-- Auth        (sesi admin — JWT)
      `-- Storage     (gambar & file CV)
```

Tidak ada server atau backend terpisah. Semua logika backend ditangani oleh:
- Row Level Security (RLS) PostgreSQL untuk kontrol akses
- Supabase Auth untuk autentikasi

---

## 2. Routing

| Route | Komponen | Guard | Deskripsi |
|---|---|---|---|
| `/` | `HomeView.vue` | — | Halaman utama one-page |
| `/projects/:slug` | `ProjectDetailView.vue` | — | Detail project |
| `/certificates/:id` | `CertificateDetailView.vue` | — | Detail sertifikat |
| `/admin` | Redirect | Auth | Redirect ke `/admin/dashboard` atau `/admin/login` |
| `/admin/login` | `LoginView.vue` | — | Halaman login admin |
| `/admin/dashboard` | `DashboardView.vue` | Auth | Ringkasan admin |
| `/admin/projects` | `ProjectsView.vue` | Auth | Kelola project |
| `/admin/certificates` | `CertificatesView.vue` | Auth | Kelola sertifikat |
| `/admin/skills` | `SkillsView.vue` | Auth | Kelola skills |
| `/admin/experience` | `ExperienceView.vue` | Auth | Kelola experience & education |
| `/admin/messages` | `MessagesView.vue` | Auth | Lihat pesan masuk |

**Navigation Guard**: Semua route `/admin/*` (kecuali `/admin/login`) memeriksa sesi Supabase Auth. Jika tidak ada sesi, redirect ke `/admin/login`.

---

## 3. Database Schema (Supabase / PostgreSQL)

Skema tabel dan kebijakan keamanan (RLS) di bawah ini dieksekusi menggunakan sistem migrasi Supabase CLI melalui berkas di supabase/migrations/ tanpa mengubah definisi tabel, kolom, constraint, atau policy yang telah dirancang.

### 3.1 Tabel `profiles`
```sql
CREATE TABLE public.profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name    TEXT NOT NULL,
  title        TEXT,
  bio          TEXT,
  tagline      TEXT,
  photo_url    TEXT,
  cv_url       TEXT,
  github_url   TEXT,
  linkedin_url TEXT,
  email        TEXT,
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.2 Tabel `skills`
```sql
CREATE TABLE public.skills (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  category    TEXT NOT NULL,
  icon_url    TEXT,
  level       SMALLINT DEFAULT 80 CHECK (level BETWEEN 1 AND 100),
  sort_order  SMALLINT DEFAULT 0
);
```

### 3.3 Tabel `experiences`
```sql
CREATE TABLE public.experiences (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company     TEXT NOT NULL,
  role        TEXT NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('work', 'education')),
  start_date  DATE NOT NULL,
  end_date    DATE,             -- NULL = masih berlangsung
  description TEXT,
  logo_url    TEXT,
  sort_order  SMALLINT DEFAULT 0
);
```

### 3.4 Tabel `projects`
```sql
CREATE TABLE public.projects (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  short_desc  TEXT,
  cover_url   TEXT,
  tech_stack  TEXT[] DEFAULT '{}',
  category    TEXT,
  status      TEXT DEFAULT 'completed' CHECK (status IN ('completed', 'ongoing', 'archived')),
  github_url  TEXT,
  demo_url    TEXT,
  featured    BOOLEAN DEFAULT FALSE,
  sort_order  SMALLINT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.5 Tabel `project_details`
```sql
CREATE TABLE public.project_details (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    UUID NOT NULL UNIQUE REFERENCES public.projects(id) ON DELETE CASCADE,
  overview      TEXT,
  architecture  TEXT,
  diagram_url   TEXT,
  -- [{challenge: string, solution: string}]
  challenges    JSONB DEFAULT '[]',
  -- [{title: string, description: string}]
  features      JSONB DEFAULT '[]',
  -- [{url: string, caption: string}]
  screenshots   JSONB DEFAULT '[]'
);
```

### 3.6 Tabel `certificates`
```sql
CREATE TABLE public.certificates (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title          TEXT NOT NULL,
  issuer         TEXT NOT NULL,
  issue_date     DATE NOT NULL,
  expiry_date    DATE,
  credential_url TEXT,
  image_url      TEXT,
  category       TEXT,
  description    TEXT,
  sort_order     SMALLINT DEFAULT 0
);
```

### 3.7 Tabel `contact_messages`
```sql
CREATE TABLE public.contact_messages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  message    TEXT NOT NULL,
  is_read    BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 4. Row Level Security (RLS)

### Publik — hanya READ
```sql
-- Aktifkan RLS pada semua tabel
ALTER TABLE public.profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiences      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_details  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Visitor dapat membaca semua data publik
CREATE POLICY "Public read" ON public.profiles        FOR SELECT USING (true);
CREATE POLICY "Public read" ON public.skills          FOR SELECT USING (true);
CREATE POLICY "Public read" ON public.experiences     FOR SELECT USING (true);
CREATE POLICY "Public read" ON public.projects        FOR SELECT USING (true);
CREATE POLICY "Public read" ON public.project_details FOR SELECT USING (true);
CREATE POLICY "Public read" ON public.certificates    FOR SELECT USING (true);
```

### Admin — READ + WRITE (harus login)
```sql
CREATE POLICY "Auth write" ON public.profiles        FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth write" ON public.skills          FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth write" ON public.experiences     FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth write" ON public.projects        FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth write" ON public.project_details FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth write" ON public.certificates    FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth read"  ON public.contact_messages FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Auth write" ON public.contact_messages FOR UPDATE USING (auth.role() = 'authenticated');
```

---

## 5. Supabase Storage

| Bucket | Akses | Isi |
|---|---|---|
| `portfolio-images` | Public | Cover project, gambar sertifikat, foto profil, diagram arsitektur |
| `documents` | Private | File CV (PDF) |

Path konvensi:
```
portfolio-images/
  projects/{slug}/cover.webp
  projects/{slug}/screenshots/{n}.webp
  projects/{slug}/diagram.webp
  certificates/{id}.webp
  profile/photo.webp

documents/
  cv/cv-latest.pdf
```

---

## 6. Pinia Stores

### `auth.store.js`
```js
State:  { session: null, user: null }
Actions: signIn(email, password), signOut(), initAuth()
```

### `profile.store.js`
```js
State:  { profile: null, loading: false, error: null }
Actions: fetchProfile(), updateProfile(data)
```

### `project.store.js`
```js
State:  { projects: [], project: null, loading: false, error: null }
Actions: fetchProjects(), fetchProjectBySlug(slug),
         createProject(data), updateProject(id, data), deleteProject(id)
```

### `certificate.store.js`
```js
State:  { certificates: [], certificate: null, loading: false, error: null }
Actions: fetchCertificates(), fetchCertificateById(id),
         createCertificate(data), updateCertificate(id, data), deleteCertificate(id)
```

### `skill.store.js`
```js
State:  { skills: [], loading: false, error: null }
Actions: fetchSkills(), createSkill(data), updateSkill(id, data), deleteSkill(id)
```

### `experience.store.js`
```js
State:  { experiences: [], loading: false, error: null }
Actions: fetchExperiences(), createExperience(data), updateExperience(id, data), deleteExperience(id)
```

---

## 7. Desain Visual

### Token Warna
```
Latar utama:   #0d1117  (surface)
Latar card:    #161b22  (surface-alt)
Latar hover:   #21262d  (surface-raised)
Aksen utama:   #c97b3a  (orange-coklat)
Aksen hover:   #e8955a
Border normal: #30363d
Teks utama:    #e6edf3
Teks sekunder: #8b949e
Teks muted:    #484f58
```

### Tipografi
```
Heading: Outfit (400–700)
Body:    Inter (400–500)
```

### Prinsip Komponen
- Spacing konsisten: gunakan skala Tailwind (4, 6, 8, 12, 16, 24)
- Border radius konsisten: `rounded-lg` (8px) untuk card, `rounded-md` (6px) untuk input/badge
- Semua komponen interaktif memiliki state: default, hover, focus, disabled
- Animasi hanya scroll-triggered fade-in dan hover transition — tidak ada loop animation

---

## 8. Error Handling

| Skenario | Penanganan |
|---|---|
| Fetch data gagal (network error) | Tampilkan pesan error di section yang bersangkutan |
| Slug/ID tidak ditemukan | Redirect ke halaman 404 atau kembali ke Home |
| Upload file gagal | Tampilkan pesan error di form, jangan tutup form |
| Login gagal | Tampilkan pesan error di bawah formulir |
| Simpan data admin gagal | Tampilkan pesan error, data form tidak direset |


---

## 9. Akses Admin Panel

Halaman login admin diakses dengan mengetik URL langsung di browser:

```
https://[domain-portfolio]/admin/login
```

Tidak ada tautan publik dari halaman utama menuju `/admin/login`.
Keamanan tidak bergantung pada kerahasiaan URL, melainkan pada:
- Supabase Auth: harus punya email & password yang valid
- RLS policy: hanya UUID pemilik yang dapat menulis data
- Signup dinonaktifkan: tidak ada yang bisa membuat akun baru

WHEN Visitor mengakses `/admin` atau rute admin manapun tanpa sesi aktif,
THE App SHALL redirect ke `/admin/login`.

WHEN Admin berhasil login, THE App SHALL redirect ke `/admin/dashboard`.

### 7.4 Interactive 3D Coverflow Showcase Carousel (Projects & Certificates)
- **Konsep Arsitektur**:
  - Menggantikan grid multi-baris statis dengan Coverflow Showcase Slider 3D horizontal interaktif.
  - State aktif dilacak via `activeIndex` (0 s/d `items.length - 1`).
  - Posisi relatif setiap item dihitung menggunakan offset: `offset = index - activeIndex`.
  - Transformasi 3D dinamis:
    - `offset === 0` (Active Center): `scale(1.05)`, `translateZ(0)`, `opacity: 1`, border accent glow `box-shadow: 0 10px 30px rgba(255,107,0,0.2)`.
    - `offset === -1` (Left Adjacent): `translateX(-70%) scale(0.85) rotateY(15deg)`, `opacity: 0.65`.
    - `offset === 1` (Right Adjacent): `translateX(70%) scale(0.85) rotateY(-15deg)`, `opacity: 0.65`.
    - `Math.abs(offset) >= 2`: `opacity: 0`, `pointer-events: none` (atau disembunyikan di luar viewport panggung).
- **Interaksi**:
  - Tombol ◀ dan ▶ untuk navigasi step per step dengan wrap-around atau batas ujung.
  - Klik pada kartu kiri/kanan memanggil `setActiveIndex(targetIndex)`.
  - Touch event listeners (`touchstart`, `touchmove`, `touchend`) untuk swipe horizontal di layar sentuh mobile/tablet.
  - Kotak informasi aktif di bawah stage menampilkan detail item, deskripsi, badges, dan direct action button.

### 7.5 Kontak 2-Kolom & Dual-Delivery Messaging Architecture
- **Konsep Tata Letak**:
  - Mengadopsi struktur grid 2-kolom (`grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start`).
  - **Kolom Kiri (`lg:col-span-5`) — List Kontak Langsung**:
    - Menampilkan kartu-kartu tautan kontak tanpa nomor urut: Email, GitHub, LinkedIn, dan Instagram.
    - Menggunakan ikon resmi Lucide (`Mail`, `Github`, `Linkedin`, `Instagram`).
    - Kartu dilengkapi efek interaktif border glow dan panah eksternal `ArrowUpRight`.
    - **Kolom Kanan (`lg:col-span-7`) — Formulir Kirim Pesan Interaktif & Balanced Sizing**:
    - Kontainer kartu `bg-surface-alt/90 border border-border/80 rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur-xl h-full flex flex-col justify-between`.
    - Tata letak masukan yang seimbang (*equal-height symmetry*): Kolom kiri (header + 4 kartu kontak) dan kolom kanan (kartu formulir pesan) memiliki tinggi total yang sejajar dan seragam (*items-stretch*).
    - Grid 2-kolom masukan identitas (`grid grid-cols-1 sm:grid-cols-2 gap-3`) untuk "Nama Anda" dan "Alamat Email", menghemat ruang vertikal secara elegan.
    - Textarea pesan dibuat kompak (`rows="3"` dengan `min-h-[90px]`) dan tombol aksi yang proporsional (`py-2.5 sm:py-3`), mencegah kartu membengkak atau melorot ke bawah.
- **Arsitektur Pengiriman Pesan Ganda (*Dual-Delivery*)**:
  - `Submit Handler` mengeksekusi dua alur secara paralel atau sekuensial:
    1. **Notifikasi Email Instan**: Mengirim payload JSON ke gateway email (FormSubmit AJAX) ke email pemilik portofolio, sehingga notifikasi langsung masuk ke ponsel pemilik.
    2. **Arsip Basis Data**: Memasukkan rekaman baru ke tabel `public.contact_messages` di Supabase untuk riwayat pesan di dashboard admin (`MessagesView.vue`).
  - Penanganan state reaktif: `isSubmitting` (disable button + spinner), `isSuccess` (alert hijau), `errorMessage` (alert merah).

### 7.6 Refaktor CRUD Skill (List Layout) & Standarisasi Modal Admin
- **Modal Konsistensi Admin (`MessagesView.vue`)**:
  - Modal pesan masuk menggunakan token warna baku `bg-surface-alt`, `bg-surface-raised`, dan `bg-black/80 backdrop-blur-sm` sehingga tidak lagi tembus pandang (*translucent/bening*).
- **CRUD Skill List Layout (`SkillsView.vue`)**:
  - Mengubah tampilan grid 3-kolom menjadi tabel baris (*row list*) yang ramping dan padat.
  - Setiap baris memuat tombol navigasi urutan naik/turun (`↑`, `↓`), nomor urut `#N`, ikon inisial, nama skill, kategori badge, progress bar kemahiran, dan tombol aksi edit/hapus.
- **Logika Pengurutan Global Skill**:
  - Menghapus pembatasan urutan "dalam kategori yang sama", menjadikan `sort_order` bersifat sekuensial dan global (1..N) di seluruh data keahlian.
  - `skill.store.js` dan `SkillsSection.vue` menyortir item berdasarkan `sort_order` ascending sehingga posisi di halaman utama selaras langsung dengan urutan di admin.

### 7.7 Otomatisasi Urutan Akhir (*Auto-Append*) & Penghapusan Input Manual Urutan
- **Penghapusan Masukan Manual**:
  - Seluruh field input manual "Urutan Tampilan (Sort Order)" dihilangkan dari seluruh modal form (`SkillForm`, `ExperienceForm`, `CertificateForm`). Pengguna tidak lagi perlu mengetik angka urutan secara manual.
- **Logika Auto-Append pada Data Baru**:
  - Ketika data baru ditambahkan (create mode), sistem otomatis memeriksa nilai `sort_order` tertinggi yang ada di database untuk kategori/tabel terkait dan menetapkan `MAX(sort_order) + 1`.
  - Jika daftar sebelumnya berisi item #1, #2, #3, #4, maka penambahan data baru otomatis menjadi item #5 di posisi paling akhir.
- **Konsistensi Edit & Reordering**:
  - Saat mengubah (*edit*) data, nilai `sort_order` lama tetap dipertahankan sehingga posisinya tidak bergeser.
  - Penyesuaian urutan posisi sepenuhnya dikontrol melalui tombol interaktif Naik (`↑`) dan Turun (`↓`) pada daftar list view admin yang langsung memperbarui nomor urut secara sekuensial.

### 7.8 Preservasi Format Multiline & Poin-Poin Deskripsi
- **Preservasi Spasi & Baris Baru (`whitespace-pre-line`)**:
  - Pada komponen `JourneySection.vue` (Pendidikan & Pengalaman), teks deskripsi kini dirender dengan kelas `whitespace-pre-line`.
  - Karakter baris baru (`\n`), pemisah paragraf (jarak enter), dan pemformatan poin-poin (bullet points seperti `- ` atau nomor `1. `) yang diketik admin dipertahankan dan ditampilkan secara presisi di antarmuka pengunjung, tanpa mengorbankan sifat responsif *line-wrapping*.

### 7.9 Grid Keahlian 6-Kolom Kompak (*Compact Squircle Grid*)
- **Penyesuaian Kolom Grid (`lg:grid-cols-6`)**:
  - Tab keahlian pada `JourneySection.vue` mengadopsi tata letak responsif 6-kolom (`grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6`) dengan lebar maksimum `max-w-6xl` dan jarak celah `gap-3 sm:gap-4`.
- **Perampingan Ukuran Kartu**:
  - Ukuran kartu diperkecil dengan padding padat `p-3.5 sm:p-4` dan radius sudut `rounded-2xl`.
  - Kontainer ikon teknologi diskalakan menjadi `w-11 h-11 sm:w-12 sm:h-12` dengan teks nama skill `text-xs sm:text-sm` serta badge kategori `text-[10px]`, menghasilkan tampilan kisi keahlian yang proporsional, padat, dan elegan.

### 7.10 Upload Ikon Keahlian Langsung & Fallback Ikon Bawaan
- **Integrasi Upload Berkas (`SkillForm.vue`)**:
  - Menggantikan input teks link URL manual dengan tombol upload berkas gambar langsung (`image/svg+xml`, `image/png`, `image/webp`). Berkas diunggah langsung ke Supabase Storage pada path `portfolio-images/skills/`.
- **Preservasi Ikon Bawaan (*Graceful Fallback*)**:
  - Jika pengguna tidak mengunggah gambar kustom, sistem tetap mempertahankan ikon SVG bawaan resmi yang terdaftar pada `TechIcon.vue` berdasarkan nama skill.
  - Komponen form menyediakan kotak pratinjau langsung yang mengindikasikan apakah ikon bawaan aktif atau ikon kustom sedang terpasang.

### 7.11 Mobile Viewport Lock & Responsive Tab Switcher (JourneySection)
- **Viewport Lock**:
  - Diterapkan `overflow-x: hidden` dan `max-width: 100%` pada `html, body` di `main.css`, serta `w-full max-w-full overflow-x-hidden` pada root `HomeView.vue`.
  - Mengunci viewport mobile secara presisi agar tidak terjadi pergeseran horizontal (*horizontal swipe/scrollbar*) pada perangkat layar sentuh.
- **Responsive Pill Tab Switcher (`JourneySection.vue`)**:
  - Di layar mobile: Padding dikurangi menjadi `p-1.5` pada container dan `py-2 px-1.5` pada button.
  - Tipografi tombol diatur ke `text-xs sm:text-base font-semibold` dengan ikon `w-3.5 h-3.5 sm:w-5 sm:h-5` dan gap `gap-1 sm:gap-2.5`.
  - Dilengkapi `min-w-0` dan `truncate` sehingga ketiga tombol (Pendidikan, Pengalaman, Keahlian) muat 100% utuh tanpa terpotong di layar HP berdimensi 360px ke atas.
