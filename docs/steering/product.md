# Produk: Web Portfolio Personal

## Deskripsi

Web portfolio personal untuk menampilkan karya, keahlian, pengalaman, dan sertifikasi secara profesional. Berjalan sebagai aplikasi hybrid one-page — seluruh konten utama tersaji dalam satu halaman, dengan halaman terpisah untuk detail project dan sertifikat.

## Target Pengguna

Semua kalangan yang ingin mengenal pemilik portfolio:
- Rekruter / HRD yang mencari kandidat
- Klien freelance yang membutuhkan developer
- Sesama developer atau komunitas teknis

## Posisi Pemilik

Fresh graduate / mahasiswa dengan keahlian di bidang:
- Frontend (Vue, React, HTML/CSS)
- Backend (Node.js, PHP, Python)
- Mobile (Flutter, React Native)
- Database & SQL
- UI/UX Design
- Data / AI/ML

## Fitur Utama

### Halaman Utama (One-Page)
- **Hero** — Nama, foto profil, tagline singkat, tombol CTA
- **About** — Bio singkat, fakta-fakta diri, tombol unduh CV
- **Skills** — Daftar keahlian dikelompokkan per kategori dengan indikator level
- **Projects** — Daftar card project; klik membuka halaman detail baru
- **Experience & Education** — Timeline pengalaman kerja dan riwayat pendidikan
- **Certificates** — Daftar card sertifikat; klik membuka halaman detail baru
- **Footer** — Tautan langsung ke email, LinkedIn, dan GitHub

### Halaman Detail (Page Baru via Vue Router)
- **Detail Project** (`/projects/:slug`) — Overview, tech stack, arsitektur, fitur utama, tantangan & solusi, screenshots, tautan GitHub & demo
- **Detail Sertifikat** (`/certificates/:id`) — Gambar sertifikat, informasi penerbitan, tautan verifikasi

### Admin Panel (`/admin`)
- Login dengan autentikasi Supabase (email & password)
- CRUD: Projects (termasuk konten detail), Certificates, Skills, Experience & Education
- Kelola profil (foto, bio, CV)
- Lihat & tandai pesan masuk dari pengunjung
- Upload gambar via Supabase Storage

## Kontak

Tidak menggunakan form kontak. Pengunjung diarahkan langsung melalui tautan:
- Email
- LinkedIn
- GitHub

## Bahasa

Seluruh antarmuka menggunakan **Bahasa Indonesia**.

## Gaya Visual

**Dark Minimalist** — profesional, sederhana, modern, dan mudah dibaca.

Prinsip desain:
- Mengutamakan keterbacaan dan hierarki informasi
- Menggunakan ruang kosong yang cukup
- Menghindari elemen dekoratif berlebihan
- Animasi minimal, hanya jika membantu pengalaman pengguna
- Konsistensi warna, tipografi, jarak, dan komponen
- Tidak menyerupai template generik

Palet: dark biru gelap sebagai latar, orange-coklat sebagai aksen utama.
Tanpa gradien dekoratif, glassmorphism, atau efek neon/glow.
