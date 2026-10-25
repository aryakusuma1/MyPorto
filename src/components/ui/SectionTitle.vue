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
  marginBottom: {
    type: String,
    default: 'mb-10',
  },
  titleClass: {
    type: String,
    default: 'text-2xl md:text-3xl',
  },
  subtitleClass: {
    type: String,
    default: 'text-sm md:text-base',
  },
  tagClass: {
    type: String,
    default: 'text-xs',
  },
  subtitleMaxWidth: {
    type: String,
    default: 'max-w-2xl',
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
      marginBottom,
      'transition-all duration-700 ease-out transform',
      align === 'center' ? 'text-center mx-auto' : 'text-left',
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6',
    ]"
  >
    <span
      v-if="tag"
      :class="[
        'inline-block font-semibold tracking-wider uppercase text-accent mb-2',
        tagClass,
      ]"
    >
      {{ tag }}
    </span>
    <h2
      :class="[
        'font-bold font-heading text-ink tracking-tight',
        titleClass,
      ]"
    >
      {{ title }}
    </h2>
    <p
      v-if="subtitle"
      :class="[
        'text-ink-muted mt-2.5',
        subtitleMaxWidth,
        align === 'center' ? 'mx-auto' : '',
        subtitleClass,
      ]"
    >
      {{ subtitle }}
    </p>
  </div>
</template>
