<script setup>
import { onMounted } from 'vue'
import { Briefcase, GraduationCap, Calendar } from 'lucide-vue-next'
import { useExperienceStore } from '../../stores/experience.store'
import SectionTitle from '../ui/SectionTitle.vue'
import BaseBadge from '../ui/BaseBadge.vue'

const experienceStore = useExperienceStore()

function formatDate(dateString) {
  if (!dateString) return 'Sekarang'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return dateString
  return date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })
}

function formatPeriod(start, end) {
  return `${formatDate(start)} — ${formatDate(end)}`
}

onMounted(() => {
  experienceStore.fetchExperiences()
})
</script>

<template>
  <section id="experience" class="py-20 border-t border-border/50">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <SectionTitle
        tag="Perjalanan Karir"
        title="Pendidikan & Pengalaman"
        subtitle="Linimasa riwayat pekerjaan profesional dan latar belakang akademik yang telah saya tempuh."
      />

      <!-- Timeline Container -->
      <div class="relative border-l-2 border-border ml-4 sm:ml-6 space-y-10 pl-6 sm:pl-8">
        <div
          v-for="item in experienceStore.experiences"
          :key="item.id"
          class="relative group"
        >
          <!-- Timeline Node Icon -->
          <div
            :class="[
              'absolute -left-[35px] sm:-left-[43px] top-1 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 border-surface transition-all duration-300',
              item.type === 'work'
                ? 'bg-accent/20 text-accent border-accent/40 group-hover:scale-110'
                : 'bg-surface-raised text-ink border-border group-hover:scale-110',
            ]"
          >
            <Briefcase v-if="item.type === 'work'" class="w-4 h-4 sm:w-5 sm:h-5" />
            <GraduationCap v-else class="w-4 h-4 sm:w-5 sm:h-5" />
          </div>

          <!-- Timeline Content Card -->
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
  </section>
</template>
