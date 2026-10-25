<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useProfileStore } from '../../stores/profile.store'
import BaseButton from '../ui/BaseButton.vue'
import defaultHeroImg from '../../assets/hero.png'

const profileStore = useProfileStore()
const isRevealed = ref(false)

// Fallback profil jika data di Supabase benar-benar kosong setelah loading selesai
const defaultProfile = {
  full_name: 'Arya Kusuma',
  title: 'Software Developer',
  tagline:
    'Membangun aplikasi web modern, terstruktur, dan berkinerja tinggi dengan antarmuka yang bersih serta pengalaman pengguna yang nyaman.',
  photo_url: defaultHeroImg,
}

const profile = computed(() => profileStore.profile || defaultProfile)

// Typing effect untuk role/title (terhubung dinamis dengan Supabase)
const defaultRoles = [
  'Software Developer',
  'Frontend Engineer',
  'Backend Specialist',
  'Vue.js Enthusiast',
]

const roles = computed(() => {
  if (profile.value?.title) {
    const parsed = profile.value.title
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
    if (parsed.length > 0) return parsed
  }
  return defaultRoles
})

const displayedRole = ref('')
let roleIndex = 0
let charIndex = 0
let isDeleting = false
let typingTimeout = null

function startTyping() {
  if (typingTimeout) {
    clearTimeout(typingTimeout)
    typingTimeout = null
  }
  roleIndex = 0
  charIndex = 0
  isDeleting = false
  displayedRole.value = ''
  typeLoop()
}

function typeLoop() {
  // Pastikan timer lama selalu dibersihkan agar tidak pernah ada 2 loop berjalan bersamaan
  if (typingTimeout) {
    clearTimeout(typingTimeout)
    typingTimeout = null
  }

  if (profileStore.loading) return

  const currentRoles = roles.value
  if (!currentRoles || currentRoles.length === 0) return

  if (roleIndex >= currentRoles.length) {
    roleIndex = 0
  }

  const currentRole = currentRoles[roleIndex]

  if (isDeleting) {
    displayedRole.value = currentRole.substring(0, charIndex - 1)
    charIndex--
  } else {
    displayedRole.value = currentRole.substring(0, charIndex + 1)
    charIndex++
  }

  // Kecepatan mengetik santai & jelas
  let typingSpeed = isDeleting ? 40 : 100

  // Saat satu peran/title selesai diketik secara utuh:
  if (!isDeleting && charIndex === currentRole.length) {
    typingSpeed = 1500 // Jeda 1.5 detik untuk SEMUA kalimat sebelum mulai dihapus
    isDeleting = true
  } else if (isDeleting && charIndex === 0) {
    // Saat peran selesai dihapus utuh:
    isDeleting = false
    roleIndex = (roleIndex + 1) % currentRoles.length
    typingSpeed = 650 // Jeda sebelum mulai mengetik peran berikutnya
  }

  typingTimeout = setTimeout(typeLoop, typingSpeed)
}

function triggerEntrance() {
  nextTick(() => {
    setTimeout(() => {
      isRevealed.value = true
    }, 50)
  })
}

// Hanya restart typing jika data title dari profil benar-benar berubah
watch(
  () => profile.value?.title,
  (newTitle, oldTitle) => {
    if (newTitle !== oldTitle && !profileStore.loading) {
      startTyping()
    }
  }
)

function scrollTo(id) {
  const element = document.getElementById(id)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}

