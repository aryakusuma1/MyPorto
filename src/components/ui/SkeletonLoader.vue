<script setup>
defineProps({
  type: {
    type: String,
    default: 'card',
    validator: (v) => ['card', 'text', 'avatar'].includes(v),
  },
  count: {
    type: Number,
    default: 1,
  },
})
</script>

<template>
  <div class="contents">
    <template v-for="i in count" :key="i">
      <!-- Skeleton Type: Card (Project / Certificate) -->
      <div
        v-if="type === 'card'"
        class="bg-surface-alt border border-border rounded-lg p-5 animate-pulse"
      >
        <div class="w-full h-44 bg-surface-raised rounded-md mb-4"></div>
        <div class="h-5 bg-surface-raised rounded w-3/4 mb-2"></div>
        <div class="h-4 bg-surface-raised rounded w-full mb-2"></div>
        <div class="h-4 bg-surface-raised rounded w-2/3 mb-4"></div>
        <div class="flex gap-2">
          <div class="h-5 bg-surface-raised rounded-md w-14"></div>
          <div class="h-5 bg-surface-raised rounded-md w-16"></div>
          <div class="h-5 bg-surface-raised rounded-md w-12"></div>
        </div>
      </div>

      <!-- Skeleton Type: Avatar -->
      <div
        v-else-if="type === 'avatar'"
        class="w-28 h-28 rounded-full bg-surface-raised border border-border animate-pulse shrink-0"
      ></div>

      <!-- Skeleton Type: Text -->
      <div
        v-else-if="type === 'text'"
        class="space-y-2.5 animate-pulse w-full"
      >
        <div class="h-4 bg-surface-raised rounded w-3/4"></div>
        <div class="h-4 bg-surface-raised rounded w-full"></div>
        <div class="h-4 bg-surface-raised rounded w-5/6"></div>
      </div>
    </template>
  </div>
</template>
