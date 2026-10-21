# Struktur Proyek

## Pohon Direktori

```
Portofolio Arya/
|
|-- docs/                         # Dokumentasi proyek (steering & SDD)
|   |-- steering/
|   |   |-- product.md
|   |   |-- tech.md
|   |   `-- structure.md
|   `-- specs/
|       |-- requirements.md
|       |-- design.md
|       `-- tasks.md
|
|-- public/
|   `-- favicon.ico
|
`-- src/
    |-- assets/
    |   `-- images/               # Aset gambar lokal (jika ada)
    |
    |-- components/
    |   |-- layout/               # Komponen pembungkus halaman
    |   |   |-- AppNavbar.vue
    |   |   `-- AppFooter.vue
    |   |
    |   |-- sections/             # Satu file per section di halaman utama
    |   |   |-- HeroSection.vue
    |   |   |-- AboutSection.vue
    |   |   |-- SkillsSection.vue
    |   |   |-- ProjectsSection.vue
    |   |   |-- ExperienceSection.vue
    |   |   |-- CertificatesSection.vue
    |   |   `-- ContactSection.vue
    |   |
    |   |-- ui/                   # Komponen reusable murni (tidak tahu domain)
    |   |   |-- BaseButton.vue
    |   |   |-- BaseCard.vue
    |   |   |-- BaseBadge.vue
    |   |   |-- BaseInput.vue
    |   |   |-- BaseTextarea.vue
    |   |   |-- SectionTitle.vue
    |   |   |-- SkeletonLoader.vue
    |   |   `-- ThemeToggle.vue
    |   |
    |   |-- project/              # Komponen domain project
    |   |   `-- ProjectCard.vue
    |   |
    |   |-- certificate/          # Komponen domain sertifikat
    |   |   `-- CertificateCard.vue
    |   |
    |   `-- admin/                # Komponen khusus admin panel
    |       |-- AdminSidebar.vue
    |       |-- ImageUploader.vue
    |       `-- forms/
    |           |-- ProjectForm.vue
    |           |-- CertificateForm.vue
    |           |-- SkillForm.vue
    |           `-- ExperienceForm.vue
    |
    |-- views/                    # Halaman — dipanggil router
    |   |-- HomeView.vue
    |   |-- ProjectDetailView.vue
    |   |-- CertificateDetailView.vue
    |   `-- admin/
    |       |-- AdminLayout.vue
    |       |-- LoginView.vue
    |       |-- DashboardView.vue
    |       |-- ProjectsView.vue
    |       |-- CertificatesView.vue
    |       |-- SkillsView.vue
    |       |-- ExperienceView.vue
    |       `-- MessagesView.vue
    |
    |-- stores/                   # Pinia — satu file per domain
    |   |-- auth.store.js
    |   |-- profile.store.js
    |   |-- project.store.js
    |   |-- certificate.store.js
    |   |-- skill.store.js
    |   `-- experience.store.js
    |
    |-- composables/              # Logika reusable lintas komponen
    |   |-- useScrollSpy.js       # Deteksi section aktif saat scroll
    |   `-- useIntersection.js    # Trigger animasi saat elemen masuk viewport
    |
    |-- lib/
    |   `-- supabase.js           # Inisialisasi Supabase client (satu instance)
    |
    |-- router/
    |   `-- index.js              # Semua route + navigation guard admin
    |
    |-- styles/
    |   `-- main.css              # Tailwind directives + CSS custom properties
    |
    |-- App.vue
    `-- main.js
```

## Konvensi Penamaan

| Jenis | Konvensi | Contoh |
|---|---|---|
| Komponen Vue | PascalCase | `ProjectCard.vue`, `BaseButton.vue` |
| Views | PascalCase + suffix `View` | `HomeView.vue`, `LoginView.vue` |
| Stores Pinia | camelCase + suffix `.store` | `project.store.js` |
| Composables | camelCase + prefix `use` | `useScrollSpy.js` |
| Route name | kebab-case | `project-detail`, `admin-dashboard` |
| Supabase tabel | snake_case | `projects`, `project_details` |
| CSS variables | kebab-case | `--color-accent`, `--font-heading` |

## Pola Arsitektur

### Alur Data (Unidirectional)

```
Supabase (cloud)
      |
      v
Pinia Store (fetch data, simpan state, handle error)
      |
      v
View / Section Component (baca state dari store)
      |
      v
UI Component (terima props, kirim event)
      ^
      |
Event / action naik kembali ke store
```

### Aturan Per Layer

**`components/ui/`**
- Tidak boleh mengimpor store atau supabase.js
- Hanya terima data via props dan komunikasi via emit
- Dapat dipakai di bagian manapun (publik maupun admin)

**`components/sections/`**
- Bertanggung jawab atas satu section halaman utama
- Boleh menggunakan store untuk fetch dan membaca data
- Tidak reusable — tidak dipanggil di lebih dari satu tempat

**`views/`**
- Hanya merakit komponen dan mengatur layout halaman
- Sesedikit mungkin logika — delegasikan ke store atau composable

**`stores/`**
- Satu-satunya tempat yang boleh memanggil supabase.js
- Bertanggung jawab atas: fetch, mutasi, error handling, loading state

**`composables/`**
- Hanya untuk logika yang dipakai di lebih dari satu komponen
- Jangan buat composable untuk logika yang hanya dipakai di satu tempat

## Aturan Komponen Reusable

Buat komponen reusable hanya jika:
1. Digunakan di 2 tempat atau lebih
2. Memiliki tampilan atau perilaku yang konsisten
3. Mengurangi duplikasi kode secara nyata
