<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import {
  Mail,
  Github,
  Linkedin,
  Instagram,
  ArrowUpRight,
  User,
  MessageSquare,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
} from 'lucide-vue-next'
import { useProfileStore } from '../../stores/profile.store'
import { useIntersection } from '../../composables/useIntersection'
import { supabase } from '../../lib/supabase'
import SectionTitle from '../ui/SectionTitle.vue'
import BaseButton from '../ui/BaseButton.vue'

const profileStore = useProfileStore()
const contentRef = ref(null)
const { isVisible, observe } = useIntersection({ threshold: 0.15 })
const currentYear = new Date().getFullYear()

// Data kontak & media sosial (Dinamis dari Profile)
const contacts = computed(() => {
  const p = profileStore.profile
  return [
    {
      name: 'Email Langsung',
      value: p?.email || 'aryakusuma863@gmail.com',
      url: `mailto:${p?.email || 'aryakusuma863@gmail.com'}`,
      icon: Mail,
      desc: 'Kirimkan email langsung untuk diskusi atau penawaran.',
      isExternal: false,
    },
    {
      name: 'GitHub',
      value: 'github.com/aryakusuma1',
      url: p?.github_url || 'https://github.com/aryakusuma1',
      icon: Github,
      desc: 'Lihat repositori kode dan kontribusi open source saya.',
      isExternal: true,
    },
    {
      name: 'LinkedIn',
      value: 'linkedin.com/in/arya-kusuma',
      url: p?.linkedin_url || 'https://www.linkedin.com',
      icon: Linkedin,
      desc: 'Mari terhubung secara profesional dan perluas jejaring.',
      isExternal: true,
    },
    {
      name: 'Instagram',
      value: p?.instagram_url
        ? p.instagram_url.replace(/^https?:\/\/(www\.)?instagram\.com\//, '@').replace(/\/$/, '')
        : '@aryakusuma',
      url: p?.instagram_url || 'https://instagram.com',
      icon: Instagram,
      desc: 'Ikuti aktivitas visual dan keseharian kreatif saya.',
      isExternal: true,
    },
  ]
})

// Form State
const form = reactive({
  name: '',
  email: '',
  message: '',
})

const isSubmitting = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

async function handleSubmit() {
  errorMessage.value = ''
  successMessage.value = ''

  if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
    errorMessage.value = 'Mohon lengkapi nama, email, dan pesan Anda sebelum mengirim.'
    return
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(form.email.trim())) {
    errorMessage.value = 'Format alamat email tidak valid.'
    return
  }

  isSubmitting.value = true

  const senderName = form.name.trim()
  const senderEmail = form.email.trim()
  const senderMessage = form.message.trim()
  const recipientEmail = profileStore.profile?.email || 'aryakusuma863@gmail.com'

  let emailDelivered = false
  let dbSaved = false

  try {
    // 1. Kirim Email Notifikasi Instan via Gateway FormSubmit AJAX
    try {
      const emailRes = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(recipientEmail)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          name: senderName,
          email: senderEmail,
          message: senderMessage,
          _subject: `Pesan Baru Portofolio dari ${senderName}`,
          _template: 'table',
        }),
      })

      if (emailRes.ok) {
        emailDelivered = true
      }
    } catch (eErr) {
      console.warn('[Contact] FormSubmit gateway response:', eErr)
    }

    // 2. Arsipkan Pesan ke Supabase tabel contact_messages
    try {
      const { error: dbError } = await supabase.from('contact_messages').insert({
        name: senderName,
        email: senderEmail,
        message: senderMessage,
        is_read: false,
      })
      if (!dbError) {
        dbSaved = true
      } else {
        console.warn('[Contact] Supabase insert warning:', dbError.message)
      }
    } catch (dbErr) {
      console.warn('[Contact] Supabase exception:', dbErr)
    }

    // Jika salah satu atau keduanya berhasil, konfirmasi sukses ke pengguna
    if (emailDelivered || dbSaved) {
      successMessage.value = 'Terima kasih! Pesan Anda telah berhasil terkirim langsung ke email saya dan tercatat di sistem.'
      form.name = ''
      form.email = ''
      form.message = ''
    } else {
      throw new Error('Gagal mengirim pesan melalui jaringan. Silakan hubungi langsung via email.')
    }
  } catch (err) {
    console.error('[Contact] Error submitting form:', err)
    errorMessage.value = err.message || 'Terjadi kesalahan saat mengirim pesan. Silakan coba kembali.'
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  if (contentRef.value) {
    observe(contentRef.value)
  }
})
</script>

