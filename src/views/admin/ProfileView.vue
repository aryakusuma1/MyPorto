<script setup>
import { reactive, ref, onMounted } from 'vue'
import {
  User,
  Save,
  CheckCircle,
  AlertCircle,
  Sparkles,
  FileText,
  Mail,
  Github,
  Linkedin,
  Instagram,
  Image as ImageIcon,
  Compass,
  Layers,
} from 'lucide-vue-next'
import { useProfileStore } from '../../stores/profile.store'
import BaseButton from '../../components/ui/BaseButton.vue'
import ImageUploader from '../../components/admin/ImageUploader.vue'

const profileStore = useProfileStore()

const isSaving = ref(false)
const statusMessage = ref('')
const errorMessage = ref('')

const defaultPhilosophy =
  'Saya percaya bahwa kode yang hebat bukan hanya yang bisa berjalan, melainkan kode yang mudah dipelihara, teruji, dan terdokumentasi dengan baik. Setiap proyek dikerjakan dengan perhatian penuh pada detail, arsitektur yang bersih, dan performa yang optimal.'

const defaultHighlights = [
  {
    icon: 'code',
    title: 'Fokus Teknologi',
    desc: 'Spesialisasi pada Vue.js, arsitektur modern, REST API, dan basis data SQL.',
  },
  {
    icon: 'sparkles',
    title: 'Prinsip Koding',
    desc: 'Mengutamakan Clean Code, keterbacaan, dan pengembangan berbasis spesifikasi (SDD).',
  },
  {
    icon: 'book',
    title: 'Pembelajar Aktif',
    desc: 'Gemar mengeksplorasi teknologi baru dan mendalami arsitektur perangkat lunak.',
  },
  {
    icon: 'map-pin',
    title: 'Domisili',
    desc: 'Indonesia — Terbuka untuk peluang kerja remote maupun on-site.',
  },
]

const form = reactive({
  id: '',
  full_name: '',
  title: '',
  tagline: '',
  bio: '',
  about_philosophy: '',
  about_highlights: JSON.parse(JSON.stringify(defaultHighlights)),
  email: '',
  github_url: '',
  linkedin_url: '',
  instagram_url: '',
  cv_url: '',
  photo_url: '',
  about_photo_url: '',
})

async function loadProfile() {
  const data = await profileStore.fetchProfile()
  if (data) {
    form.id = data.id || ''
    form.full_name = data.full_name || ''
    form.title = data.title || ''
    form.tagline = data.tagline || ''
    form.bio = data.bio || ''
    form.about_philosophy = data.about_philosophy || defaultPhilosophy
    if (Array.isArray(data.about_highlights) && data.about_highlights.length === 4) {
      form.about_highlights = data.about_highlights
    } else {
      form.about_highlights = JSON.parse(JSON.stringify(defaultHighlights))
    }
    form.email = data.email || ''
    form.github_url = data.github_url || ''
    form.linkedin_url = data.linkedin_url || ''
    form.instagram_url = data.instagram_url || ''
    form.cv_url = data.cv_url || ''
    form.photo_url = data.photo_url || ''
    form.about_photo_url = data.about_photo_url || ''
  }
}

async function handleSave() {
  errorMessage.value = ''
  statusMessage.value = ''

  if (!form.full_name.trim()) {
    errorMessage.value = 'Nama lengkap wajib diisi.'
    return
  }

  isSaving.value = true

  const payload = {
    full_name: form.full_name.trim(),
    title: form.title.trim() || null,
    tagline: form.tagline.trim() || null,
    bio: form.bio.trim() || null,
    about_philosophy: form.about_philosophy.trim() || null,
    about_highlights: form.about_highlights,
    email: form.email.trim() || null,
    github_url: form.github_url.trim() || null,
    linkedin_url: form.linkedin_url.trim() || null,
    instagram_url: form.instagram_url.trim() || null,
    cv_url: form.cv_url.trim() || null,
    photo_url: form.photo_url.trim() || null,
    about_photo_url: form.about_photo_url.trim() || null,
    updated_at: new Date().toISOString(),
  }

  if (form.id) {
    payload.id = form.id
  }

  const result = await profileStore.updateProfile(payload)

  if (result.success) {
    statusMessage.value = 'Data profil, narasi Tentang Saya, dan foto berhasil diperbarui!'
    setTimeout(() => {
      statusMessage.value = ''
    }, 4500)
  } else {
    errorMessage.value = result.error || 'Gagal menyimpan data profil ke database.'
  }

  isSaving.value = false
}

