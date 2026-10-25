<script setup>
import { computed } from 'vue'

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  iconUrl: {
    type: String,
    default: '',
  },
  class: {
    type: String,
    default: 'w-10 h-10',
  },
})

// Normalisasi nama teknologi agar cocok dengan ikon yang sesuai
const normalizedName = computed(() => {
  return props.name.toLowerCase().replace(/[\s\.\-_]/g, '')
})
</script>

<template>
  <div :class="['inline-flex items-center justify-center shrink-0', props.class]">
    <!-- Custom Icon URL / Uploaded Image / External SVG -->
    <img
      v-if="iconUrl && !iconUrl.startsWith('file:')"
      :src="iconUrl"
      :alt="props.name"
      class="w-full h-full object-contain"
      loading="lazy"
    />

    <!-- Vue.js -->
    <svg v-else-if="normalizedName.includes('vue')" viewBox="0 0 128 128" class="w-full h-full">
      <path fill="#42b883" d="M78.8 10.4L64 36 49.2 10.4H0l64 110.8L128 10.4z" />
      <path fill="#35495e" d="M78.8 10.4L64 36 49.2 10.4H25.6L64 77l38.4-66.6z" />
    </svg>

    <!-- React.js -->
    <svg v-else-if="normalizedName.includes('react')" viewBox="-11.5 -10.23174 23 20.46348" class="w-full h-full">
      <circle cx="0" cy="0" r="2.05" fill="#61dafb" />
      <g stroke="#61dafb" stroke-width="1" fill="none">
        <ellipse rx="11" ry="4.2" />
        <ellipse rx="11" ry="4.2" transform="rotate(60)" />
        <ellipse rx="11" ry="4.2" transform="rotate(120)" />
      </g>
    </svg>

    <!-- TypeScript -->
    <svg v-else-if="normalizedName.includes('typescript') || normalizedName === 'ts'" viewBox="0 0 128 128" class="w-full h-full">
      <rect width="128" height="128" rx="20" fill="#3178c6" />
      <path fill="#ffffff" d="M70.8 55.4h-38v14.4h11.2v47.8h15.6V69.8h11.2V55.4zm22.4 20.6c-4.4-2.8-10.4-5.2-16.4-5.2-9.6 0-14.8 4.6-14.8 11.4 0 7.2 5.2 10.4 14.8 14.4 9.4 3.8 15 8.2 15 16.6 0 11.2-9.6 18.2-23.8 18.2-7.8 0-14.8-2.6-19.6-6.2l4.8-12.2c4.4 3.2 10 5.4 15.6 5.4 6.8 0 10.8-3.4 10.8-7.8 0-6.4-5.2-9.2-13.8-12.8-10.6-4.4-16-9-16-17.8 0-11.2 9.6-17.8 22.8-17.8 7.2 0 13.4 2 17.6 4.8l-4.8 12z" />
    </svg>

    <!-- JavaScript -->
    <svg v-else-if="normalizedName.includes('javascript') || normalizedName === 'js'" viewBox="0 0 128 128" class="w-full h-full">
      <rect width="128" height="128" rx="20" fill="#f7df1e" />
      <path fill="#000000" d="M67.3 100.8c2.4 3.9 6.2 6.5 12.3 6.5 5.8 0 9.7-2.9 9.7-6.9 0-4.8-3.9-6.6-10.4-9.4l-3.6-1.5c-10.3-4.4-17.2-9.9-17.2-22.1 0-11.5 8.8-20.2 22.6-20.2 9.9 0 17 4.1 21.6 12.1l-10.4 6.7c-2.3-4.1-5.1-5.9-11.1-5.9-5.1 0-8.6 3.1-8.6 6.7 0 4.3 2.7 6.1 9 8.8l3.6 1.5c12.4 5.3 19 10.6 19 23.3 0 13.4-10.3 21.3-25.5 21.3-14.3 0-23.2-6.9-26.9-15.6l10.9-6.9zm-38.6 1.8c2.2 3.6 5.1 6 10.7 6 5.4 0 8.9-2.2 8.9-10.7V48.4h14.7v49.7c0 16.5-9.6 23.9-23.3 23.9-12.1 0-19.4-6.3-23-14.8l12-7.4z" />
    </svg>

    <!-- Tailwind CSS -->
    <svg v-else-if="normalizedName.includes('tailwind')" viewBox="0 0 128 128" class="w-full h-full">
      <path fill="#38bdf8" d="M64 25.6c-21.3 0-34.7 10.7-40 32 8-10.7 17.3-14.7 28-12 6.1 1.5 10.4 6 15.3 10.8C75.2 64.2 85 73.6 104 73.6c21.3 0 34.7-10.7 40-32-8 10.7-17.3 14.7-28 12-6.1-1.5-10.4-6-15.3-10.8C92.8 35 83 25.6 64 25.6zm-40 48C2.7 73.6-10.7 84.3-16 105.6c8-10.7 17.3-14.7 28-12 6.1 1.5 10.4 6 15.3 10.8C35.2 112.2 45 121.6 64 121.6c21.3 0 34.7-10.7 40-32-8 10.7-17.3 14.7-28 12-6.1-1.5-10.4-6-15.3-10.8C52.8 83 43 73.6 24 73.6z" />
    </svg>

    <!-- HTML5 -->
    <svg v-else-if="normalizedName.includes('html')" viewBox="0 0 128 128" class="w-full h-full">
      <path fill="#e34f26" d="M19.2 117.3L7.7 0h112.6l-11.5 117.3L64 128l-44.8-10.7z" />
      <path fill="#ef652a" d="M64 118.5l36.8-8.8 9.6-97.7H64v106.5z" />
      <path fill="#ebebeb" d="M64 53.6H46.6l-1.3-14.6H64V24.5H29.6l3.8 43.6H64v-14.5zm0 37.1l-.3.1-15.7-4.2-1-11.2H32.4l1.9 22.1 29.7 8.2V90.7z" />
      <path fill="#ffffff" d="M63.9 53.6h17.4l-1.6 18.2-15.8 4.2v14.5l29.7-8.2 3.8-43.2H63.9V53.6zm0-29.1v14.5h34.4l1.3-14.5H63.9z" />
    </svg>

    <!-- CSS3 -->
    <svg v-else-if="normalizedName.includes('css')" viewBox="0 0 128 128" class="w-full h-full">
      <path fill="#1572b6" d="M19.2 117.3L7.7 0h112.6l-11.5 117.3L64 128l-44.8-10.7z" />
      <path fill="#33a9dc" d="M64 118.5l36.8-8.8 9.6-97.7H64v106.5z" />
      <path fill="#ebebeb" d="M64 53.6H46.6l-1.3-14.6H64V24.5H29.6l3.8 43.6H64v-14.5zm0 37.1l-.3.1-15.7-4.2-1-11.2H32.4l1.9 22.1 29.7 8.2V90.7z" />
      <path fill="#ffffff" d="M63.9 53.6h17.4l-1.6 18.2-15.8 4.2v14.5l29.7-8.2 3.8-43.2H63.9V53.6zm0-29.1v14.5h34.4l1.3-14.5H63.9z" />
    </svg>

    <!-- PHP -->
    <svg v-else-if="normalizedName.includes('php')" viewBox="0 0 128 128" class="w-full h-full">
      <ellipse cx="64" cy="64" rx="60" ry="34" fill="#777bb4" />
      <path fill="#ffffff" d="M42.8 74.2l2.6-14.8c1.4-8 6.4-12.8 14.4-12.8 6.4 0 10.6 3.6 9.6 10.2-.8 5-4.2 17.4-4.2 17.4H53.8l2.8-15.8c.4-2.4-.4-3.6-2.6-3.6-2.6 0-4.6 2-5.4 6.2l-2.4 13.2H34.8L44 26.6h11.4l-3.2 14.8h.4c3.4-5 8.8-8.2 15.4-8.2 8.6 0 13.8 5.6 12 15-1.2 6.4-4.8 18.4-4.8 18.4H63.8l2.8-15.8c.4-2.4-.4-3.6-2.6-3.6-2.6 0-4.6 2-5.4 6.2l-2.4 13.2H42.8z" />
    </svg>

    <!-- Laravel -->
    <svg v-else-if="normalizedName.includes('laravel')" viewBox="0 0 128 128" class="w-full h-full">
      <path fill="#ff2d20" d="M117.8 30.6L99.2 19.8c-1.8-1-4-1-5.8 0L66.6 35.4l26.8 15.6 24.4-14.2c1.8-1 1.8-3.6 0-4.6l-24.4-14.2c-1.8-1-4-1-5.8 0L19.4 67.8c-1.8 1-2.8 3-2.8 5v26.4c0 2 1 4 2.8 5l24.4 14.2c1.8 1 4 1 5.8 0l68.2-39.4c1.8-1 2.8-3 2.8-5V35.6c0-2-1-4-2.8-5zm-51.2 73.8l-21.4-12.4V68.2l21.4 12.4v23.8zm3-30.8L48.2 61.2l21.4-12.4 21.4 12.4-21.4 12.4zm24.2 24.6l-21.4-12.4V62.4l21.4 12.4v23.8z" />
    </svg>

    <!-- Next.js -->
    <svg v-else-if="normalizedName.includes('next')" viewBox="0 0 128 128" class="w-full h-full">
      <circle cx="64" cy="64" r="64" fill="#000000" />
      <path fill="#ffffff" d="M101.4 107.6L46.2 36.4H36.4v55.2h11.2V51.8l49.4 63.8c1.5-2.6 3-5.2 4.4-8zM80.4 36.4h11.2v33.4L80.4 55V36.4z" />
    </svg>

    <!-- Supabase -->
    <svg v-else-if="normalizedName.includes('supabase')" viewBox="0 0 128 128" class="w-full h-full">
      <path fill="#3ecf8e" d="M72.2 128L6.4 56.4c-4.2-4.6-1-12 5.2-12h44.2V3.4C55.8.8 59.2-.8 62 .4c2.8 1.2 4.2 4 4.2 7.2v44.2h47.2c6.4 0 9.8 7.4 5.2 12L72.2 128z" />
    </svg>

    <!-- MySQL -->
    <svg v-else-if="normalizedName.includes('mysql')" viewBox="0 0 128 128" class="w-full h-full">
      <path fill="#00758f" d="M117.8 79.2c-2.4-14.8-12.8-25.2-27.4-27.2-2.8-.4-5.6-.4-8.4 0-1.2-4.4-3.6-8.4-6.8-11.6-9.6-9.6-24.8-11.2-36-4L34 32c-3.2-3.2-8.4-3.2-11.6 0-3.2 3.2-3.2 8.4 0 11.6l5.2 5.2c-5.2 7.2-7.2 16.4-5.2 25.6 3.2 14.8 15.6 26 30.8 27.2 16.8 1.2 31.6-8.4 36.8-24 5.6 4 12.8 5.6 20 4.4 7.2-1.2 13.2-5.6 16.4-12 1.6 2.4 2.8 5.2 3.2 8.4 1.2 7.2-.8 14.4-5.2 19.6l8.8 6.4c6.8-7.6 9.6-18 8-28.4-.8-2.4-1.6-4.4-2.8-6.4z" />
    </svg>

    <!-- PostgreSQL -->
    <svg v-else-if="normalizedName.includes('postgres') || normalizedName.includes('sql')" viewBox="0 0 128 128" class="w-full h-full">
      <path fill="#336791" d="M63.8 6.4C32.2 6.4 6.4 32.2 6.4 63.8s25.8 57.4 57.4 57.4 57.4-25.8 57.4-57.4S95.4 6.4 63.8 6.4zm23.4 83.2H40.8v-7.2h46.4v7.2zm0-18H40.8v-7.2h46.4v7.2zm0-18H40.8v-7.2h46.4v7.2z" />
    </svg>

    <!-- Git -->
    <svg v-else-if="normalizedName.includes('git')" viewBox="0 0 128 128" class="w-full h-full">
      <path fill="#f05032" d="M124.6 57.2L70.8 3.4c-4.6-4.6-12-4.6-16.6 0L3.4 54.2c-4.6 4.6-4.6 12 0 16.6l53.8 53.8c4.6 4.6 12 4.6 16.6 0l50.8-50.8c4.6-4.6 4.6-12 0-16.6zM68.8 84.6v-5.2c-9.2 2.8-15.4-4-15.4-4-2.4-6-6-7.6-6-7.6-3-2 .2-2 .2-2 3.4.2 5.2 3.4 5.2 3.4 3 5 7.8 3.6 9.8 2.8.2-2.2 1.2-3.6 2.2-4.4-7.4-.8-15.2-3.6-15.2-16.4 0-3.6 1.2-6.6 3.4-9-.4-.8-1.6-4.2.4-8.8 0 0 2.8-.8 9.2 3.4 2.6-.8 5.6-1.2 8.4-1.2 2.8 0 5.8.4 8.4 1.2 6.4-4.4 9.2-3.4 9.2-3.4 2 4.6.8 8 .4 8.8 2.2 2.4 3.4 5.4 3.4 9 0 12.8-7.8 15.6-15.2 16.4 1.2 1 2.2 3 2.2 6.2v9.2c0 1 .6 2 2.4 1.6 13.8-4.6 23.8-17.6 23.8-33 0-19-15.4-34.4-34.4-34.4S34.4 45.4 34.4 64.4c0 15.4 10 28.4 23.8 33 1.8.4 2.4-.6 2.4-1.6v-8.8c0-2.4-.8-3.4-1.8-4.2z" />
    </svg>

    <!-- Node.js / Default Code Icon -->
    <svg v-else-if="normalizedName.includes('node')" viewBox="0 0 128 128" class="w-full h-full">
      <path fill="#5fa04e" d="M64 4.8L12.4 34.6v59.6L64 124l51.6-29.8V34.6L64 4.8zm36.8 78.4L64 104.8 27.2 83.2V44.8L64 23.2l36.8 21.6v38.4z" />
    </svg>

    <!-- Fallback General Code / Tech Icon -->
    <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full text-accent">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  </div>
</template>
