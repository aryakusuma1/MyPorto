<script setup>
import { onMounted } from 'vue'
import { Briefcase, GraduationCap, Calendar } from 'lucide-vue-next'
import { useExperienceStore } from '../../stores/experience.store'
import SectionTitle from '../ui/SectionTitle.vue'
import BaseBadge from '../ui/BaseBadge.vue'
import { ref } from 'vue'
import { useIntersection } from '../../composables/useIntersection'

const experienceStore = useExperienceStore()

function formatDate(dateString) {
  if (!dateString) return 'Sekarang'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return dateString
  return date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })
}

function formatPeriod(start, end) {
  return `${formatDate(start)} - ${formatDate(end)}`
}

const timelineRef = ref(null)
const { isVisible, observe } = useIntersection({ threshold: 0.15 })

onMounted(() => {
  experienceStore.fetchExperiences()
  if (timelineRef.value) {
    observe(timelineRef.value)
  }
})
</script>

<template>
  <section id="experience" class="py-20 border-t border-border/50">
    <!-- Container Utama menggunakan max-w-6xl agar SectionTitle sejajar sempurna dengan section lain -->
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <SectionTitle
        tag="Perjalanan Karir"
        title="Pendidikan & Pengalaman"
        subtitle="Linimasa riwayat pekerjaan profesional dan latar belakang akademik yang telah saya tempuh."
      />

      <!-- Timeline Container (max-w-4xl agar lebar kartu proporsional dan nyaman dibaca) -->
      <div ref="timelineRef" class="max-w-4xl mx-auto mt-10 transition-all duration-700 ease-out transform" :class="isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'">
        <div
          v-for="(item, index) in experienceStore.experiences"
          :key="item.id"
          class="relative flex items-start gap-4 sm:gap-6 group"
        >
          <!-- Timeline Node Column (Icon Lingkaran Solid + Garis Penghubung Terputus Bersih) -->
          <div class="flex flex-col items-center shrink-0 self-stretch">
            <!-- Node Icon dengan Latar Solid Opaque (Anti-Tembus Pandang) -->
            <div
              :class="[
                'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10 shrink-0 bg-surface-raised',
                item.type === 'work'
                  ? 'text-accent border-accent/80 shadow-[0_0_12px_rgba(255,107,0,0.15)] group-hover:scale-110'
                  : 'text-ink border-border group-hover:scale-110',
              ]"
            >
              <Briefcase v-if="item.type === 'work'" class="w-5 h-5" />
              <GraduationCap v-else class="w-5 h-5" />
            </div>

            <!-- Garis Linimasa: Hanya menghubungkan antar icon (tidak mencuat di atas icon pertama & tidak tembus) -->
            <div
              v-if="index !== experienceStore.experiences.length - 1"
              class="w-0.5 bg-border flex-1 my-2"
            ></div>
          </div>

          <!-- Timeline Content Card -->
          <div
            class="flex-1"
            :class="{ 'pb-10': index !== experienceStore.experiences.length - 1 }"
          >
            <div class="bg-surface-alt border border-border rounded-lg p-5 hover:border-accent/60 transition-colors">
              <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
                <span class="text-xs font-semibold text-accent uppercase tracking-wider">
                  {{ item.company }}
                </span>
                <BaseBadge :variant="item.type === 'work' ? 'accent' : 'default'">
                  {{ item.type === 'work' ? 'Pekerjaan' : 'Pendidikan' }}
                </BaseBadge>
              </div>

              <h3 class="font-heading font-bold text-lg sm:text-xl text-ink mb-2">
                {{ item.role }}
              </h3>

              <div class="inline-flex items-center gap-1.5 text-xs text-ink-muted mb-3 font-medium">
                <Calendar class="w-3.5 h-3.5" />
                <span>{{ formatPeriod(item.start_date, item.end_date) }}</span>
              </div>

              <p class="text-ink-muted text-sm leading-relaxed">
                {{ item.description }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>\n