onMounted(() => {
  loadProfile()
})
</script>

<template>
  <div class="space-y-8 max-w-6xl">
    <!-- Header Page -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-border/80">
      <div>
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
            <User class="w-5 h-5" />
          </div>
          <h1 class="text-2xl font-bold font-heading text-ink">Profil & Biodata</h1>
        </div>
        <p class="text-ink-muted text-sm mt-1">
          Kelola informasi identitas, narasi lengkap Tentang Saya, foto profil, dan dokumen CV.
        </p>
      </div>

      <BaseButton
        variant="primary"
        @click="handleSave"
        :loading="isSaving"
        class="self-start sm:self-auto shadow-md"
      >
        <Save class="w-4 h-4 mr-2" />
        Simpan Perubahan
      </BaseButton>
    </div>

    <!-- Alert Notifications -->
    <div
      v-if="statusMessage"
      class="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800 text-emerald-200 text-sm flex items-center gap-3 animate-fade-in shadow-sm"
    >
      <CheckCircle class="w-5 h-5 text-emerald-400 shrink-0" />
      <span>{{ statusMessage }}</span>
    </div>

    <div
      v-if="errorMessage"
      class="p-4 rounded-xl bg-red-950/40 border border-red-800 text-red-200 text-sm flex items-center gap-3 animate-fade-in shadow-sm"
    >
      <AlertCircle class="w-5 h-5 text-red-400 shrink-0" />
      <span>{{ errorMessage }}</span>
    </div>

    <!-- Main Grid Form -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <!-- Kolom Kiri: Data Teks & Identitas (lg:col-span-7) -->
      <div class="lg:col-span-7 space-y-6">
        <!-- Card 1: Informasi Dasar (Hero Section) -->
        <div class="bg-surface-alt border border-border rounded-2xl p-6 shadow-sm space-y-5">
          <div class="flex items-center gap-2 pb-3 border-b border-border/60">
            <Sparkles class="w-4 h-4 text-accent" />
            <h2 class="font-heading font-semibold text-ink text-base">Identitas Diri (Hero Section)</h2>
          </div>

          <div>
            <label class="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-2">
              Nama Lengkap *
            </label>
            <input
              v-model="form.full_name"
              type="text"
              placeholder="Contoh: Arya"
              class="w-full px-4 py-2.5 bg-surface-raised border border-border/80 rounded-xl text-ink text-sm focus:outline-none focus:border-accent transition-colors"
              required
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-2">
              Peran / Jabatan Profesional (Hero Title)
            </label>
            <input
              v-model="form.title"
              type="text"
              placeholder="Contoh: Full Stack Software Engineer & Web Developer"
              class="w-full px-4 py-2.5 bg-surface-raised border border-border/80 rounded-xl text-ink text-sm focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-2">
              Tagline Singkat (Hero Subtitle)
            </label>
            <input
              v-model="form.tagline"
              type="text"
              placeholder="Contoh: Merancang dan membangun aplikasi web modern, modular, dan berperforma tinggi."
              class="w-full px-4 py-2.5 bg-surface-raised border border-border/80 rounded-xl text-ink text-sm focus:outline-none focus:border-accent transition-colors"
            />
          </div>
        </div>

        <!-- Card 2: Konten Narasi & Filosofi Tentang Saya (About Section) -->
        <div class="bg-surface-alt border border-border rounded-2xl p-6 shadow-sm space-y-5">
          <div class="flex items-center gap-2 pb-3 border-b border-border/60">
            <Compass class="w-4 h-4 text-accent" />
            <div>
              <h2 class="font-heading font-semibold text-ink text-base">Narasi & Filosofi (About Section)</h2>
              <span class="text-[11px] text-ink-muted block">Tampil pada sisi kanan kolom teks Tentang Saya</span>
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-2">
              Paragraf 1: Latar Belakang & Bio Singkat
            </label>
            <textarea
              v-model="form.bio"
              rows="4"
              placeholder="Jelaskan spesialisasi, latar belakang teknis, dan keahlian utama Anda..."
              class="w-full px-4 py-2.5 bg-surface-raised border border-border/80 rounded-xl text-ink text-sm focus:outline-none focus:border-accent transition-colors resize-none leading-relaxed"
            ></textarea>
          </div>

          <div>
            <label class="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-2">
              Paragraf 2: Filosofi Kerja & Prinsip Rekayasa Koding
            </label>
            <textarea
              v-model="form.about_philosophy"
              rows="4"
              placeholder="Jelaskan etos kerja, perhatian terhadap Clean Code, maintainability, atau testing..."
              class="w-full px-4 py-2.5 bg-surface-raised border border-border/80 rounded-xl text-ink text-sm focus:outline-none focus:border-accent transition-colors resize-none leading-relaxed"
            ></textarea>
          </div>
        </div>

        <!-- Card 3: 4 Kartu Sorotan & Prinsip Kerja (4 Ke Bawah / Wide Linear Row) -->
        <div class="bg-surface-alt border border-border rounded-2xl p-6 shadow-sm space-y-5">
          <div class="flex items-center justify-between pb-3 border-b border-border/60">
            <div class="flex items-center gap-2">
              <Layers class="w-4 h-4 text-accent" />
              <div>
                <h2 class="font-heading font-semibold text-ink text-base">4 Kartu Sorotan & Prinsip Kerja</h2>
                <span class="text-[11px] text-ink-muted block">Tampil pada grid di bawah tombol Unduh CV</span>
              </div>
            </div>
          </div>

          <!-- 4 Kartu Sorotan Sebelah-sebelahan (Grid 2x2 Tanpa Nomor) -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              v-for="(card, cIdx) in form.about_highlights"
              :key="cIdx"
              class="p-4 rounded-xl bg-surface-raised border border-border/80 space-y-3 transition-colors hover:border-accent/40"
            >
              <div>
                <label class="block text-[11px] font-semibold text-ink-muted uppercase tracking-wider mb-1.5">
                  Judul Kartu
                </label>
                <input
                  v-model="card.title"
                  type="text"
                  placeholder="Contoh: Fokus Teknologi"
                  class="w-full px-3.5 py-2 bg-surface-alt border border-border/80 rounded-xl text-ink text-sm focus:outline-none focus:border-accent transition-colors font-medium"
                  required
                />
              </div>

              <div>
                <label class="block text-[11px] font-semibold text-ink-muted uppercase tracking-wider mb-1.5">
                  Deskripsi Singkat
                </label>
                <textarea
                  v-model="card.desc"
                  rows="3"
                  placeholder="Keterangan singkat..."
                  class="w-full px-3.5 py-2 bg-surface-alt border border-border/80 rounded-xl text-ink text-sm focus:outline-none focus:border-accent transition-colors resize-none leading-relaxed"
                  required
                ></textarea>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Kolom Kanan: Pengelolaan Foto & Media + Kontak Sosial (lg:col-span-5) -->
      <div class="lg:col-span-5 space-y-6">
        <!-- Box Foto Hero (Beranda Utama) - DI ATAS -->
        <div class="bg-surface-alt border border-border rounded-2xl p-6 shadow-sm space-y-4">
          <div class="flex items-center gap-2 pb-3 border-b border-border/60">
            <User class="w-4 h-4 text-accent" />
            <div>
              <h2 class="font-heading font-semibold text-ink text-base">Foto Hero Section</h2>
              <span class="text-[11px] text-ink-muted block">Tampil di halaman utama Hero (1:1)</span>
            </div>
          </div>

          <p class="text-xs text-ink-muted leading-relaxed">
            Foto potret transparan/berbingkai yang menjadi sorotan utama di sisi kanan section Hero.
          </p>

          <ImageUploader
            v-model="form.photo_url"
            folder="profiles"
            label="Unggah Foto Hero"
            aspect-ratio="1:1"
          />
        </div>

        <!-- Box Foto Section Tentang Saya (About) - DI BAWAH HERO -->
        <div class="bg-surface-alt border border-border rounded-2xl p-6 shadow-sm space-y-4">
          <div class="flex items-center gap-2 pb-3 border-b border-border/60">
            <ImageIcon class="w-4 h-4 text-accent" />
            <div>
              <h2 class="font-heading font-semibold text-ink text-base">Foto Tentang Saya</h2>
              <span class="text-[11px] text-ink-muted block">Tampil pada Section About (3:4)</span>
            </div>
          </div>

          <p class="text-xs text-ink-muted leading-relaxed">
            Foto potret/kegiatan artistik yang tampil di sisi kiri kolom visual section Tentang Saya.
          </p>

          <ImageUploader
            v-model="form.about_photo_url"
            folder="profiles"
            label="Unggah Foto Tentang Saya"
            aspect-ratio="3:4"
          />
        </div>

        <!-- Card: Kontak & Media Sosial (Pindah ke samping kanan sesuai instruksi) -->
        <div class="bg-surface-alt border border-border rounded-2xl p-6 shadow-sm space-y-5">
          <div class="flex items-center gap-2 pb-3 border-b border-border/60">
            <Mail class="w-4 h-4 text-accent" />
            <h2 class="font-heading font-semibold text-ink text-base">Kontak & Tautan Sosial</h2>
          </div>

          <div>
            <label class="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-2">
              Email Publik
            </label>
            <input
              v-model="form.email"
              type="email"
              placeholder="nama@email.com"
              class="w-full px-4 py-2.5 bg-surface-raised border border-border/80 rounded-xl text-ink text-sm focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-2">
              Tautan Profil GitHub
            </label>
            <div class="relative">
              <Github class="w-4 h-4 text-ink-muted absolute left-3.5 top-3 pointer-events-none" />
              <input
                v-model="form.github_url"
                type="url"
                placeholder="https://github.com/username"
                class="w-full pl-10 pr-4 py-2.5 bg-surface-raised border border-border/80 rounded-xl text-ink text-sm focus:outline-none focus:border-accent transition-colors"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-2">
              Tautan Profil LinkedIn
            </label>
            <div class="relative">
              <Linkedin class="w-4 h-4 text-ink-muted absolute left-3.5 top-3 pointer-events-none" />
              <input
                v-model="form.linkedin_url"
                type="url"
                placeholder="https://linkedin.com/in/username"
                class="w-full pl-10 pr-4 py-2.5 bg-surface-raised border border-border/80 rounded-xl text-ink text-sm focus:outline-none focus:border-accent transition-colors"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-2">
              Tautan Profil Instagram
            </label>
            <div class="relative">
              <Instagram class="w-4 h-4 text-ink-muted absolute left-3.5 top-3 pointer-events-none" />
              <input
                v-model="form.instagram_url"
                type="url"
                placeholder="https://instagram.com/username"
                class="w-full pl-10 pr-4 py-2.5 bg-surface-raised border border-border/80 rounded-xl text-ink text-sm focus:outline-none focus:border-accent transition-colors"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-2">
              Tautan Berkas CV / Resume (PDF URL)
            </label>
            <div class="relative">
              <FileText class="w-4 h-4 text-ink-muted absolute left-3.5 top-3 pointer-events-none" />
              <input
                v-model="form.cv_url"
                type="url"
                placeholder="https://.../cv.pdf atau link Google Drive publik"
                class="w-full pl-10 pr-4 py-2.5 bg-surface-raised border border-border/80 rounded-xl text-ink text-sm focus:outline-none focus:border-accent transition-colors"
              />
            </div>
            <p class="text-[11px] text-ink-muted mt-1.5">
              Tombol "Unduh CV" pada section Tentang Saya akan otomatis aktif jika URL ini terisi.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
