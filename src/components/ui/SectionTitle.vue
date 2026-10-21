<script setup>
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
</script>

<template>
  <div
    :class="[
      'mb-10',
      align === 'center' ? 'text-center mx-auto' : 'text-left',
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