onMounted(async () => {
  await profileStore.fetchProfile()
  triggerEntrance()
  startTyping()
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
    class="min-h-[85vh] flex items-center justify-center py-16 sm:py-24 relative overflow-hidden"
  >
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
      <!-- Loading Skeleton State -->
      <div
        v-if="profileStore.loading"
        class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center"
      >
        <div class="lg:col-span-7 space-y-6 text-center lg:text-left animate-pulse">
          <div class="inline-block h-7 w-56 rounded-full bg-surface-raised mx-auto lg:mx-0"></div>
          <div class="space-y-3">
            <div class="h-5 w-24 bg-surface-raised rounded mx-auto lg:mx-0"></div>
            <div class="h-12 sm:h-14 w-3/4 max-w-md bg-surface-raised rounded-xl mx-auto lg:mx-0"></div>
            <div class="h-9 w-64 bg-surface-raised rounded-lg mx-auto lg:mx-0"></div>
          </div>
          <div class="space-y-2 max-w-xl mx-auto lg:mx-0">
            <div class="h-5 bg-surface-raised rounded w-full"></div>
            <div class="h-5 bg-surface-raised rounded w-4/5 mx-auto lg:mx-0"></div>
          </div>
          <div class="flex items-center justify-center lg:justify-start gap-4 pt-4">
            <div class="h-12 w-36 bg-surface-raised rounded-xl"></div>
            <div class="h-12 w-36 bg-surface-raised rounded-xl"></div>
          </div>
        </div>

        <div class="lg:col-span-5 flex justify-center lg:justify-end animate-pulse">
          <div class="w-72 h-72 sm:w-84 sm:h-84 md:w-96 md:h-96 lg:w-[380px] lg:h-[380px] xl:w-[420px] xl:h-[420px] rounded-3xl bg-surface-raised border border-border"></div>
        </div>
      </div>

      <!-- Loaded Data State with Staggered Entrance Animation -->
      <div
        v-else
        class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center"
      >
        <!-- Text Column -->
        <div class="lg:col-span-7 space-y-6 text-center lg:text-left">
          <!-- 1. Availability Badge (Slide down) -->
          <div
            class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-raised border border-border text-xs font-medium text-accent transition-all duration-700 ease-out transform"
            :class="isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'"
          >
            <span class="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
            Tersedia untuk Pekerjaan & Proyek
          </div>

          <!-- 2. Heading & Dynamic Role (Slide up) -->
          <div
            class="space-y-2 transition-all duration-700 delay-150 ease-out transform"
            :class="isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'"
          >
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

          <!-- 3. Tagline (Slide up) -->
          <p
            class="text-ink-muted text-base sm:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed transition-all duration-700 delay-300 ease-out transform"
            :class="isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'"
          >
            {{ profile.tagline }}
          </p>

          <!-- 4. CTA Buttons (Slide up) -->
          <div
            class="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-4 transition-all duration-700 delay-500 ease-out transform"
            :class="isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'"
          >
            <BaseButton variant="primary" size="lg" @click="scrollTo('projects')">
              Lihat Proyek
            </BaseButton>
            <BaseButton variant="secondary" size="lg" @click="scrollTo('contact')">
              Hubungi Saya
            </BaseButton>
          </div>
        </div>

        <!-- Image Column with Scale-in and Floating Effect -->
        <div
          class="lg:col-span-5 flex justify-center lg:justify-end transition-all duration-1000 delay-200 ease-out transform"
          :class="isRevealed ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-6'"
        >
          <div class="relative group animate-float">
            <!-- Subtle accent glow border -->
            <div
              class="absolute -inset-1.5 rounded-3xl bg-gradient-to-r from-accent/25 to-accent-muted/20 blur-md group-hover:from-accent/40 group-hover:to-accent-muted/40 transition-all duration-500"
            ></div>
            <div
              class="relative w-72 h-72 sm:w-84 sm:h-84 md:w-96 md:h-96 lg:w-[380px] lg:h-[380px] xl:w-[420px] xl:h-[420px] rounded-3xl bg-surface-alt border border-border p-2.5 overflow-hidden shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]"
            >
              <img
                :src="profile.photo_url || defaultHeroImg"
                :alt="profile.full_name"
                class="w-full h-full object-cover rounded-xl grayscale-[15%] group-hover:grayscale-0 transition-all duration-500"
                loading="eager"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
