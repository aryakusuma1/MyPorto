<script setup>
import { RouterView } from 'vue-router'
import AdminSidebar from '../../components/admin/AdminSidebar.vue'
</script>

<template>
  <div class="min-h-screen bg-surface text-ink flex flex-col md:flex-row">
    <!-- Sidebar -->
    <AdminSidebar />

    <!-- Admin Main View Area -->
    <main class="flex-1 overflow-y-auto min-h-screen p-6 sm:p-8 lg:p-10">
      <div class="max-w-6xl mx-auto">
        <RouterView />
      </div>
    </main>
  </div>
</template>
