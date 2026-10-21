<script setup>
import { Award, Calendar, ExternalLink } from 'lucide-vue-next'
import BaseCard from '../ui/BaseCard.vue'

const props = defineProps({
  certificate: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['click'])

function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return dateString
  return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
}

function handleClick() {
  emit('click', props.certificate.id)
}
</script>

<template>
  <BaseCard
    :hoverable="true"
    class="group cursor-pointer flex flex-col h-full overflow-hidden"
    @click="handleClick"
  >
    <!-- Thumbnail Image or Elegant Placeholder -->
    <div class="relative w-full h-40 bg-surface-raised rounded-md mb-4 overflow-hidden border border-border/60">
      <img
        v-if="certificate.image_url"
        :src="certificate.image_url"
        :alt="certificate.title"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        loading="lazy"
      />
      <div
        v-else
        class="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-surface-raised to-surface-alt p-4 text-center"
      >
        <Award class="w-10 h-10 text-accent/60 mb-2 group-hover:scale-110 group-hover:text-accent transition-all duration-300" />
        <span class="text-xs text-ink-muted font-medium">{{ certificate.category || 'Sertifikat Kompetensi' }}</span>
      </div>
    </div>

    <!-- Content -->
    <div class="flex-1 flex flex-col justify-between">
      <div>
        <span class="text-xs font-semibold text-accent uppercase tracking-wider block mb-1">
          {{ certificate.issuer }}
        </span>
        <h3 class="font-heading font-bold text-base sm:text-lg text-ink group-hover:text-accent transition-colors line-clamp-2 mb-2">
          {{ certificate.title }}
        </h3>
      </div>

      <div class="pt-3 border-t border-border/50 flex items-center justify-between text-xs text-ink-muted">
        <span class="inline-flex items-center gap-1.5">
          <Calendar class="w-3.5 h-3.5" />
          {{ formatDate(certificate.issue_date) }}
        </span>
        <span class="inline-flex items-center gap-1 text-accent font-medium group-hover:underline">
          Detail
          <ExternalLink class="w-3 h-3" />
        </span>
      </div>
    </div>
  </BaseCard>
</template>
