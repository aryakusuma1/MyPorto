<script setup>
import { computed, onMounted, ref } from 'vue'
import { useSkillStore } from '../../stores/skill.store'
import { useIntersection } from '../../composables/useIntersection'
import SectionTitle from '../ui/SectionTitle.vue'
import BaseCard from '../ui/BaseCard.vue'

const skillStore = useSkillStore()
const sectionRef = ref(null)
const { isVisible, observe } = useIntersection({ threshold: 0.2 })

const groupedSkills = computed(() => {
  const groups = {}
  skillStore.skills.forEach((skill) => {
    const cat = skill.category || 'Lainnya'
    if (!groups[cat]) {
      groups[cat] = []
    }
    groups[cat].push(skill)
  })
  return groups
})

onMounted(() => {
  skillStore.fetchSkills()
  if (sectionRef.value) {
    observe(sectionRef.value)
  }
})
</script>

<template>
  <section id="skills" ref="sectionRef" class="py-20 border-t border-border/50">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <SectionTitle
        tag="Keahlian Teknis"
        title="Teknologi & Kompetensi"
        subtitle="Daftar perkakas, framework, dan bahasa pemrograman yang saya kuasai dan gunakan dalam pengembangan."
      />

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 transition-all duration-700 delay-150 transform" :class="isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'">
        <BaseCard
          v-for="(items, category) in groupedSkills"
          :key="category"
          :hoverable="false"
          class="flex flex-col h-full"
        >
          <div class="border-b border-border/70 pb-3 mb-4">
            <h3 class="font-heading font-semibold text-accent text-lg">
              {{ category }}
            </h3>
          </div>

          <div class="space-y-4 flex-1">
            <div v-for="skill in items" :key="skill.id" class="space-y-1.5">
              <div class="flex justify-between items-center text-xs">
                <span class="font-medium text-ink">{{ skill.name }}</span>
                <span class="text-ink-muted">{{ skill.level }}%</span>
              </div>
              <div class="h-2 w-full bg-surface-raised rounded-full overflow-hidden">
                <div
                  class="h-full bg-gradient-to-r from-accent to-accent-light rounded-full transition-all duration-1000 ease-out"
                  :style="{
                    width: isVisible ? `${skill.level}%` : '0%',
                  }"
                ></div>
              </div>
            </div>
          </div>
        </BaseCard>
      </div>
    </div>
  </section>
</template>
