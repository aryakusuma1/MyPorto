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
