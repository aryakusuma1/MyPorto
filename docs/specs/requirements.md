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
2. THE App SHALL menyediakan tautan navigasi untuk setiap section: Hero, About, Journey (Pendidikan, Pengalaman, & Keahlian), Projects, Certificates, dan Footer.
3. WHEN Visitor mengklik tautan navigasi, THE App SHALL menggulir halaman secara mulus (smooth scroll) ke section yang dituju.
4. WHEN Visitor menggulir halaman, THE App SHALL menandai tautan navigasi yang sesuai dengan section yang sedang terlihat di layar sebagai aktif.
5. THE App SHALL menampilkan tampilan navbar yang responsif — pada layar kecil, tautan navigasi tersembunyi di balik ikon menu hamburger.
6. WHEN Visitor mengklik ikon hamburger, THE App SHALL menampilkan menu navigasi.
7. WHEN Visitor memuat ulang (refresh) atau mengakses rute utama '/', THE App SHALL menonaktifkan restorasi scroll otomatis bawaan peramban (history.scrollRestoration = 'manual') dan selalu mengarahkan posisi viewport kembali ke bagian paling atas (Section Hero / top: 0).

---

## Requirement 2: Section Hero

**User Story:** Sebagai Visitor, saya ingin melihat identitas pemilik portfolio di bagian pertama halaman, sehingga saya langsung mengetahui siapa mereka dan apa yang mereka tawarkan.

### Acceptance Criteria

1. THE Hero_Section SHALL menampilkan nama lengkap, title/role, dan tagline pemilik portfolio.
2. THE Hero_Section SHALL menampilkan foto profil pemilik.
3. THE Hero_Section SHALL menyediakan tombol "Lihat Project" yang menggulir halaman ke section Projects.
4. THE Hero_Section SHALL menyediakan tombol "Hubungi Saya" yang menggulir halaman ke section Footer (tautan kontak).
5. THE Hero_Section SHALL menampilkan animasi teks bergantian (typing effect) pada bagian title/role.
6. WHILE data profil sedang dimuat dari Supabase, THE Hero_Section SHALL menampilkan skeleton loader dan TIDAK menampilkan data fallback sebelum proses pemuatan selesai.
7. IF data profil di Supabase kosong setelah proses pemuatan selesai, THEN THE Hero_Section MAY menampilkan data default/fallback sebagai jaring pengaman.
8. THE Hero_Section SHALL menampilkan foto profil dalam ukuran yang lebih dominan dan proporsional (hingga 420px pada layar desktop) dengan bingkai aksen visual yang seimbang.
9. WHEN Section Hero selesai memuat data dan pertama kali ditampilkan di layar Visitor, THE Hero_Section SHALL menerapkan animasi kemunculan bertingkat (Staggered Entrance Animation) yang mencakup: fade-in & slide-down pada badge status, fade-in & slide-up pada sapaan dan nama lengkap, pengetikan dinamis (typing effect) pada role, fade-in & slide-up pada tagline dan tombol CTA, serta efek zoom halus (scale-in) dengan aksen pendaran cahaya (glow) pada foto profil.

---

## Requirement 3: Section About

**User Story:** Sebagai Visitor, saya ingin mengetahui latar belakang dan kepribadian pemilik portfolio, sehingga saya dapat menilai kecocokan untuk kebutuhan saya.

### Acceptance Criteria

1. THE About_Section SHALL menampilkan foto diri/aktivitas mandiri yang berbeda dan terpisah dari foto Hero Section (menggunakan field `about_photo_url` dengan fallback gambar default khusus `about.png`).
2. THE About_Section SHALL menyajikan tata letak dua kolom yang harmonis: kolom visual foto potret artistik berbingkai rounded-2xl dengan aksen glow di sisi kiri, dan kolom konten di sisi kanan.
3. THE About_Section SHALL menampilkan bio deskriptif, filosofi koding, dan tombol unduh CV pemilik dalam format PDF pada kolom konten.
4. IF CV belum diunggah oleh Admin, THEN THE About_Section SHALL menyembunyikan tombol unduh CV.
5. THE About_Section SHALL menampilkan 4 kartu fakta menarik tentang diri pemilik dalam format grid di bawah teks bio.
6. WHILE data bio/profil sedang dimuat dari Supabase, THE About_Section SHALL menampilkan skeleton loader dan TIDAK menampilkan bio fallback sebelum proses pemuatan selesai.

---

## Requirement 4: Section Skills

**User Story:** Sebagai Visitor, saya ingin melihat keahlian teknis pemilik, sehingga saya dapat menilai kemampuan mereka secara cepat.