<template>
  <footer id="contact" class="py-20 border-t border-border/60 bg-surface-alt/40 relative overflow-hidden">
    <!-- Ambient Glow Effect -->
    <div
      class="absolute bottom-1/4 right-1/4 w-[500px] h-[350px] bg-accent/5 rounded-full blur-3xl pointer-events-none"
    ></div>

    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <SectionTitle
        tag="Hubungi Saya"
        title="Mari Terhubung & Berkolaborasi"
        subtitle="Punya ide proyek, peluang kerja sama, atau sekadar ingin menyapa? Kirimkan pesan langsung atau terhubung melalui media sosial resmi saya."
        align="center"
        margin-bottom="mb-10 sm:mb-12"
      />

      <!-- Main 2-Column Responsive Layout -->
      <div
        ref="contentRef"
        class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start max-w-5xl mx-auto mb-16 transition-all duration-700 ease-out transform"
        :class="isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
      >
        <!-- Kolom Kiri: List Kartu Kontak & Media Sosial (lg:col-span-5) -->
        <div class="lg:col-span-5 space-y-4">
          <div class="mb-5">
            <h3 class="font-heading font-bold text-xl text-ink flex items-center gap-2">
              <Sparkles class="w-4 h-4 text-accent" />
              <span>Hubungi Kontak saya</span>
            </h3>
            <p class="text-xs sm:text-sm text-ink-muted mt-1 leading-relaxed">
              Pilih kanal komunikasi favorit Anda untuk berinteraksi langsung atau meninjau karya saya.
            </p>
          </div>

          <!-- 4 List Cards (Hanya Ikon, Tanpa Angka) -->
          <div class="space-y-3">
            <a
              v-for="item in contacts"
              :key="item.name"
              :href="item.url"
              :target="item.isExternal ? '_blank' : '_self'"
              :rel="item.isExternal ? 'noopener noreferrer' : ''"
              class="block group"
            >
              <div
                class="rounded-2xl border border-border/80 bg-surface-alt/80 hover:bg-surface-raised hover:border-accent/60 p-4 transition-all duration-300 shadow-sm flex items-center justify-between group-hover:shadow-[0_0_20px_rgba(255,107,0,0.1)] group-hover:-translate-y-0.5"
              >
                <div class="flex items-center gap-3.5 min-w-0 pr-2">
                  <!-- Brand Icon Container -->
                  <div
                    class="w-11 h-11 rounded-xl bg-surface-raised border border-border/80 flex items-center justify-center text-accent shrink-0 group-hover:scale-105 group-hover:bg-accent group-hover:text-white transition-all duration-300 shadow-sm"
                  >
                    <component :is="item.icon" class="w-5 h-5" />
                  </div>

                  <!-- Text Details -->
                  <div class="min-w-0">
                    <span class="text-[11px] font-mono text-ink-muted block uppercase tracking-wider">
                      {{ item.name }}
                    </span>
                    <span class="text-sm font-semibold text-ink group-hover:text-accent transition-colors truncate block mt-0.5">
                      {{ item.value }}
                    </span>
                  </div>
                </div>

                <!-- External Arrow -->
                <div class="w-8 h-8 rounded-lg flex items-center justify-center text-ink-muted group-hover:text-accent group-hover:bg-surface transition-all shrink-0">
                  <ArrowUpRight class="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </div>
            </a>
          </div>
        </div>

        <!-- Kolom Kanan: Card Form Kirim Pesan (lg:col-span-7) -->
        <div class="lg:col-span-7">
          <div
            class="rounded-3xl border border-border/80 bg-surface-alt/90 backdrop-blur-xl p-6 sm:p-8 shadow-2xl relative overflow-hidden"
          >
            <!-- Header Form -->
            <div class="mb-6">
              <span class="text-xs font-mono font-medium text-accent uppercase tracking-wider block mb-1">
                Kirim Pesan Langsung
              </span>
              <h3 class="font-heading font-bold text-xl sm:text-2xl text-ink">
                Ada proyek atau kerja sama?
              </h3>
              <p class="text-xs sm:text-sm text-ink-muted mt-1 leading-relaxed">
                Tinggalkan pesan di bawah ini. Notifikasi akan diteruskan langsung ke email saya.
              </p>
            </div>

            <!-- Formulir Kontak -->
            <form @submit.prevent="handleSubmit" class="space-y-4">
              <!-- Field Nama -->
              <div>
                <label class="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                  Nama Anda
                </label>
                <div
                  class="rounded-xl border border-border bg-surface-raised/80 focus-within:border-accent focus-within:ring-1 focus-within:ring-accent transition-all flex items-center shadow-inner"
                >
                  <User class="w-4 h-4 text-ink-muted ml-3.5 shrink-0" />
                  <input
                    v-model="form.name"
                    type="text"
                    required
                    placeholder="Masukkan nama lengkap Anda"
                    class="w-full bg-transparent px-3 py-3 text-sm text-ink placeholder:text-ink-muted/50 focus:outline-none"
                    :disabled="isSubmitting"
                  />
                </div>
              </div>

              <!-- Field Email -->
              <div>
                <label class="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                  Alamat Email Anda
                </label>
                <div
                  class="rounded-xl border border-border bg-surface-raised/80 focus-within:border-accent focus-within:ring-1 focus-within:ring-accent transition-all flex items-center shadow-inner"
                >
                  <Mail class="w-4 h-4 text-ink-muted ml-3.5 shrink-0" />
                  <input
                    v-model="form.email"
                    type="email"
                    required
                    placeholder="nama@email.com"
                    class="w-full bg-transparent px-3 py-3 text-sm text-ink placeholder:text-ink-muted/50 focus:outline-none"
                    :disabled="isSubmitting"
                  />
                </div>
              </div>

              <!-- Field Pesan -->
              <div>
                <label class="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                  Isi Pesan
                </label>
                <div
                  class="rounded-xl border border-border bg-surface-raised/80 focus-within:border-accent focus-within:ring-1 focus-within:ring-accent transition-all flex items-start pt-3 shadow-inner"
                >
                  <MessageSquare class="w-4 h-4 text-ink-muted ml-3.5 mt-0.5 shrink-0" />
                  <textarea
                    v-model="form.message"
                    rows="4"
                    required
                    placeholder="Ceritakan tentang proyek, ide kolaborasi, atau pertanyaan yang ingin Anda sampaikan..."
                    class="w-full bg-transparent px-3 pb-3 text-sm text-ink placeholder:text-ink-muted/50 focus:outline-none resize-none leading-relaxed"
                    :disabled="isSubmitting"
                  ></textarea>
                </div>
              </div>

              <!-- Success Alert Banner -->
              <div
                v-if="successMessage"
                class="p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-xs sm:text-sm flex items-start gap-2.5"
              >
                <CheckCircle2 class="w-5 h-5 shrink-0 text-green-400 mt-0.5" />
                <span class="leading-relaxed">{{ successMessage }}</span>
              </div>

              <!-- Error Alert Banner -->
              <div
                v-if="errorMessage"
                class="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs sm:text-sm flex items-start gap-2.5"
              >
                <AlertCircle class="w-5 h-5 shrink-0 text-red-400 mt-0.5" />
                <span class="leading-relaxed">{{ errorMessage }}</span>
              </div>

              <!-- Tombol Kirim -->
              <div class="pt-2">
                <BaseButton
                  type="submit"
                  variant="primary"
                  size="lg"
                  :disabled="isSubmitting"
                  class="w-full justify-center shadow-lg hover:shadow-accent/25 transition-all font-semibold py-3.5 cursor-pointer"
                >
                  <Loader2 v-if="isSubmitting" class="w-4 h-4 mr-2 animate-spin" />
                  <Send v-else class="w-4 h-4 mr-2" />
                  <span>{{ isSubmitting ? 'Mengirimkan Pesan...' : 'Kirim Pesan Sekarang' }}</span>
                </BaseButton>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Copyright Bar -->
      <div class="pt-8 border-t border-border/50 text-center">
        <p class="text-ink-muted text-xs sm:text-sm">
          &copy; {{ currentYear }} <span class="text-ink font-medium">Arya Kusuma</span>. Personal Portfolio Website.
        </p>
      </div>
    </div>
  </footer>
</template>
