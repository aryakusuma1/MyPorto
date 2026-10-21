<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="min-h-screen flex items-center justify-center px-4">
    <div class="text-center">
      <h1 class="text-6xl font-bold font-heading text-accent mb-4">404</h1>
      <p class="text-xl text-ink mb-6">Halaman tidak ditemukan</p>
      <RouterLink
        to="/"
        class="inline-block px-5 py-2.5 rounded-lg bg-surface-alt border border-border text-ink hover:border-accent transition-colors"
      >
        Kembali ke Beranda
      </RouterLink>
    </div>
  </div>
</template>