### Acceptance Criteria

1. THE Skills_Section SHALL menampilkan daftar keahlian yang dikelompokkan berdasarkan kategori (contoh: Frontend, Backend, Database, Tools).
2. THE Skills_Section SHALL menampilkan indikator level profisiensi untuk setiap keahlian.
3. WHEN Skills_Section pertama kali terlihat di layar Visitor, THE App SHALL memunculkan animasi pada indikator level profisiensi.

---

## Requirement 5: Section Projects

**User Story:** Sebagai Visitor, saya ingin menjelajahi portofolio proyek karya pemilik dalam format showcase galeri interaktif yang dapat digeser (slider/carousel), sehingga saya dapat melihat karya secara fokus dan visual tanpa membuat halaman memanjang ke bawah saat jumlah proyek bertambah banyak.

### Acceptance Criteria

1. **Interactive 3D Showcase Carousel**: THE Projects_Section SHALL menyajikan daftar karya proyek dalam format *3D Coverflow Showcase Gallery Carousel* horizontal yang dapat digeser ke kiri dan kanan secara interaktif.
2. **Center Active Focus & Perspective Stacking**: THE Carousel SHALL menampilkan proyek yang sedang aktif tepat di posisi tengah dengan skala penuh (1.05x–1.1x), z-index tertinggi, dan border bercahaya (*glow*), sedangkan kartu-kartu di sisi kiri dan kanan tersusun berjenjang (*cascaded*) dengan efek perspektif halus dan skala mengecil (0.85x).
3. **Active Detail View di Bawah Showcase**: THE Projects_Section SHALL menampilkan detail komprehensif dari proyek yang sedang aktif di tengah (Judul Proyek, Deskripsi Lengkap, Tag Teknologi yang digunakan, dan Tombol Tautan *"Lihat Detail Proyek →"* mengarah ke `/projects/:slug`).
4. **Kontrol Geser Lengkap & Interaktif**:
   - THE Carousel SHALL menyediakan tombol panah navigasi Sebelumnya (◀) dan Selanjutnya (▶).
   - THE Carousel SHALL menyediakan indikator pagination dots di bawah slider untuk mengetahui posisi dan melompat ke proyek tertentu.
   - WHEN Visitor mengklik kartu proyek di sisi kiri atau kanan, THE Carousel SHALL otomatis menggeser kartu tersebut menjadi kartu aktif di tengah.
   - THE Carousel SHALL mendukung gesture sentuhan geser (*touch swipe / drag*) pada perangkat ponsel pintar dan tablet.
5. **Fixed Section Height**: THE Projects_Section SHALL mempertahankan tinggi section yang ringkas dan konstan terlepas dari banyaknya proyek yang disimpan (tidak memanjang ke bawah).
6. IF tidak ada project yang tersimpan, THEN THE Projects_Section SHALL menampilkan pesan ramah bahwa belum ada project.
7. THE Projects_Section SHALL menampilkan skeleton loading selama data dimuat dari Supabase.

---

## Requirement 6: Halaman Detail Project

**User Story:** Sebagai Visitor, saya ingin melihat detail lengkap sebuah project, sehingga saya dapat memahami proses, arsitektur, dan tantangan di balik project tersebut.

### Acceptance Criteria

1. THE Detail_Page untuk project SHALL menampilkan: judul, status, kategori, overview, tech stack, arsitektur, fitur utama, tantangan & solusi, screenshots, serta tautan GitHub dan demo (jika tersedia).
2. THE Detail_Page SHALL menyediakan tombol kembali yang membawa Visitor ke Home_Page di section Projects.
3. WHEN Visitor mengakses route `/projects/:slug` dengan slug yang tidak valid, THE App SHALL mengarahkan Visitor ke halaman 404 atau kembali ke Home_Page.
4. THE Detail_Page untuk project SHALL menerapkan animasi transisi masuk (entrance animation) pada header dan gambar banner, serta menerapkan Scroll Reveal Animation (fade-in & slide-up) berbasis Intersection Observer pada setiap sub-bagian konten (Tech Stack, Gambaran & Masalah, Fitur & Arsitektur Utama, serta Dampak & Hasil) saat Visitor menggulir halaman ke bawah.

---

## Requirement 7: Section Journey & Qualifications (Pendidikan, Pengalaman, & Keahlian)

**User Story:** Sebagai Visitor, saya ingin menjelajahi riwayat pendidikan, pengalaman kerja profesional, dan keahlian teknis pemilik dalam satu wadah interaktif yang rapi, sehingga saya dapat menilai kompetensi dan rekam jejak mereka secara menyeluruh tanpa harus menggulir halaman terlalu panjang.

