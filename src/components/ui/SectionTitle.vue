<script setup>
import { ref, onMounted } from 'vue'
import { useIntersection } from '../../composables/useIntersection'

defineProps({
  tag: {
    type: String,
    default: '',
  },
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    default: '',
  },
  align: {
    type: String,
    default: 'left',
    validator: (v) => ['left', 'center'].includes(v),
  },
})

const titleRef = ref(null)
const { isVisible, observe } = useIntersection({ threshold: 0.15 })

onMounted(() => {
  if (titleRef.value) {
    observe(titleRef.value)
  }
})
</script>

<template>
  <div
    ref="titleRef"
    :class="[
      'mb-10 transition-all duration-700 ease-out transform',
      align === 'center' ? 'text-center mx-auto' : 'text-left',
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6',
    ]"
  >
    <span
      v-if="tag"
      class="inline-block text-xs font-semibold tracking-wider uppercase text-accent mb-2"
    >
      {{ tag }}
    </span>
    <h2 class="text-2xl md:text-3xl font-bold font-heading text-ink tracking-tight">
      {{ title }}
    </h2>
    <p
      v-if="subtitle"
      :class="[
        'text-ink-muted text-sm md:text-base mt-2',
        align === 'center' ? 'max-w-2xl mx-auto' : 'max-w-2xl',
      ]"
    >
      {{ subtitle }}
    </p>
  </div>
</template>
