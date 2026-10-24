<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Menu, X } from 'lucide-vue-next'
import { useScrollSpy } from '../../composables/useScrollSpy'

const router = useRouter()
const route = useRoute()

const isMobileMenuOpen = ref(false)

const navItems = [
  { id: 'hero', label: 'Beranda' },
  { id: 'about', label: 'Tentang' },
  { id: 'journey', label: 'Perjalanan' },
  { id: 'projects', label: 'Proyek' },
  { id: 'certificates', label: 'Sertifikat' },
  { id: 'contact', label: 'Kontak' },
]

const { activeSection } = useScrollSpy(
  navItems.map((item) => item.id),
  'hero'
)

function scrollToSection(id) {
  isMobileMenuOpen.value = false

  if (route.path !== '/') {
    router.push({ path: '/', hash: `#${id}` })
    return
  }

  const element = document.getElementById(id)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}
</script>

<template>
  <header
    class="sticky top-0 z-50 w-full backdrop-blur-md bg-surface/85 border-b border-border transition-all duration-200"
  >
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Logo / Brand -->
        <a
          href="#hero"
          class="font-heading text-lg font-bold tracking-tight text-ink hover:text-accent transition-colors"
          @click.prevent="scrollToSection('hero')"
        >
          <span class="text-accent">&lt;</span>Arya<span class="text-accent"> /&gt;</span>
        </a>

        <!-- Desktop Navigation -->
        <nav class="hidden md:flex items-center space-x-1 lg:space-x-2">
          <a
            v-for="item in navItems"
            :key="item.id"
            :href="`#${item.id}`"
            :class="[
              'px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer select-none',
              activeSection === item.id
                ? 'text-accent bg-surface-raised/70'
                : 'text-ink-muted hover:text-ink hover:bg-surface-raised/40',
            ]"
            @click.prevent="scrollToSection(item.id)"
          >
            {{ item.label }}
          </a>
        </nav>

        <!-- Mobile Menu Toggle Button -->
        <div class="flex md:hidden">
          <button
            type="button"
            class="p-2 rounded-md text-ink-muted hover:text-ink hover:bg-surface-raised focus:outline-none focus:ring-2 focus:ring-accent/50"
            :aria-expanded="isMobileMenuOpen"
            aria-label="Toggle navigation menu"
            @click="isMobileMenuOpen = !isMobileMenuOpen"
          >
            <Menu v-if="!isMobileMenuOpen" class="w-6 h-6" />
            <X v-else class="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Dropdown Navigation -->
    <div
      v-if="isMobileMenuOpen"
      class="md:hidden border-b border-border bg-surface-alt/95 backdrop-blur-md px-4 pt-2 pb-4 space-y-1"
    >
      <a
        v-for="item in navItems"
        :key="item.id"
        :href="`#${item.id}`"
        :class="[
          'block px-3 py-2 rounded-md text-base font-medium transition-colors cursor-pointer',
          activeSection === item.id
            ? 'text-accent bg-surface-raised'
            : 'text-ink-muted hover:text-ink hover:bg-surface-raised',
        ]"
        @click.prevent="scrollToSection(item.id)"
      >
        {{ item.label }}
      </a>
    </div>
  </header>
</template>
