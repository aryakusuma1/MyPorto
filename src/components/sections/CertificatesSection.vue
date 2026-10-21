<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCertificateStore } from '../../stores/certificate.store'
import SectionTitle from '../ui/SectionTitle.vue'
import CertificateCard from '../certificate/CertificateCard.vue'
import SkeletonLoader from '../ui/SkeletonLoader.vue'

const router = useRouter()
const certificateStore = useCertificateStore()

function navigateToCertificate(id) {
  router.push(`/certificates/${id}`)
}

onMounted(() => {
  certificateStore.fetchCertificates()
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
  </section>
</template>
