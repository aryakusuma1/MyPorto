<script setup>
import { computed, ref, onMounted } from 'vue'
import { Download, Code2, Sparkles, BookOpen, MapPin, UserCheck } from 'lucide-vue-next'
import { useProfileStore } from '../../stores/profile.store'
import { useIntersection } from '../../composables/useIntersection'
import SectionTitle from '../ui/SectionTitle.vue'
import BaseButton from '../ui/BaseButton.vue'
import BaseCard from '../ui/BaseCard.vue'
import defaultHeroImg from '../../assets/hero.png'

const profileStore = useProfileStore()
const contentRef = ref(null)
const { isVisible, observe } = useIntersection({ threshold: 0.15 })

const defaultBio =
  'Saya adalah seorang pengembang perangkat lunak yang berfokus pada pembangunan solusi web modern yang tangguh, modular, dan terstruktur. Terbiasa mengelola alur pengembangan dari pemodelan basis data relasional hingga implementasi antarmuka yang intuitif dan responsif.'

const defaultPhilosophy =
  'Saya percaya bahwa kode yang hebat bukan hanya yang bisa berjalan, melainkan kode yang mudah dipelihara, teruji, dan terdokumentasi dengan baik. Setiap proyek dikerjakan dengan perhatian penuh pada detail, arsitektur yang bersih, dan performa yang optimal.'

const defaultFacts = [
  {
    icon: Code2,
    title: 'Fokus Teknologi',
    desc: 'Spesialisasi pada Vue.js, arsitektur modern, REST API, dan basis data SQL.',
  },
  {
    icon: Sparkles,
    title: 'Prinsip Koding',
    desc: 'Mengutamakan Clean Code, keterbacaan, dan pengembangan berbasis spesifikasi (SDD).',
  },
  {
    icon: BookOpen,
    title: 'Pembelajar Aktif',
    desc: 'Gemar mengeksplorasi teknologi baru dan mendalami arsitektur perangkat lunak.',
  },
  {
    icon: MapPin,
    title: 'Domisili',
    desc: 'Indonesia — Terbuka untuk peluang kerja remote maupun on-site.',
  },
]

const profile = computed(() => profileStore.profile)

const aboutPhoto = computed(() => {
  return profile.value?.about_photo_url || profile.value?.avatar_url || defaultHeroImg
})

const bioText = computed(() => {
  return profile.value?.bio || defaultBio
})

const philosophyText = computed(() => {
  return profile.value?.about_philosophy || defaultPhilosophy
})

// Pemetaan icon dinamis untuk 4 kartu sorotan
const defaultIcons = [Code2, Sparkles, BookOpen, MapPin]

const facts = computed(() => {
  const highlights = profile.value?.about_highlights
  if (Array.isArray(highlights) && highlights.length > 0) {
    return highlights.map((item, idx) => ({
      icon: defaultIcons[idx % defaultIcons.length],
      title: item.title || defaultFacts[idx]?.title || 'Sorotan',
      desc: item.desc || defaultFacts[idx]?.desc || '',
    }))
  }
  return defaultFacts
})

const cvUrl = computed(() => profile.value?.cv_url || null)

function downloadCV() {
  if (cvUrl.value) {
    window.open(cvUrl.value, '_blank')
  }
}

onMounted(() => {
  if (contentRef.value) {
    observe(contentRef.value)
  }
})
</script>

