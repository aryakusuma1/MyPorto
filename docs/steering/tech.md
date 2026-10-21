# Teknologi

## Stack Inti

| Kebutuhan | Pilihan |
|---|---|
| Framework Frontend | Vue 3 (Composition API — `<script setup>`) |
| Build Tool | Vite |
| Bahasa | JavaScript (bukan TypeScript) |
| Styling | Tailwind CSS v3 |
| State Management | Pinia |
| Routing | Vue Router 4 |
| Backend & Database | Supabase (PostgreSQL + Auth + Storage) |
| Supabase SDK | `@supabase/supabase-js` v2 |
| Icon | Lucide Vue Next (`lucide-vue-next`) |
| Database Migration | Supabase CLI (`supabase`) |

## Tipografi (Google Fonts)

- **Heading**: `Outfit` (weight 400, 500, 600, 700)
- **Body**: `Inter` (weight 400, 500)

## Palet Warna (Tailwind Custom Token)

```js
// tailwind.config.js
colors: {
  surface: {
    DEFAULT: '#0d1117',   // latar utama (biru gelap pekat)
    alt:     '#161b22',   // latar card / section alt
    raised:  '#21262d',   // latar hover / input
  },
  accent: {
    DEFAULT: '#c97b3a',   // orange-coklat utama
    light:   '#e8955a',   // aksen hover
    muted:   '#7a4a22',   // aksen redup
  },
  ink: {
    DEFAULT: '#e6edf3',   // teks utama
    muted:   '#8b949e',   // teks sekunder
    subtle:  '#484f58',   // teks tersier / placeholder
  },
  border: {
    DEFAULT: '#30363d',   // border normal
    subtle:  '#21262d',   // border halus
  }
}
```

## Arsitektur Backend

Tidak ada backend terpisah. Supabase bertindak sebagai Backend as a Service (BaaS):
- **PostgreSQL** → penyimpanan data (profiles, projects, certificates, skills, experiences)
- **Supabase Auth** → autentikasi admin (email & password, JWT session)
- **Supabase Storage** → penyimpanan file gambar dan dokumen CV
- **Row Level Security (RLS)** → kontrol akses data (publik hanya bisa baca, admin bisa tulis)

Semua query ke Supabase dilakukan dari dalam **Pinia stores** — tidak langsung dari komponen.
Client Supabase diinisialisasi sekali di `src/lib/supabase.js`.

## Environment Variables

```env
# .env (tidak di-commit ke Git)
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

Semua variabel yang diakses Vue wajib berawalan `VITE_`.

## Perintah Umum

```bash
# Inisialisasi proyek
npm create vite@latest . -- --template vue

# Install dependensi
npm install
npm install vue-router@4 pinia @supabase/supabase-js lucide-vue-next
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Jalankan dev server
npm run dev

# Build produksi
npm run build

# Migrasi database (Supabase CLI)
npx supabase init
npx supabase link --project-ref <project-ref>
npx supabase db push
```

## Catatan Teknis

- Gunakan `<script setup>` di setiap komponen Vue — bukan Options API
- Pinia store menggunakan Composition API style (`defineStore` dengan `setup()`)
- Tidak ada TypeScript
- Tidak ada library animasi eksternal — gunakan `transition` Tailwind dan CSS native
- Tidak ada library komponen UI (Vuetify, PrimeVue, dll) — semua dibangun sendiri
- Skeleton loading menggunakan `animate-pulse` dari Tailwind
- Dark/Light mode toggle menggunakan class `dark` di `<html>` dan Tailwind `dark:` variant
