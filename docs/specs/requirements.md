# Requirements: Web Portfolio Personal

## Glossary

- **App**: Aplikasi web portfolio secara keseluruhan
- **Visitor**: Pengunjung umum yang melihat portfolio tanpa login
- **Admin**: Pemilik portfolio yang mengelola konten via admin panel
- **Home_Page**: Halaman utama one-page yang memuat semua section
- **Project_Card**: Komponen kartu yang menampilkan ringkasan satu project
- **Certificate_Card**: Komponen kartu yang menampilkan ringkasan satu sertifikat
- **Detail_Page**: Halaman terpisah yang memuat informasi lengkap satu entitas
- **Admin_Panel**: Area terproteksi di `/admin` untuk mengelola konten
- **Supabase**: Layanan backend yang menyediakan database, autentikasi, dan penyimpanan file

---

## Requirement 1: Navigasi Halaman Utama

**User Story:** Sebagai Visitor, saya ingin dapat menavigasi antar section dengan mudah, sehingga saya dapat menemukan informasi yang saya cari tanpa kebingungan.

### Acceptance Criteria

1. THE App SHALL menampilkan navbar yang tetap terlihat (sticky) di bagian atas layar saat Visitor menggulir halaman.
2. THE App SHALL menyediakan tautan navigasi untuk setiap section: Hero, About, Skills, Projects, Experience, Certificates, dan Footer.
3. WHEN Visitor mengklik tautan navigasi, THE App SHALL menggulir halaman secara mulus (smooth scroll) ke section yang dituju.
4. WHEN Visitor menggulir halaman, THE App SHALL menandai tautan navigasi yang sesuai dengan section yang sedang terlihat di layar sebagai aktif.
5. THE App SHALL menampilkan tampilan navbar yang responsif — pada layar kecil, tautan navigasi tersembunyi di balik ikon menu hamburger.
6. WHEN Visitor mengklik ikon hamburger, THE App SHALL menampilkan menu navigasi.

---

## Requirement 2: Section Hero

**User Story:** Sebagai Visitor, saya ingin melihat identitas pemilik portfolio di bagian pertama halaman, sehingga saya langsung mengetahui siapa mereka dan apa yang mereka tawarkan.

### Acceptance Criteria

1. THE Hero_Section SHALL menampilkan nama lengkap, title/role, dan tagline pemilik portfolio.
2. THE Hero_Section SHALL menampilkan foto profil pemilik.
3. THE Hero_Section SHALL menyediakan tombol "Lihat Project" yang menggulir halaman ke section Projects.
4. THE Hero_Section SHALL menyediakan tombol "Hubungi Saya" yang menggulir halaman ke section Footer (tautan kontak).
5. THE Hero_Section SHALL menampilkan animasi teks bergantian (typing effect) pada bagian title/role.

---

## Requirement 3: Section About

**User Story:** Sebagai Visitor, saya ingin mengetahui latar belakang dan kepribadian pemilik portfolio, sehingga saya dapat menilai kecocokan untuk kebutuhan saya.

### Acceptance Criteria

1. THE About_Section SHALL menampilkan foto profil dan bio singkat pemilik.
2. THE About_Section SHALL menampilkan beberapa fakta menarik tentang diri pemilik dalam format yang mudah dibaca.
3. THE About_Section SHALL menyediakan tombol untuk mengunduh CV pemilik dalam format PDF.
4. IF CV belum diunggah oleh Admin, THEN THE About_Section SHALL menyembunyikan tombol unduh CV.

---

## Requirement 4: Section Skills

**User Story:** Sebagai Visitor, saya ingin melihat keahlian teknis pemilik, sehingga saya dapat menilai kemampuan mereka secara cepat.

### Acceptance Criteria

1. THE Skills_Section SHALL menampilkan daftar keahlian yang dikelompokkan berdasarkan kategori (contoh: Frontend, Backend, Database, Tools).
2. THE Skills_Section SHALL menampilkan indikator level profisiensi untuk setiap keahlian.
3. WHEN Skills_Section pertama kali terlihat di layar Visitor, THE App SHALL memunculkan animasi pada indikator level profisiensi.

---

## Requirement 5: Section Projects

**User Story:** Sebagai Visitor, saya ingin melihat daftar project yang pernah dikerjakan, sehingga saya dapat menilai portofolio dan kemampuan teknis pemilik.

### Acceptance Criteria

1. THE Projects_Section SHALL menampilkan daftar Project_Card dalam tata letak grid.
2. THE Project_Card SHALL menampilkan: gambar cover, judul project, deskripsi singkat, dan daftar badge teknologi yang digunakan.
3. WHEN Visitor mengklik sebuah Project_Card, THE App SHALL menampilkan halaman baru di route `/projects/:slug`.
4. IF tidak ada project yang tersimpan, THEN THE Projects_Section SHALL menampilkan pesan bahwa belum ada project yang ditampilkan.
5. THE Projects_Section SHALL menampilkan skeleton loading selama data dimuat dari Supabase.

---

## Requirement 6: Halaman Detail Project

**User Story:** Sebagai Visitor, saya ingin melihat detail lengkap sebuah project, sehingga saya dapat memahami proses, arsitektur, dan tantangan di balik project tersebut.

### Acceptance Criteria

1. THE Detail_Page untuk project SHALL menampilkan: judul, status, kategori, overview, tech stack, arsitektur, fitur utama, tantangan & solusi, screenshots, serta tautan GitHub dan demo (jika tersedia).
2. THE Detail_Page SHALL menyediakan tombol kembali yang membawa Visitor ke Home_Page di section Projects.
3. WHEN Visitor mengakses route `/projects/:slug` dengan slug yang tidak valid, THE App SHALL mengarahkan Visitor ke halaman 404 atau kembali ke Home_Page.

