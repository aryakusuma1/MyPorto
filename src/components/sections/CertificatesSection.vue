<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  ArrowUpRight,
  Award,
} from 'lucide-vue-next'
import { useCertificateStore } from '../../stores/certificate.store'
import { useIntersection } from '../../composables/useIntersection'
import SectionTitle from '../ui/SectionTitle.vue'

const router = useRouter()
const certificateStore = useCertificateStore()
const contentRef = ref(null)
const { isVisible, observe } = useIntersection({ threshold: 0.15 })

const activeIndex = ref(0)
const touchStartX = ref(0)
const touchEndX = ref(0)

const certificates = computed(() => certificateStore.certificates || [])

const activeCertificate = computed(() => {
  if (!certificates.value.length) return null
  return certificates.value[activeIndex.value] || certificates.value[0]
})

function prev() {
  if (!certificates.value.length) return
  activeIndex.value = (activeIndex.value - 1 + certificates.value.length) % certificates.value.length
}

function next() {
  if (!certificates.value.length) return
  activeIndex.value = (activeIndex.value + 1) % certificates.value.length
}

function goTo(index) {
  if (index >= 0 && index < certificates.value.length) {
    activeIndex.value = index
  }
}

function navigateToActiveCertificate() {
  if (activeCertificate.value?.id) {
    router.push(`/certificates/${activeCertificate.value.id}`)
  }
}

function handleTouchStart(e) {
  touchStartX.value = e.changedTouches[0].screenX
}

function handleTouchEnd(e) {
  touchEndX.value = e.changedTouches[0].screenX
  handleSwipe()
}

function handleSwipe() {
  const swipeThreshold = 45
  const diff = touchEndX.value - touchStartX.value
  if (Math.abs(diff) > swipeThreshold) {
    if (diff > 0) {
      prev()
    } else {
      next()
    }
  }
}

/**
 * Menghitung posisi bertumpuk DATAR (Flat Layered Stack) tanpa rotasi menyamping
 */
function getCardStyle(index) {
  const total = certificates.value.length
  if (total === 0) return {}

  let offset = index - activeIndex.value

  if (offset > total / 2) offset -= total
  if (offset < -total / 2) offset += total

  // Kartu utama di tengah (Center Active)
  if (offset === 0) {
    return {
      transform: 'translate(-50%, -50%) scale(1)',
      zIndex: 30,
      opacity: 1,
      filter: 'none',
      pointerEvents: 'auto',
    }
  }

  // Kartu sisi kiri (Flat Layered Stack, Datar)
  if (offset === -1 || (total > 2 && offset < 0 && offset >= -2)) {
    const depth = Math.abs(offset)
    const translateX = depth === 1 ? '-88%' : '-125%'
    const scale = depth === 1 ? 0.86 : 0.74
    return {
      transform: `translate(${translateX}, -50%) scale(${scale})`,
      zIndex: 20 - depth,
      opacity: depth === 1 ? 0.65 : 0.25,
      filter: 'brightness(0.75)',
      pointerEvents: 'auto',
    }
  }

  // Kartu sisi kanan (Flat Layered Stack, Datar)
  if (offset === 1 || (total > 2 && offset > 0 && offset <= 2)) {
    const depth = Math.abs(offset)
    const translateX = depth === 1 ? '-12%' : '25%'
    const scale = depth === 1 ? 0.86 : 0.74
    return {
      transform: `translate(${translateX}, -50%) scale(${scale})`,
      zIndex: 20 - depth,
      opacity: depth === 1 ? 0.65 : 0.25,
      filter: 'brightness(0.75)',
      pointerEvents: 'auto',
    }
  }

  return {
    transform: 'translate(-50%, -50%) scale(0.5)',
    zIndex: 0,
    opacity: 0,
    pointerEvents: 'none',
  }
}

onMounted(() => {
  certificateStore.fetchCertificates()
  if (contentRef.value) {
    observe(contentRef.value)
  }
})
</script>

