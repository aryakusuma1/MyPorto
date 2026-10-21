<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 py-12">
    <h1 class="text-3xl font-bold font-heading text-ink mb-4">Detail Sertifikat</h1>
    <p class="text-ink-muted">ID: {{ route.params.id }}</p>
  </div>
</template>
