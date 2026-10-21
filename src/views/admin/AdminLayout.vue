<script setup>
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="min-h-screen bg-surface text-ink flex flex-col md:flex-row">
    <aside class="w-full md:w-64 bg-surface-alt border-r border-border p-4">
      <h2 class="text-xl font-bold font-heading text-accent mb-6">Admin Panel</h2>
      <nav class="space-y-2">
        <RouterLink to="/admin/dashboard" class="block px-3 py-2 rounded text-ink-muted hover:text-ink hover:bg-surface-raised">Dashboard</RouterLink>
        <RouterLink to="/admin/projects" class="block px-3 py-2 rounded text-ink-muted hover:text-ink hover:bg-surface-raised">Projects</RouterLink>
        <RouterLink to="/admin/certificates" class="block px-3 py-2 rounded text-ink-muted hover:text-ink hover:bg-surface-raised">Certificates</RouterLink>
        <RouterLink to="/admin/skills" class="block px-3 py-2 rounded text-ink-muted hover:text-ink hover:bg-surface-raised">Skills</RouterLink>
        <RouterLink to="/admin/experience" class="block px-3 py-2 rounded text-ink-muted hover:text-ink hover:bg-surface-raised">Experience</RouterLink>
        <RouterLink to="/admin/messages" class="block px-3 py-2 rounded text-ink-muted hover:text-ink hover:bg-surface-raised">Messages</RouterLink>
      </nav>
    </aside>
    <main class="flex-1 p-6">
      <RouterView />
    </main>
  </div>
</template>
