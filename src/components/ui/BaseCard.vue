<script setup>
defineProps({
  hoverable: {
    type: Boolean,
    default: true,
  },
})
</script>

<template>
  <div
    :class="[
      'bg-surface-alt border border-border rounded-lg p-5 transition-all duration-200',
      hoverable && 'hover:border-accent hover:bg-surface-raised/60 hover:-translate-y-0.5',
    ]"
  >
    <slot />
  </div>
</template>