### Acceptance Criteria

1. THE Journey_Section SHALL menampilkan judul section (SectionTitle) dan deskripsinya secara terpusat di tengah (`align="center"`), serasi dengan bilah navigasi tab (Pill Switcher) yang juga berada di tengah.
2. THE Journey_Section SHALL menyediakan bilah navigasi tab berbentuk kapsul/pill switcher di bagian atas section dengan 3 tab berurutan: **[ Pendidikan ]**, **[ Pengalaman ]**, dan **[ Keahlian ]**.
3. THE Journey_Section SHALL menerapkan Scroll Reveal Animation dan transisi kemunculan halus (*fade-in & slide-up*) pada seluruh judul section, bilah tab, dan pada setiap kartu individu di dalam tab Pendidikan, Pengalaman, maupun grid Keahlian baik saat pertama kali digulir maupun saat berpindah tab.
4. THE Journey_Section SHALL menggunakan lebar kontainer penuh (`max-w-6xl`) di mana garis alur vertikal dan ikon penanda di sisi kiri tersusun rapi memberikan ruang horizontal yang luas bagi kartu linimasa.
5. **Tata Letak Selang-Seling (Alternating / Zigzag Layout)**: Pada Tab Pendidikan dan Tab Pengalaman, setiap kartu linimasa ber-border SHALL membagi kolom teks dan kolom foto secara berselang-seling pada layar desktop:
   - Entri ganjil (indeks 0, 2, ...): Kolom Teks berada di sisi Kiri dan Kolom Foto berada di sisi Kanan.
   - Entri genap (indeks 1, 3, ...): Kolom Foto berada di sisi Kiri dan Kolom Teks berada di sisi Kanan.
6. **Penempatan Badge Kalender di Baris Atas & Galeri Foto di Tengah Vertikal**: THE Card SHALL menempatkan badge kalender/periode waktu di baris paling atas kolom foto sehingga selalu sejajar horizontal dengan nama instansi/perusahaan, sedangkan wadah galeri foto mini diposisikan secara vertikal di tengah kartu (`my-auto` / vertically centered) agar komposisi visual seimbang dan foto tidak menumpuk canggung di bagian atas meninggalkan ruang kosong besar di bawahnya.
7. **Wadah Foto Dinamis & Tanpa Hardcode**:
   - Kolom foto SHALL menyusun thumbnail foto secara dinamis dan rapi mulai dari 1 hingga 4 foto mini tanpa pop-up modal.
   - IF suatu entri tidak memiliki foto di database, THEN kolom teks SHALL otomatis mengambil lebar penuh 100% (`col-span-12`), dan THE App SHALL TIDAK memaksakan gambar fallback hardcode apapun.
8. **Tab 1 — Pendidikan**: THE Tab_Pendidikan SHALL menampilkan riwayat institusi, jurusan/gelar, periode tahun, deskripsi studi, serta foto dokumentasi perkuliahan (jika tersedia).
9. **Tab 2 — Pengalaman**: THE Tab_Pengalaman SHALL menampilkan riwayat perusahaan, jabatan/role, periode tanggal, deskripsi tanggung jawab, serta foto dokumentasi pekerjaan atau sertifikat penugasan (jika tersedia).
10. **Tab 3 — Keahlian**: THE Tab_Keahlian SHALL menampilkan daftar teknologi dan alat bantu dalam bentuk grid kartu ikon *squircle* modern bercahaya lembut (*subtle glow*) disertai logo dan label teknologi (seperti Vue.js, Tailwind, JavaScript, Supabase, Git, dll.) sesuai konsep referensi desain modern.

---

## Requirement 8: Section Certificates

**User Story:** Sebagai Visitor, saya ingin menjelajahi bukti kredensial dan lisensi kompetensi pemilik dalam format showcase galeri interaktif yang dapat digeser (slider/carousel), sehingga saya dapat memverifikasi sertifikat dengan nyaman tanpa membuat halaman web memanjang ke bawah.

### Acceptance Criteria