---

## Requirement 7: Section Experience & Education

**User Story:** Sebagai Visitor, saya ingin melihat riwayat pengalaman kerja dan pendidikan pemilik, sehingga saya dapat menilai latar belakang profesional mereka.

### Acceptance Criteria

1. THE Experience_Section SHALL menampilkan riwayat dalam format timeline vertikal.
2. THE Experience_Section SHALL menampilkan pengalaman kerja dan riwayat pendidikan dalam satu timeline yang dibedakan secara visual.
3. THE Timeline_Item SHALL menampilkan: nama perusahaan/institusi, jabatan/jurusan, periode (bulan & tahun mulai hingga selesai atau "Sekarang"), dan deskripsi singkat.
4. THE Experience_Section SHALL mengurutkan entri dari yang terbaru ke terlama.

---

## Requirement 8: Section Certificates

**User Story:** Sebagai Visitor, saya ingin melihat daftar sertifikat yang dimiliki, sehingga saya dapat memverifikasi kredensial pemilik.

### Acceptance Criteria

1. THE Certificates_Section SHALL menampilkan daftar Certificate_Card dalam tata letak grid.
2. THE Certificate_Card SHALL menampilkan: gambar thumbnail sertifikat, nama sertifikat, nama penerbit (issuer), dan tanggal terbit.
3. WHEN Visitor mengklik sebuah Certificate_Card, THE App SHALL menampilkan halaman baru di route `/certificates/:id`.
4. THE Certificates_Section SHALL menampilkan skeleton loading selama data dimuat dari Supabase.

---

## Requirement 9: Halaman Detail Sertifikat

**User Story:** Sebagai Visitor, saya ingin melihat detail dan memverifikasi sertifikat, sehingga saya dapat mengkonfirmasi keasliannya.

### Acceptance Criteria

1. THE Detail_Page untuk sertifikat SHALL menampilkan: gambar sertifikat ukuran penuh, nama sertifikat, nama penerbit, tanggal terbit, kategori, dan deskripsi (jika ada).
2. IF URL verifikasi tersedia, THEN THE Detail_Page SHALL menampilkan tautan "Verifikasi Sertifikat" yang membuka URL tersebut di tab baru.
3. THE Detail_Page SHALL menyediakan tombol kembali yang membawa Visitor ke Home_Page di section Certificates.

---

## Requirement 10: Footer & Kontak

**User Story:** Sebagai Visitor, saya ingin menemukan cara untuk menghubungi pemilik portfolio, sehingga saya dapat memulai komunikasi.

### Acceptance Criteria

1. THE Footer SHALL menampilkan tautan ke email, LinkedIn, dan GitHub pemilik.
2. WHEN Visitor mengklik tautan email, THE App SHALL membuka aplikasi email default dengan alamat email pemilik.
3. WHEN Visitor mengklik tautan LinkedIn atau GitHub, THE App SHALL membuka URL tersebut di tab baru.
4. THE Footer SHALL menampilkan teks hak cipta dengan nama pemilik dan tahun berjalan.

---

## Requirement 11: Admin — Autentikasi

**User Story:** Sebagai Admin, saya ingin dapat masuk dan keluar dari panel admin dengan aman, sehingga konten portfolio hanya dapat diubah oleh saya.

### Acceptance Criteria

1. WHEN Visitor mengakses route `/admin` tanpa sesi aktif, THE App SHALL mengarahkan ke halaman login `/admin/login`.
2. THE Login_Page SHALL menyediakan formulir dengan kolom email dan password.
3. WHEN Admin mengisi formulir dan menekan tombol "Masuk", THE App SHALL mengautentikasi menggunakan Supabase Auth.
4. WHEN autentikasi berhasil, THE App SHALL menyimpan sesi dan mengarahkan Admin ke `/admin/dashboard`.
5. IF autentikasi gagal, THEN THE App SHALL menampilkan pesan error yang jelas.
6. WHEN Admin menekan tombol "Keluar", THE App SHALL menghapus sesi dan mengarahkan ke halaman login.

---

## Requirement 12: Admin — Kelola Konten (CRUD)

**User Story:** Sebagai Admin, saya ingin dapat menambah, mengubah, dan menghapus konten portfolio tanpa menyentuh kode, sehingga portfolio saya selalu mutakhir.

### Acceptance Criteria

1. THE Admin_Panel SHALL menyediakan halaman terpisah untuk mengelola: Profil, Projects, Certificates, Skills, dan Experience & Education.
2. WHEN Admin menambah atau mengubah data, THE App SHALL memvalidasi input sebelum menyimpan ke Supabase.
3. WHEN Admin menekan tombol hapus pada sebuah entri, THE App SHALL menampilkan konfirmasi sebelum menghapus data secara permanen.
4. THE Admin_Panel SHALL menyediakan antarmuka upload gambar untuk cover project, gambar sertifikat, foto profil, dan diagram arsitektur project.
5. THE Admin_Panel SHALL menampilkan daftar pesan yang masuk dari pengunjung beserta status sudah dibaca atau belum.
6. WHEN Admin menandai pesan sebagai sudah dibaca, THE App SHALL memperbarui status pesan tersebut.

---

## Non-Functional Requirements

| Requirement | Target |
|---|---|
| Responsivitas | Berfungsi dengan baik di mobile, tablet, dan desktop |
| Performa | Halaman utama dapat digunakan dalam waktu wajar pada koneksi rata-rata |
| Aksesibilitas | Elemen interaktif dapat dijangkau via keyboard; kontras warna memadai |
| Keamanan | Data sensitif (pesan masuk, akses admin) dilindungi oleh RLS Supabase |
| Bahasa | Seluruh teks antarmuka dalam Bahasa Indonesia |
