<script setup>
import { computed, ref, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowLeft,
  Award,
  Calendar,
  Building2,
  ExternalLink,
  ShieldCheck,
} from 'lucide-vue-next'
import { useCertificateStore } from '../stores/certificate.store'
import { useIntersection } from '../composables/useIntersection'
import AppNavbar from '../components/layout/AppNavbar.vue'
import BaseButton from '../components/ui/BaseButton.vue'
import BaseBadge from '../components/ui/BaseBadge.vue'
import BaseCard from '../components/ui/BaseCard.vue'
import SkeletonLoader from '../components/ui/SkeletonLoader.vue'

const route = useRoute()
const router = useRouter()
const certificateStore = useCertificateStore()

const id = computed(() => route.params.id)
const cert = computed(() => certificateStore.currentCertificate)

const isHeaderRevealed = ref(false)

// Section refs & intersection observers for scroll reveal
const descRef = ref(null)
const verifyRef = ref(null)

const { isVisible: descVisible, observe: observeDesc } = useIntersection({ threshold: 0.15 })
const { isVisible: verifyVisible, observe: observeVerify } = useIntersection({ threshold: 0.15 })

function goBack() {
  router.push('/#certificates')
}

function formatDate(dateString) {
  if (!dateString) return '-'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return dateString
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

function openVerification() {
  if (cert.value?.credential_url) {
    window.open(cert.value.credential_url, '_blank', 'noopener,noreferrer')
  }
}

function initObservers() {
  nextTick(() => {
    setTimeout(() => {
      isHeaderRevealed.value = true
    }, 50)

    if (descRef.value) observeDesc(descRef.value)
    if (verifyRef.value) observeVerify(verifyRef.value)
  })
}

onMounted(async () => {
  const result = await certificateStore.fetchCertificateById(id.value)
  if (!result && !certificateStore.loading) {
    router.replace({ name: 'not-found' })
  } else {
    initObservers()
  }
})
</script>

<template>
  <div class="min-h-screen bg-surface text-ink flex flex-col">
    <!-- Navbar -->
    <AppNavbar />

    <!-- Main Content -->
    <main class="flex-1 py-12 sm:py-16">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Back Navigation Button -->
        <button
          type="button"
          class="inline-flex items-center gap-2 text-sm font-medium text-ink-muted hover:text-accent transition-colors mb-8 cursor-pointer select-none group"
          @click="goBack"
        >
          <ArrowLeft class="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Kembali ke Daftar Sertifikat
        </button>

        <!-- Loading State -->
        <div v-if="certificateStore.loading" class="space-y-6">
          <SkeletonLoader type="text" :count="2" />
          <div class="w-full h-80 bg-surface-raised rounded-xl animate-pulse"></div>
          <SkeletonLoader type="text" :count="3" />
        </div>

        <!-- Certificate Detail Content -->
        <article v-else-if="cert" class="space-y-8">
          <!-- Header Area with Entrance Animation -->
          <header
            class="space-y-3 transition-all duration-700 ease-out transform"
            :class="isHeaderRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'"
          >
            <BaseBadge variant="accent">
              {{ cert.category || 'Sertifikasi Kompetensi' }}
            </BaseBadge>

            <h1 class="text-3xl sm:text-4xl font-bold font-heading text-ink tracking-tight">
              {{ cert.title }}
            </h1>

            <!-- Metadata info -->
            <div class="flex flex-wrap items-center gap-4 text-sm text-ink-muted pt-1">
              <span class="inline-flex items-center gap-1.5 font-medium text-ink">
                <Building2 class="w-4 h-4 text-accent" />
                {{ cert.issuer }}
              </span>
              <span>&bull;</span>
              <span class="inline-flex items-center gap-1.5">
                <Calendar class="w-4 h-4" />
                Diterbitkan: {{ formatDate(cert.issue_date) }}
              </span>
              <span v-if="cert.expiry_date">&bull;</span>
              <span v-if="cert.expiry_date">
                Berlaku hingga: {{ formatDate(cert.expiry_date) }}
              </span>
            </div>
          </header>

          <!-- Certificate Image Display with Scale-in Animation (Ramping & Proporsional) -->
          <div
            class="max-w-xl mx-auto w-full rounded-2xl overflow-hidden border border-border/80 bg-surface-alt/60 shadow-xl transition-all duration-700 delay-150 ease-out transform p-2 sm:p-3 flex items-center justify-center"
            :class="isHeaderRevealed ? 'opacity-100 scale-100' : 'opacity-0 scale-95'"
          >
            <img
              v-if="cert.image_url"
              :src="cert.image_url"
              :alt="cert.title"
              class="w-auto max-w-full h-auto object-contain max-h-[300px] sm:max-h-[340px] rounded-xl mx-auto"
            />
            <div
              v-else
              class="w-full h-48 sm:h-56 flex flex-col items-center justify-center bg-gradient-to-br from-surface-raised to-surface-alt p-6 text-center"
            >
              <div class="w-16 h-16 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center text-accent mb-3">
                <Award class="w-8 h-8" />
              </div>
              <h2 class="font-heading font-bold text-lg text-ink max-w-md">
                {{ cert.title }}
              </h2>
              <p class="text-ink-muted text-xs mt-1">
                Penerbit: {{ cert.issuer }}
              </p>
              <span class="text-xs text-accent mt-2 inline-flex items-center gap-1">
                <ShieldCheck class="w-3.5 h-3.5" /> Kredensial Terverifikasi
              </span>
            </div>
          </div>

          <!-- Description Section (Scroll Reveal) -->
          <div
            v-if="cert.description"
            ref="descRef"
            class="transition-all duration-700 ease-out transform"
            :class="descVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
          >
            <BaseCard :hoverable="false" class="space-y-2">
              <h3 class="font-heading font-semibold text-ink text-base">
                Keterangan Sertifikasi
              </h3>
              <p class="text-ink-muted text-sm sm:text-base leading-relaxed whitespace-pre-line">
                {{ cert.description }}
              </p>
            </BaseCard>
          </div>

          <!-- Verification Action CTA (Scroll Reveal) -->
          <div
            v-if="cert.credential_url"
            ref="verifyRef"
            class="p-6 rounded-xl bg-surface-alt border border-border/80 flex flex-col sm:flex-row items-center justify-between gap-4 transition-all duration-700 ease-out transform"
            :class="verifyVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
          >
            <div>
              <h4 class="font-heading font-bold text-ink text-base">
                Verifikasi Keaslian Kredensial
              </h4>
              <p class="text-ink-muted text-xs sm:text-sm mt-0.5">
                Buka tautan verifikasi resmi yang diterbitkan oleh {{ cert.issuer }}.
              </p>
            </div>
            <BaseButton variant="primary" size="md" class="shrink-0" @click="openVerification">
              <ShieldCheck class="w-4 h-4 mr-1.5" />
              Verifikasi Sertifikat
              <ExternalLink class="w-3.5 h-3.5 ml-1.5" />
            </BaseButton>
          </div>

          <!-- Bottom Back Button -->
          <div class="pt-6 border-t border-border/50">
            <BaseButton variant="secondary" size="md" @click="goBack">
              <ArrowLeft class="w-4 h-4 mr-1.5" />
              Kembali ke Halaman Utama
            </BaseButton>
          </div>
        </article>
      </div>
    </main>
  </div>
</template>