1. **Interactive 3D Showcase Carousel**: THE Certificates_Section SHALL menyajikan kredensial sertifikasi dalam format *3D Coverflow Showcase Gallery Carousel* horizontal yang dapat digeser ke kiri dan kanan secara interaktif.
2. **Center Active Focus & Perspective Stacking**: THE Carousel SHALL menampilkan sertifikat yang sedang aktif tepat di posisi tengah dengan pratinjau sertifikat ukuran besar, bingkai bersinar (*glow*), dan z-index tertinggi, sementara kartu di sisi kiri dan kanan berjenjang dengan perspektif halus.
3. **Active Detail View di Bawah Showcase**: THE Certificates_Section SHALL menampilkan informasi detail sertifikat yang aktif di tengah (Nama Sertifikat, Penerbit resmi, Tanggal terbit, Kategori, dan Tombol Tautan *"Lihat Detail Sertifikat →"* mengarah ke `/certificates/:id`).
4. **Kontrol Geser Lengkap & Interaktif**:
   - THE Carousel SHALL menyediakan tombol navigasi panah ◀ dan ▶, pagination dots, klik langsung pada kartu samping, serta dukungan sentuhan geser (*touch swipe*).
5. **Fixed Section Height**: THE Certificates_Section SHALL mempertahankan tinggi section yang ringkas dan konstan terlepas dari banyaknya sertifikat yang tercatat.
6. THE Certificates_Section SHALL menampilkan skeleton loading selama data dimuat dari Supabase.

---

## Requirement 9: Halaman Detail Sertifikat

**User Story:** Sebagai Visitor, saya ingin melihat detail dan memverifikasi sertifikat, sehingga saya dapat mengkonfirmasi keasliannya.

### Acceptance Criteria

1. THE Detail_Page untuk sertifikat SHALL menampilkan: gambar sertifikat ukuran penuh, nama sertifikat, nama penerbit, tanggal terbit, kategori, dan deskripsi (jika ada).
2. IF URL verifikasi tersedia, THEN THE Detail_Page SHALL menampilkan tautan "Verifikasi Sertifikat" yang membuka URL tersebut di tab baru.
3. THE Detail_Page SHALL menyediakan tombol kembali yang membawa Visitor ke Home_Page di section Certificates.
4. THE Detail_Page untuk sertifikat SHALL menerapkan animasi transisi masuk (entrance animation) pada header dan pratinjau sertifikat, serta menerapkan Scroll Reveal Animation (fade-in & slide-up) berbasis Intersection Observer pada sub-bagian konten (Deskripsi & Ruang Lingkup, Keahlian yang Diverifikasi, dan Informasi Kredensial) saat Visitor menggulir halaman ke bawah.

---

## Requirement 10: Footer & Kontak

**User Story:** Sebagai Visitor, saya ingin dapat langsung mengirimkan pesan melalui formulir kontak atau menghubungi pemilik portofolio melalui kanal sosial resmi, sehingga komunikasi dan tawaran kerja sama dapat terjalin dengan mudah.

### Acceptance Criteria

1. THE Contact_Section SHALL mengusung tata letak 2 kolom responsif:
   - Kolom Kiri: Daftar tautan kontak langsung (Email, GitHub, LinkedIn, dan Instagram) dengan ikon merek, teks deskriptif, dan indikator hover.
   - Kolom Kanan: Kartu formulir pengiriman pesan langsung ("Kirim Pesan" / "Hubungi Saya") berlatar dark modern.
2. THE Contact_Form SHALL menyediakan kolom isian nama lengkap (`name`), alamat email (`email`), dan isi pesan (`message`) beserta ikon penjelas.
3. WHEN Visitor mengisi formulir dengan valid dan menekan tombol "Kirim Pesan", THE App SHALL menjalankan mekanisme pengiriman dua arah (*Dual-Delivery*):
   - Meneruskan pesan secara instan ke email pribadi pemilik portofolio (`aryakusuma863@gmail.com`) via email gateway.
   - Mencatat dan menyimpan data pesan ke dalam tabel `contact_messages` Supabase untuk keperluan arsip admin.
4. DURING pengiriman pesan, THE App SHALL menampilkan status loading/indikator pengiriman pada tombol kirim.
5. UPON pengiriman berhasil, THE App SHALL menampilkan banner notifikasi sukses dan mengosongkan kolom formulir.
6. IF pengiriman gagal karena kendala jaringan, THE App SHALL menampilkan pesan kesalahan yang ramah dan mempertahankan isian formulir.
7. WHEN Visitor mengklik tautan email di kolom kiri, THE App SHALL membuka aplikasi email default dengan alamat email pemilik.
8. WHEN Visitor mengklik tautan media sosial (GitHub, LinkedIn, Instagram), THE App SHALL membuka tautan tersebut di tab baru secara aman (`target="_blank"`).
9. THE Footer SHALL menampilkan teks hak cipta dengan nama pemilik dan tahun berjalan.

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

