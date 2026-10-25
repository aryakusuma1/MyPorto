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

const copiedEmail = ref(false)

function handleContactClick(item, event) {
  if (item.name.toLowerCase().includes('email')) {
    event.preventDefault()
    const email = item.value

    // Otomatis salin email ke clipboard untuk kenyamanan pengguna
    if (navigator.clipboard) {
      navigator.clipboard.writeText(email).then(() => {
        copiedEmail.value = true
        setTimeout(() => {
          copiedEmail.value = false
        }, 2500)
      }).catch(() => {})
    }

    // Deteksi perangkat cerdas:
    // - Jika di HP (Android / iOS): Panggil mailto: agar aplikasi Gmail / Mail bawaan HP langsung terbuka
    // - Jika di Laptop / PC: Buka Gmail Web Compose langsung di tab baru (bebas popup Windows)
    const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent)
    if (isMobile) {
      window.location.href = `mailto:${email}`
    } else {
      window.open(
        `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}`,
        '_blank',
        'noopener,noreferrer'
      )
    }
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
        class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch max-w-5xl mx-auto mb-16 transition-all duration-700 ease-out transform"
        :class="isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
      >
        <!-- Kolom Kiri: List Kartu Kontak & Media Sosial (lg:col-span-5) -->
        <div class="lg:col-span-5 flex flex-col justify-between">
          <div class="mb-4 sm:mb-5">
            <h3 class="font-heading font-bold text-xl text-ink flex items-center gap-2 mb-1">
              <Sparkles class="w-4 h-4 text-accent" />
              <span>Hubungi Kontak saya</span>
            </h3>
            <p class="text-xs sm:text-sm text-ink-muted leading-relaxed">
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
              class="block group cursor-pointer"
              @click="handleContactClick(item, $event)"
            >
              <div
                class="rounded-2xl border border-border/80 bg-surface-alt/80 hover:bg-surface-raised hover:border-accent/60 p-3.5 sm:p-4 transition-all duration-300 shadow-sm flex items-center justify-between group-hover:shadow-[0_0_20px_rgba(255,107,0,0.1)] group-hover:-translate-y-0.5"
              >
                <div class="flex items-center gap-3.5 min-w-0 pr-2">
                  <!-- Brand Icon Container -->
                  <div
                    class="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-surface-raised border border-border/80 flex items-center justify-center text-accent shrink-0 group-hover:scale-105 group-hover:bg-accent group-hover:text-white transition-all duration-300 shadow-sm"
                  >
                    <component :is="item.icon" class="w-5 h-5" />
                  </div>

                  <!-- Text Details -->
                  <div class="min-w-0">
                    <span class="text-[11px] font-mono text-ink-muted block uppercase tracking-wider flex items-center gap-2">
                      <span>{{ item.name }}</span>
                      <span
                        v-if="item.name.toLowerCase().includes('email') && copiedEmail"
                        class="text-[10px] text-green-400 font-sans font-medium px-1.5 py-0.5 rounded bg-green-500/10 border border-green-500/30 animate-fade-in"
                      >
                        Email Disalin!
                      </span>
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
        <div class="lg:col-span-7 flex flex-col">
          <div
            class="rounded-3xl border border-border/80 bg-surface-alt/90 backdrop-blur-xl p-5 sm:p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between h-full"
          >
            <!-- Header Form -->
            <div class="mb-3.5">
              <span class="text-[11px] font-mono font-medium text-accent uppercase tracking-wider block mb-0.5">
                Kirim Pesan Langsung
              </span>
              <h3 class="font-heading font-bold text-lg sm:text-xl text-ink">
                Ada proyek atau kerja sama?
              </h3>
              <p class="text-xs text-ink-muted mt-0.5 leading-relaxed">
                Tinggalkan pesan di bawah ini. Notifikasi akan diteruskan langsung ke email saya.
              </p>
            </div>

            <!-- Formulir Kontak -->
            <form @submit.prevent="handleSubmit" class="space-y-3 flex-1 flex flex-col justify-between">
              <!-- Grid 2-Kolom untuk Nama & Email -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <!-- Field Nama -->
                <div>
                  <label class="block text-[11px] font-semibold text-ink uppercase tracking-wider mb-1">
                    Nama Anda
                  </label>
                  <div
                    class="rounded-xl border border-border bg-surface-raised/80 focus-within:border-accent focus-within:ring-1 focus-within:ring-accent transition-all flex items-center shadow-inner"
                  >
                    <User class="w-4 h-4 text-ink-muted ml-3 shrink-0" />
                    <input
                      v-model="form.name"
                      type="text"
                      required
                      placeholder="Nama lengkap Anda"
                      class="w-full bg-transparent px-2.5 py-2.5 text-xs sm:text-sm text-ink placeholder:text-ink-muted/50 focus:outline-none"
                      :disabled="isSubmitting"
                    />
                  </div>
                </div>

                <!-- Field Email -->
                <div>
                  <label class="block text-[11px] font-semibold text-ink uppercase tracking-wider mb-1">
                    Alamat Email
                  </label>
                  <div
                    class="rounded-xl border border-border bg-surface-raised/80 focus-within:border-accent focus-within:ring-1 focus-within:ring-accent transition-all flex items-center shadow-inner"
                  >
                    <Mail class="w-4 h-4 text-ink-muted ml-3 shrink-0" />
                    <input
                      v-model="form.email"
                      type="email"
                      required
                      placeholder="nama@email.com"
                      class="w-full bg-transparent px-2.5 py-2.5 text-xs sm:text-sm text-ink placeholder:text-ink-muted/50 focus:outline-none"
                      :disabled="isSubmitting"
                    />
                  </div>
                </div>
              </div>

              <!-- Field Pesan -->
              <div class="flex-1 flex flex-col">
                <label class="block text-[11px] font-semibold text-ink uppercase tracking-wider mb-1">
                  Isi Pesan
                </label>
                <div
                  class="rounded-xl border border-border bg-surface-raised/80 focus-within:border-accent focus-within:ring-1 focus-within:ring-accent transition-all flex items-start pt-2.5 shadow-inner flex-1 min-h-[90px]"
                >
                  <MessageSquare class="w-4 h-4 text-ink-muted ml-3 mt-0.5 shrink-0" />
                  <textarea
                    v-model="form.message"
                    rows="3"
                    required
                    placeholder="Ceritakan tentang proyek, ide kolaborasi, atau pertanyaan yang ingin Anda sampaikan..."
                    class="w-full h-full bg-transparent px-2.5 pb-2 text-xs sm:text-sm text-ink placeholder:text-ink-muted/50 focus:outline-none resize-none leading-relaxed"
                    :disabled="isSubmitting"
                  ></textarea>
                </div>
              </div>

              <!-- Success Alert Banner -->
              <div
                v-if="successMessage"
                class="p-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-xs flex items-start gap-2"
              >
                <CheckCircle2 class="w-4 h-4 shrink-0 text-green-400 mt-0.5" />
                <span class="leading-relaxed">{{ successMessage }}</span>
              </div>

              <!-- Error Alert Banner -->
              <div
                v-if="errorMessage"
                class="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-2"
              >
                <AlertCircle class="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                <span class="leading-relaxed">{{ errorMessage }}</span>
              </div>

              <!-- Tombol Kirim -->
              <div class="pt-1">
                <BaseButton
                  type="submit"
                  variant="primary"
                  size="md"
                  :disabled="isSubmitting"
                  class="w-full justify-center shadow-lg hover:shadow-accent/25 transition-all font-semibold py-2.5 sm:py-3 cursor-pointer text-sm"
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
