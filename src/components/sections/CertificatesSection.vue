<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCertificateStore } from '../../stores/certificate.store'
import { useIntersection } from '../../composables/useIntersection'
import SectionTitle from '../ui/SectionTitle.vue'
import CertificateCard from '../certificate/CertificateCard.vue'
import SkeletonLoader from '../ui/SkeletonLoader.vue'

const router = useRouter()
const certificateStore = useCertificateStore()
const contentRef = ref(null)
const { isVisible, observe } = useIntersection({ threshold: 0.15 })

function navigateToCertificate(id) {
  router.push(`/certificates/${id}`)
}

onMounted(() => {
  certificateStore.fetchCertificates()
  if (contentRef.value) {
    observe(contentRef.value)
  }
})
</script>

<template>
  <section id="certificates" class="py-20 border-t border-border/50">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <SectionTitle
        tag="Kredensial Resmi"
        title="Sertifikasi & Lisensi"
        subtitle="Bukti pencapaian dan kompetensi teknis yang telah diverifikasi oleh institusi terpercaya."
      />

      <div
        ref="contentRef"
        class="transition-all duration-700 ease-out transform"
        :class="isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
      >
        <!-- Skeleton Loading State -->
        <div
          v-if="certificateStore.loading"
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <SkeletonLoader type="card" :count="3" />
        </div>

        <!-- Certificates Grid State -->
        <div
          v-else-if="certificateStore.certificates && certificateStore.certificates.length > 0"
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <CertificateCard
            v-for="cert in certificateStore.certificates"
            :key="cert.id"
            :certificate="cert"
            @click="navigateToCertificate"
          />
        </div>

        <!-- Empty State -->
        <div
          v-else
          class="text-center py-16 bg-surface-alt border border-border rounded-lg p-8"
        >
          <p class="text-ink-muted text-base">
            Belum ada sertifikat yang ditampilkan saat ini.
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
