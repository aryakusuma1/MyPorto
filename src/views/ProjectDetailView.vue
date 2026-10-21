<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 py-12">
    <h1 class="text-3xl font-bold font-heading text-ink mb-4">Detail Project</h1>
    <p class="text-ink-muted">Slug: {{ route.params.slug }}</p>
  </div>
</template>
