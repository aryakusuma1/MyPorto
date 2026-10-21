-- ==============================================================================
-- Initial Schema Migration: Web Portfolio Personal
-- Sesuai dengan Spesifikasi SDD (docs/specs/design.md Bagian 3 dan Bagian 4)
-- ==============================================================================

-- 3.1 Tabel profiles
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

-- 3.2 Tabel skills
CREATE TABLE public.skills (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  category    TEXT NOT NULL,
  icon_url    TEXT,
  level       SMALLINT DEFAULT 80 CHECK (level BETWEEN 1 AND 100),
  sort_order  SMALLINT DEFAULT 0
);

-- 3.3 Tabel experiences
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

-- 3.4 Tabel projects
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

-- 3.5 Tabel project_details
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

-- 3.6 Tabel certificates
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

-- 3.7 Tabel contact_messages
CREATE TABLE public.contact_messages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  message    TEXT NOT NULL,
  is_read    BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 4. Row Level Security (RLS)
-- ==============================================================================

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

-- Admin - READ + WRITE (harus login)
CREATE POLICY "Auth write" ON public.profiles        FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth write" ON public.skills          FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth write" ON public.experiences     FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth write" ON public.projects        FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth write" ON public.project_details FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth write" ON public.certificates    FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth read"  ON public.contact_messages FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Auth write" ON public.contact_messages FOR UPDATE USING (auth.role() = 'authenticated');