<template>
  <section id="about" class="py-20 border-t border-border/50 relative overflow-hidden">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <SectionTitle
        tag="Tentang Saya"
        title="Mengenal Lebih Dekat"
        subtitle="Sekilas mengenai latar belakang, filosofi kerja, dan kepribadian profesional saya."
      />

      <div
        ref="contentRef"
        class="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 lg:items-center items-start transition-all duration-700 ease-out transform"
        :class="isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
      >
        <!-- Kolom Kiri: Foto Potret Mandiri Artistik & Tombol CV di Atas (Selalu Vertically Centered di Tengah) -->
        <div class="lg:col-span-5 flex flex-col items-center justify-center self-center w-full">
          <!-- Tombol CV di Bagian Atas Foto Tengah-Tengah -->
          <div v-if="cvUrl" class="mb-4 sm:mb-5 flex justify-center w-full">
            <BaseButton variant="primary" size="md" class="shadow-lg hover:shadow-accent/25 transition-all" @click="downloadCV">
              <Download class="w-4 h-4 mr-2" />
              Unduh Curriculum Vitae (PDF)
            </BaseButton>
          </div>

          <div class="relative group w-full max-w-sm">
            <!-- Subtle accent glow border -->
            <div
              class="absolute -inset-1.5 rounded-3xl bg-gradient-to-r from-accent/25 to-accent-muted/20 blur-md group-hover:from-accent/40 group-hover:to-accent-muted/40 transition-all duration-500"
            ></div>
            <div
              class="relative rounded-3xl bg-surface-alt border border-border p-3 overflow-hidden shadow-2xl transition-transform duration-500 group-hover:scale-[1.01]"
            >
              <div class="aspect-square w-full rounded-2xl overflow-hidden bg-surface-raised relative">
                <!-- Skeleton loader jika data loading -->
                <div v-if="profileStore.loading" class="w-full h-full bg-surface-raised animate-pulse"></div>
                <img
                  v-else
                  :src="aboutPhoto"
                  :alt="profile?.full_name || 'Arya Kusuma'"
                  class="w-full h-full object-cover object-top grayscale-[15%] group-hover:grayscale-0 transition-all duration-500"
                  loading="lazy"
                />

                <!-- Floating overlay status pill -->
                <div
                  class="absolute bottom-3 left-3 right-3 p-3 rounded-xl bg-surface/90 backdrop-blur-md border border-border/80 flex items-center justify-between shadow-lg"
                >
                  <div class="min-w-0 pr-2">
                    <p class="text-xs font-heading font-semibold text-ink truncate flex items-center gap-1.5">
                      <UserCheck class="w-3.5 h-3.5 text-accent" />
                      {{ profile?.full_name || 'Arya Kusuma' }}
                    </p>
                    <p class="text-[11px] text-accent font-medium truncate mt-0.5">
                      Software Developer & Lifelong Learner
                    </p>
                  </div>
                  <div class="w-2 h-2 rounded-full bg-accent animate-pulse shrink-0"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Kolom Kanan: Narasi Bio, Filosofi, Tombol Unduh CV, & 4 Kartu Fakta (lg:col-span-7) -->
        <div class="lg:col-span-7 space-y-6">
          <!-- Skeleton Loading for Bio -->
          <div v-if="profileStore.loading" class="space-y-3 animate-pulse">
            <div class="h-5 bg-surface-raised rounded w-full"></div>
            <div class="h-5 bg-surface-raised rounded w-5/6"></div>
            <div class="h-5 bg-surface-raised rounded w-4/6"></div>
          </div>
          <div v-else class="space-y-4">
            <!-- Paragraf 1: Latar Belakang & Bio -->
            <p class="text-ink text-base sm:text-lg leading-relaxed font-normal whitespace-pre-line">
              {{ bioText }}
            </p>

            <!-- Paragraf 2: Filosofi Kerja & Prinsip Rekayasa (Dinamis dari Admin) -->
            <p class="text-ink-muted text-sm sm:text-base leading-relaxed">
              {{ philosophyText }}
            </p>


          </div>

          <!-- 4 Kartu Sorotan & Prinsip Kerja (Dinamis dari Admin, Ikon di Samping Judul & Ramping) -->
          <div class="pt-4 border-t border-border/60">
            <h3 class="text-xs font-semibold text-accent uppercase tracking-wider mb-3.5">
              Sorotan & Prinsip Kerja
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
              <BaseCard
                v-for="(fact, index) in facts"
                :key="index"
                class="p-3.5 sm:p-4 flex flex-col justify-start h-full bg-surface-alt/70 border-border/80 hover:border-accent/40 transition-all rounded-xl"
              >
                <div class="space-y-1.5">
                  <!-- Header: Ikon di Samping Judul (Kiri) -->
                  <div class="flex items-center gap-2.5">
                    <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-surface-raised border border-border flex items-center justify-center text-accent shrink-0 shadow-sm">
                      <component :is="fact.icon" class="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                    <h4 class="font-heading font-semibold text-ink text-sm sm:text-base">
                      {{ fact.title }}
                    </h4>
                  </div>
                  <!-- Deskripsi -->
                  <p class="text-ink-muted text-xs sm:text-sm leading-relaxed">
                    {{ fact.desc }}
                  </p>
                </div>
              </BaseCard>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
