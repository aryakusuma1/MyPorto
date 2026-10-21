<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useProfileStore } from '../../stores/profile.store'
import BaseButton from '../ui/BaseButton.vue'
import defaultHeroImg from '../../assets/hero.png'

const profileStore = useProfileStore()

// Fallback profil jika data di Supabase belum diisi
const defaultProfile = {
  full_name: 'Arya Kusuma',
  title: 'Software Developer',
  tagline:
    'Membangun aplikasi web modern, terstruktur, dan berkinerja tinggi dengan antarmuka yang bersih serta pengalaman pengguna yang nyaman.',
  photo_url: defaultHeroImg,
}

const profile = computed(() => profileStore.profile || defaultProfile)

// Typing effect untuk role/title
const roles = [
  'Software Developer',
  'Frontend Engineer',
  'Backend Specialist',
  'Vue.js Enthusiast',
]
const displayedRole = ref('')
let roleIndex = 0
let charIndex = 0
let isDeleting = false
let typingTimeout = null

function typeLoop() {
  const currentRole = roles[roleIndex]

  if (isDeleting) {
    displayedRole.value = currentRole.substring(0, charIndex - 1)
    charIndex--
  } else {
    displayedRole.value = currentRole.substring(0, charIndex + 1)
    charIndex++
  }

  let typingSpeed = isDeleting ? 40 : 80

  if (!isDeleting && charIndex === currentRole.length) {
    typingSpeed = 2000 // Tahan selama 2 detik setelah selesai mengetik
    isDeleting = true
  } else if (isDeleting && charIndex === 0) {
    isDeleting = false
    roleIndex = (roleIndex + 1) % roles.length
    typingSpeed = 400 // Jeda sebelum mulai mengetik kata berikutnya
  }

  typingTimeout = setTimeout(typeLoop, typingSpeed)
}

function scrollTo(id) {
  const element = document.getElementById(id)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}

onMounted(() => {
  profileStore.fetchProfile()
  typeLoop()
})

onUnmounted(() => {
  if (typingTimeout) {
    clearTimeout(typingTimeout)
  }
})
</script>

<template>
  <section
    id="hero"
    class="min-h-[85vh] flex items-center justify-center py-16 sm:py-24"
  >
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        <!-- Text Column -->
        <div class="lg:col-span-7 space-y-6 text-center lg:text-left">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-raised border border-border text-xs font-medium text-accent">
            <span class="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
            Tersedia untuk Pekerjaan & Proyek
          </div>

          <div class="space-y-2">
            <p class="text-ink-muted text-base sm:text-lg font-medium">Halo, saya</p>
            <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold font-heading text-ink tracking-tight">
              {{ profile.full_name }}
            </h1>
            <div class="h-10 sm:h-12 flex items-center justify-center lg:justify-start">
              <span class="text-2xl sm:text-3xl font-semibold font-heading text-accent">
                {{ displayedRole }}
              </span>
              <span class="w-0.5 h-7 ml-1 bg-accent animate-pulse"></span>
            </div>
          </div>

          <p class="text-ink-muted text-base sm:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed">
            {{ profile.tagline }}
          </p>

          <!-- CTA Buttons -->
          <div class="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-4">
            <BaseButton variant="primary" size="lg" @click="scrollTo('projects')">
              Lihat Proyek
            </BaseButton>
            <BaseButton variant="secondary" size="lg" @click="scrollTo('contact')">
              Hubungi Saya
            </BaseButton>
          </div>
        </div>

        <!-- Image Column -->
        <div class="lg:col-span-5 flex justify-center lg:justify-end">
          <div class="relative group">
            <!-- Subtle accent glow border -->
            <div
              class="absolute -inset-1 rounded-2xl bg-gradient-to-r from-accent/20 to-accent-muted/20 blur-sm group-hover:from-accent/30 group-hover:to-accent-muted/30 transition-all duration-300"
            ></div>
            <div
              class="relative w-64 h-64 sm:w-72 sm:h-72 lg:w-80 lg:h-80 rounded-2xl bg-surface-alt border border-border p-2 overflow-hidden shadow-xl"
            >
              <img
                :src="profile.photo_url || defaultHeroImg"
                :alt="profile.full_name"
                class="w-full h-full object-cover rounded-xl grayscale-[20%] group-hover:grayscale-0 transition-all duration-300"
                loading="eager"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