1. THE Admin_Panel SHALL menyusun urutan menu navigasi sidebar secara terstruktur: **Dashboard (`/admin/dashboard`)**, **Profil & Foto (`/admin/profile`)**, **Pendidikan Formal (`/admin/education`)**, **Pengalaman Kerja (`/admin/experience`)**, **Skills (`/admin/skills`)**, **Projects (`/admin/projects`)**, **Certificates (`/admin/certificates`)**, dan **Pesan Masuk (`/admin/messages`)**.
2. THE Admin_Profile_View SHALL menyediakan form untuk memperbarui data identitas pemilik (nama, title, bio, tagline, sosial media, cv_url), dua uploader gambar terpisah (Foto Hero dan Foto Tentang Saya), serta **narasi lengkap Tentang Saya (Paragraf 1 Bio, Paragraf 2 Filosofi Kerja bout_philosophy, dan 4 Kartu Sorotan & Prinsip bout_highlights)** yang terintegrasi dinamis ke halaman publik.
3. THE Admin_Experience_Form & Education_Form SHALL secara otomatis menentukan kategori riwayat (`education` atau `work`) berdasarkan konteks halaman pemanggil tanpa memerlukan tombol pemilih kategori manual di dalam modal, serta menyediakan Multi-Image Uploader yang memungkinkan admin mengatur ulang urutan foto (#1, #2, #3, #4) menggunakan tombol geser kiri/kanan.
4. THE Admin_Skill_Form & Skills_View SHALL menggunakan latar belakang solid konsisten (`bg-surface-alt border border-border`) dan TIDAK menggunakan latar transparan/bening yang memperlihatkan teks di belakang modal.
5. THE Admin_Panel & Frontend SHALL mengurutkan seluruh entri konten (**Pengalaman Kerja, Pendidikan Formal, Skills, Projects, dan Certificates**) berdasarkan `sort_order ASC`, serta menyediakan kontrol geser posisi (Naikkan ▲ / Turunkan ▼) dan indikator nomor urut (`#1`, `#2`, ...) pada setiap baris/kartu daftar di admin sehingga admin dapat menentukan entri mana yang tampil paling atas atau urutan tampilan publik secara instan.
4. WHEN Admin menambah atau mengubah data, THE App SHALL memvalidasi input sebelum menyimpan ke Supabase.
5. WHEN Admin menekan tombol hapus pada sebuah entri, THE App SHALL menampilkan konfirmasi sebelum menghapus data secara permanen.
6. THE Admin_Panel SHALL menyediakan antarmuka upload gambar untuk cover project, gambar sertifikat, foto profil Hero, foto Tentang Saya, galeri foto pengalaman/pendidikan, dan diagram arsitektur project.
7. THE Admin_Panel SHALL menampilkan daftar pesan yang masuk dari pengunjung beserta status sudah dibaca atau belum.
8. WHEN Admin menandai pesan sebagai sudah dibaca, THE App SHALL memperbarui status pesan tersebut.
9. **Interactive Image Cropper / Framing**: THE Image_Uploader and Multi_Image_Uploader SHALL menyediakan modal pemotong gambar interaktif (ImageCropperModal) saat Admin memilih berkas foto, yang memungkinkan Admin menggeser (drag/pan), memperbesar/memperkecil (zoom slider), serta memilih preset rasio aspek (16:9 untuk Cover Proyek & Linimasa, 4:3 untuk Sertifikat, 3:4 untuk Foto Tentang Saya, 1:1 untuk Foto Hero, atau Bebas/Free), dan memotong gambar secara presisi menggunakan HTML5 Canvas sebelum disimpan ke Supabase Storage, sehingga tidak ada bagian penting foto yang terpotong canggung di halaman publik.

---

## Non-Functional Requirements

| Requirement | Target |
|---|---|
| Responsivitas | Berfungsi dengan baik di mobile, tablet, dan desktop |
| Performa | Halaman utama dapat digunakan dalam waktu wajar pada koneksi rata-rata |
| Aksesibilitas | Elemen interaktif dapat dijangkau via keyboard; kontras warna memadai |
| Keamanan | Data sensitif (pesan masuk, akses admin) dilindungi oleh RLS Supabase |
| Animasi & Interaksi | Menerapkan Staggered Entrance Animation pada Section Hero saat dibuka, Scroll Reveal Animation (fade-in & slide-up) berbasis Intersection Observer pada seluruh judul section dan grup kartu di halaman utama, serta animasi masuk & scroll reveal pada setiap sub-bagian di halaman detail (Project & Certificate) |
| Bahasa | Seluruh teks antarmuka dalam Bahasa Indonesia |
