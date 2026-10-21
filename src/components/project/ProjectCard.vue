<script setup>
import { FolderGit2, ArrowUpRight } from 'lucide-vue-next'
import BaseCard from '../ui/BaseCard.vue'
import BaseBadge from '../ui/BaseBadge.vue'

const props = defineProps({
  project: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['click'])

function handleClick() {
  emit('click', props.project.slug)
}
</script>

<template>
  <BaseCard
    :hoverable="true"
    class="group cursor-pointer flex flex-col h-full overflow-hidden"
    @click="handleClick"
  >
    <!-- Cover Image or Elegant Placeholder -->
    <div class="relative w-full h-44 sm:h-48 bg-surface-raised rounded-md mb-4 overflow-hidden border border-border/60">
      <img
        v-if="project.cover_url"
        :src="project.cover_url"
        :alt="project.title"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        loading="lazy"
      />
      <div
        v-else
        class="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-surface-raised to-surface-alt p-4 text-center"
      >
        <FolderGit2 class="w-10 h-10 text-accent/60 mb-2 group-hover:scale-110 group-hover:text-accent transition-all duration-300" />
        <span class="text-xs text-ink-muted font-medium">{{ project.category || 'Proyek Perangkat Lunak' }}</span>
      </div>
      <div v-if="project.featured" class="absolute top-2 right-2">
        <BaseBadge variant="accent">Unggulan</BaseBadge>
      </div>
    </div>

    <!-- Content -->
    <div class="flex-1 flex flex-col">
      <div class="flex items-start justify-between gap-2 mb-2">
        <h3 class="font-heading font-bold text-lg sm:text-xl text-ink group-hover:text-accent transition-colors line-clamp-1">
          {{ project.title }}
        </h3>
        <ArrowUpRight class="w-5 h-5 text-ink-muted group-hover:text-accent group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0 mt-0.5" />
      </div>

      <p class="text-ink-muted text-sm leading-relaxed mb-4 line-clamp-2 flex-1">
        {{ project.short_desc }}
      </p>

      <!-- Tech Stack Badges -->
      <div class="flex flex-wrap gap-1.5 pt-2 border-t border-border/50">
        <BaseBadge
          v-for="(tech, i) in (project.tech_stack || []).slice(0, 4)"
          :key="i"
          variant="default"
        >
          {{ tech }}
        </BaseBadge>
        <BaseBadge v-if="(project.tech_stack || []).length > 4" variant="default">
          +{{ project.tech_stack.length - 4 }}
        </BaseBadge>
      </div>
    </div>
  </BaseCard>
</template>