<template>
  <section id="certificates" class="py-20 border-t border-border/50 relative overflow-hidden">
    <!-- Ambient Glow Effect -->
    <div
      class="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-accent/5 rounded-full blur-3xl pointer-events-none"
    ></div>

    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <!-- Section Header -->
      <SectionTitle
        tag="Kredensial Resmi"
        title="Sertifikasi & Lisensi"
        subtitle="Bukti pencapaian dan kompetensi teknis yang telah diverifikasi oleh institusi terpercaya."
        margin-bottom="mb-2 sm:mb-4"
      />

      <div
        ref="contentRef"
        class="transition-all duration-700 ease-out transform"
        :class="isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
      >
        <!-- Skeleton Loading State -->
        <div
          v-if="certificateStore.loading"
          class="h-72 sm:h-80 rounded-3xl bg-surface-alt border border-border animate-pulse flex items-center justify-center"
        >
          <div class="text-xs text-ink-muted flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-accent animate-ping"></span>
            Memuat galeri kredensial sertifikat...
          </div>
        </div>

        <!-- Flat Layered Showcase Carousel State -->
        <div
          v-else-if="certificates.length > 0"
          class="flex flex-col items-center"
          @touchstart="handleTouchStart"
          @touchend="handleTouchEnd"
        >
          <!-- Stage Visual Showcase (Datar, Ukuran Pas, Bersih Tanpa Panah) -->
          <div class="relative w-full max-w-4xl h-52 sm:h-64 md:h-[295px] mt-0 mb-2 select-none overflow-hidden">
            <!-- Cards Container -->
            <div class="relative w-full h-full">
              <div
                v-for="(cert, index) in certificates"
                :key="cert.id"
                class="absolute top-1/2 left-1/2 w-[76%] sm:w-[58%] md:w-[48%] max-w-[460px] aspect-[16/10] rounded-2xl md:rounded-3xl overflow-hidden border transition-all duration-500 ease-out cursor-pointer shadow-2xl group bg-surface-alt"
                :class="
                  index === activeIndex
                    ? 'border-accent shadow-[0_15px_40px_rgba(255,107,0,0.24)] ring-1 ring-accent/60'
                    : 'border-border/80 hover:border-border'
                "
                :style="getCardStyle(index)"
                @click="index === activeIndex ? navigateToActiveCertificate() : goTo(index)"
              >
                <!-- Thumbnail Image -->
                <img
                  v-if="cert.image_url"
                  :src="cert.image_url"
                  :alt="cert.title"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div
                  v-else
                  class="w-full h-full bg-surface-raised flex flex-col items-center justify-center text-accent/60 p-6"
                >
                  <Award class="w-12 h-12 mb-2 text-accent" />
                  <span class="text-xs text-ink-muted font-mono">{{ cert.title }}</span>
                </div>

                <!-- Subtle Top Gradient & Badges -->
                <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none"></div>

                <!-- Badges on top -->
                <div class="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                  <span
                    class="inline-flex items-center gap-1 text-[10px] font-mono px-2.5 py-1 rounded-full bg-accent/90 text-white shadow-lg backdrop-blur-sm"
                  >
                    {{ cert.category || 'Sertifikasi' }}
                  </span>
                </div>

                <!-- Center Hover Overlay Button -->
                <div
                  v-if="index === activeIndex"
                  class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-[2px]"
                >
                  <span
                    class="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-accent text-white text-xs font-semibold shadow-xl transform translate-y-2 group-hover:translate-y-0 transition-transform"
                  >
                    <span>Buka Detail Sertifikat</span>
                    <ArrowUpRight class="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Pagination Dots (Tepat di Bawah Gambar Showcase) -->
          <div v-if="certificates.length > 1" class="flex items-center justify-center gap-2 mt-3 mb-4">
            <button
              v-for="(_, dIdx) in certificates"
              :key="dIdx"
              type="button"
              class="transition-all duration-300 rounded-full cursor-pointer"
              :class="
                dIdx === activeIndex
                  ? 'w-7 h-2 bg-accent shadow-sm'
                  : 'w-2 h-2 bg-ink-muted/30 hover:bg-ink-muted/60'
              "
              :title="`Pindah ke sertifikat ${dIdx + 1}`"
              @click="goTo(dIdx)"
            ></button>
          </div>

          <!-- Active Certificate Details Box (Lebar, Deskripsi Dibatasi line-clamp-2, Tanpa Tanggal Bawah) -->
          <div v-if="activeCertificate" class="w-full max-w-3xl text-center space-y-3 px-4 mt-1">
            <div>
              <span class="text-xs font-mono font-medium text-accent tracking-wider uppercase block mb-1">
                {{ activeCertificate.issuer }}
              </span>
              <h3
                class="font-heading font-bold text-xl sm:text-2xl text-ink hover:text-accent transition-colors cursor-pointer inline-flex items-center gap-2 group/title"
                @click="navigateToActiveCertificate"
              >
                <span>{{ activeCertificate.title }}</span>
                <ArrowUpRight class="w-5 h-5 text-accent opacity-0 group-hover/title:opacity-100 transition-opacity" />
              </h3>
            </div>

            <!-- Deskripsi dibatasi line-clamp-2 agar tidak terlalu panjang -->
            <p v-if="activeCertificate.description" class="text-ink-muted text-sm sm:text-base leading-relaxed line-clamp-2 max-w-2xl mx-auto">
              {{ activeCertificate.description }}
            </p>

            <!-- Action Link Button -->
            <div class="pt-2">
              <button
                type="button"
                class="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-surface-alt border border-accent/40 text-accent hover:bg-accent hover:text-white font-medium text-xs sm:text-sm shadow-md transition-all cursor-pointer group"
                @click="navigateToActiveCertificate"
              >
                <span>Lihat Detail Sertifikat</span>
                <ArrowUpRight class="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div
          v-else
          class="text-center py-16 bg-surface-alt border border-border rounded-2xl p-8 max-w-lg mx-auto"
        >
          <Award class="w-12 h-12 text-ink-muted mx-auto mb-3" />
          <h3 class="font-heading font-semibold text-ink text-base">Belum ada sertifikat</h3>
          <p class="text-ink-muted text-xs mt-1">
            Data sertifikat belum diunggah atau belum tersedia di basis data.
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
