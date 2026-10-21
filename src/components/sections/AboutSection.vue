<script setup>
import { computed } from 'vue'
import { Download, Code2, Sparkles, BookOpen, MapPin } from 'lucide-vue-next'
import { useProfileStore } from '../../stores/profile.store'
import SectionTitle from '../ui/SectionTitle.vue'
import BaseButton from '../ui/BaseButton.vue'
import BaseCard from '../ui/BaseCard.vue'
import defaultHeroImg from '../../assets/hero.png'

const profileStore = useProfileStore()

const defaultBio =
  'Saya adalah seorang pengembang perangkat lunak yang berfokus pada pembangunan solusi web end-to-end yang tangguh, modular, dan terstruktur. Terbiasa mengelola alur pengembangan dari pemodelan basis data relasional hingga implementasi antarmuka yang intuitif dan responsif.'

const profile = computed(() => profileStore.profile)

const bioText = computed(() => profile.value?.bio || defaultBio)
const cvUrl = computed(() => profile.value?.cv_url || null)

const facts = [
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

function downloadCV() {
  if (cvUrl.value) {
    window.open(cvUrl.value, '_blank')
  }
}
</script>

<template>
  <section id="about" class="py-20 border-t border-border/50">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <SectionTitle
        tag="Tentang Saya"
        title="Mengenal Lebih Dekat"
        subtitle="Sekilas mengenai latar belakang, filosofi kerja, dan keahlian yang saya bawa."
      />

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <!-- Bio Column -->
        <div class="lg:col-span-6 space-y-6">
          <p class="text-ink text-base sm:text-lg leading-relaxed">
            {{ bioText }}
          </p>
          <p class="text-ink-muted text-sm sm:text-base leading-relaxed">
            Saya percaya bahwa kode yang hebat bukan hanya yang bisa berjalan, melainkan kode yang mudah dipelihara, teruji, dan terdokumentasi dengan baik. Setiap proyek dikerjakan dengan perhatian penuh pada detail dan performa.
          </p>

          <!-- Download CV Button -->
          <div v-if="cvUrl" class="pt-2">
            <BaseButton variant="primary" size="md" @click="downloadCV">
              <Download class="w-4 h-4 mr-1" />
              Unduh Curriculum Vitae (PDF)
            </BaseButton>
          </div>
        </div>

        <!-- Facts Grid Column -->
        <div class="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <BaseCard v-for="(fact, index) in facts" :key="index" :hoverable="true" class="space-y-2">
            <div class="w-10 h-10 rounded-lg bg-surface-raised border border-border flex items-center justify-center text-accent mb-3">
              <component :is="fact.icon" class="w-5 h-5" />
            </div>
            <h3 class="font-heading font-semibold text-ink text-base">
              {{ fact.title }}
            </h3>
            <p class="text-ink-muted text-xs sm:text-sm leading-relaxed">
              {{ fact.desc }}
            </p>
          </BaseCard>
        </div>
      </div>
    </div>
  </section>
</template>
