<script setup>
import { computed } from 'vue'

const props = defineProps({
  label: {
    type: String,
    default: '',
  },
  variant: {
    type: String,
    default: 'default',
    validator: (v) => ['default', 'accent'].includes(v),
  },
})

const variantClasses = computed(() => {
  return props.variant === 'accent'
    ? 'bg-accent/15 text-accent-light border border-accent/30'
    : 'bg-surface-raised text-ink-muted border border-border'
})
</script>

<template>
  <span
    :class="[
      'inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium select-none',
      variantClasses,
    ]"
  >
    <slot>{{ label }}</slot>
  </span>
</template>
