<script setup>
import { ref, computed, onMounted } from 'vue'
import { GraduationCap, Briefcase, Cpu, Calendar } from 'lucide-vue-next'
import { useExperienceStore } from '../../stores/experience.store'
import { useSkillStore } from '../../stores/skill.store'
import { useIntersection } from '../../composables/useIntersection'
import SectionTitle from '../ui/SectionTitle.vue'
import TechIcon from '../ui/TechIcon.vue'

const experienceStore = useExperienceStore()
const skillStore = useSkillStore()

const activeTab = ref('education')

const tabs = [
  { id: 'education', label: 'Pendidikan', icon: GraduationCap },
  { id: 'experience', label: 'Pengalaman', icon: Briefcase },
  { id: 'skills', label: 'Keahlian', icon: Cpu },
]

function formatDate(dateString) {
  if (!dateString) return 'Sekarang'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return dateString
  return date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })
}

function formatPeriod(start, end) {
  return `${formatDate(start)} – ${formatDate(end)}`
}

/**
 * Ekstraksi foto secara dinamis dari item (mendukung 1 s/d 4 foto).
 * Tanpa fallback gambar hardcode jika kosong.
 */
function getItemPhotos(item) {
  if (!item) return []
  if (Array.isArray(item.photos) && item.photos.length > 0) {
    return item.photos.filter(Boolean)
  }
  const raw = item.logo_url || item.image_url
  if (!raw) return []

  if (typeof raw === 'string' && raw.trim().startsWith('[')) {
    try {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed.filter(Boolean)
    } catch (e) {}
  }
  if (typeof raw === 'string' && raw.includes(',')) {
    return raw.split(',').map((s) => s.trim()).filter(Boolean)
  }
  return [raw]
}

const educationList = computed(() => {
  return [...experienceStore.experiences]
    .filter((item) => item.type === 'education')
    .sort((a, b) => {
      const orderA = a.sort_order ?? 9999
      const orderB = b.sort_order ?? 9999
      if (orderA !== orderB) return orderA - orderB
      return new Date(b.start_date || 0) - new Date(a.start_date || 0)
    })
})

const workList = computed(() => {
  return [...experienceStore.experiences]
    .filter((item) => item.type === 'work')
    .sort((a, b) => {
      const orderA = a.sort_order ?? 9999
      const orderB = b.sort_order ?? 9999
      if (orderA !== orderB) return orderA - orderB
      return new Date(b.start_date || 0) - new Date(a.start_date || 0)
    })
})

// Tech stack default jika data skill Supabase kosong
const defaultTechStack = [
  { name: 'Vue.js', category: 'Frontend', level: 90 },
  { name: 'React.js', category: 'Frontend', level: 85 },
  { name: 'TypeScript', category: 'Language', level: 80 },
  { name: 'JavaScript', category: 'Language', level: 90 },
  { name: 'Tailwind CSS', category: 'Styling', level: 95 },
  { name: 'HTML5', category: 'Frontend', level: 95 },
  { name: 'CSS3', category: 'Frontend', level: 90 },
  { name: 'PHP', category: 'Backend', level: 80 },
  { name: 'Laravel', category: 'Backend', level: 85 },
  { name: 'Next.js', category: 'Frontend', level: 80 },
  { name: 'Supabase', category: 'Database & BaaS', level: 85 },
  { name: 'MySQL', category: 'Database', level: 85 },
  { name: 'PostgreSQL', category: 'Database', level: 80 },
  { name: 'Git', category: 'Version Control', level: 85 },
  { name: 'Node.js', category: 'Backend', level: 80 },
]

const displaySkills = computed(() => {
  if (skillStore.skills && skillStore.skills.length > 0) {
    return skillStore.skills
  }
  return defaultTechStack
})

const sectionRef = ref(null)
const { isVisible, observe } = useIntersection({ threshold: 0.15 })

onMounted(() => {
  experienceStore.fetchExperiences()
  skillStore.fetchSkills()
  if (sectionRef.value) {
    observe(sectionRef.value)
  }
})
</script>

<template>
  <section id="journey" ref="sectionRef" class="py-20 border-t border-border/50 relative">
    <!-- Anchor alias untuk navigasi -->
    <span id="experience" class="sr-only"></span>
    <span id="skills" class="sr-only"></span>

    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Section Title Terpusat di Tengah (Proporsional & Subtitle 1 Baris) -->
      <SectionTitle
        tag="Rekam Jejak & Keahlian"
        title="Pendidikan, Pengalaman & Keahlian"
        subtitle="Eksplorasi latar belakang akademis, riwayat karir profesional, dan kompetensi teknologi."
        align="center"
        margin-bottom="mb-3 sm:mb-4"
        tag-class="text-xs sm:text-sm font-semibold tracking-wider"
        title-class="text-2xl sm:text-3xl md:text-[34px] font-bold"
        subtitle-class="text-xs sm:text-sm md:text-base leading-relaxed"
        subtitle-max-width="max-w-4xl"
      />

      <!-- Pill Tab Switcher Navbar (Naik Lebih Dekat ke Showcard) -->
      <div class="flex justify-center mb-5 sm:mb-6 px-2">
        <div
          class="w-full max-w-xl sm:max-w-2xl p-2 sm:p-2.5 rounded-2xl sm:rounded-full bg-surface-alt/95 border border-border backdrop-blur-xl shadow-2xl flex items-center justify-between gap-2 sm:gap-3"
        >
          <button
            v-for="tab in tabs"
            :key="tab.id"
            type="button"
            @click="activeTab = tab.id"
            class="flex-1 py-3 sm:py-3.5 px-3 sm:px-6 rounded-xl sm:rounded-full text-sm sm:text-base font-semibold transition-all duration-300 flex items-center justify-center gap-2 sm:gap-2.5 cursor-pointer select-none text-center"
            :class="
              activeTab === tab.id
                ? 'bg-surface-raised text-accent shadow-lg border border-accent/40 scale-[1.02] ring-1 ring-accent/30 font-bold'
                : 'text-ink-muted hover:text-ink hover:bg-surface-raised/50'
            "
          >
            <component :is="tab.icon" class="w-4 h-4 sm:w-5 sm:h-5 text-current shrink-0" />
            <span class="tracking-wide">{{ tab.label }}</span>
          </button>
        </div>
      </div>

      <!-- Tab Content Area with Scroll Reveal & Transitions -->
      <div
        class="transition-all duration-700 ease-out transform"
        :class="isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
      >
        <Transition name="tab-pane" mode="out-in">
          <!-- TAB 1: PENDIDIKAN FORMAL -->
          <div v-if="activeTab === 'education'" key="education" class="w-full space-y-3 sm:space-y-4">
            <div
              v-for="(item, index) in educationList"
              :key="item.id"
              class="relative flex items-start gap-4 sm:gap-6 group journey-card-reveal"
              :style="{ animationDelay: `${index * 120}ms` }"
            >
              <!-- Timeline Node Column (Sejajar Tepi Kiri max-w-6xl) -->
              <div class="flex flex-col items-center shrink-0 self-stretch">
                <div
                  class="w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10 shrink-0 bg-surface-raised text-accent border-accent/80 shadow-[0_0_12px_rgba(255,107,0,0.15)] group-hover:scale-110"
                >
                  <GraduationCap class="w-5 h-5" />
                </div>

                <div
                  v-if="index !== educationList.length - 1"
                  class="w-0.5 bg-border flex-1 my-2"
                ></div>
              </div>

              <!-- Content Card (Lebar Penuh & Selang-Seling) -->
              <div
                class="flex-1"
                :class="{ 'pb-4 sm:pb-5': index !== educationList.length - 1 }"
              >
                <div class="bg-surface-alt border border-border rounded-2xl p-6 sm:p-7 hover:border-accent/60 transition-all shadow-sm">
                  <!-- Kasus 1: Memiliki Foto (Layout Selang-Seling 2 Kolom, items-stretch) -->
                  <div v-if="getItemPhotos(item).length > 0" class="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
                    <!-- Entri Ganjil (index 0, 2, ...): Teks di Kiri (md:col-span-7), Foto di Kanan (md:col-span-5) -->
                    <template v-if="index % 2 === 0">
                      <!-- Kolom Teks (Kiri) -->
                      <div class="md:col-span-7 flex flex-col justify-start space-y-3">
                        <div>
                          <span class="text-xs font-semibold text-accent uppercase tracking-wider block mb-1">
                            {{ item.company }}
                          </span>
                          <h3 class="font-heading font-bold text-lg sm:text-xl text-ink">
                            {{ item.role }}
                          </h3>
                        </div>
                        <p class="text-ink-muted text-sm sm:text-base leading-relaxed">
                          {{ item.description }}
                        </p>
                      </div>

                      <!-- Kolom Foto (Kanan): Badge Tanggal Terkunci di Atas, Foto di Tengah Vertikal -->
                      <div class="md:col-span-5 flex flex-col justify-between py-1">
                        <!-- Badge Tanggal (Di Atas Foto, Sejajar Judul) -->
                        <div class="flex justify-start md:justify-end shrink-0">
                          <div class="inline-flex items-center gap-1.5 text-xs text-ink-muted font-mono bg-surface-raised px-3 py-1 rounded-md border border-border/60 shadow-sm shrink-0">
                            <Calendar class="w-3.5 h-3.5 text-accent" />
                            <span>{{ formatPeriod(item.start_date, item.end_date) }}</span>
                          </div>
                        </div>

                        <!-- Wadah Galeri Foto Mini: Vertikal Tepat di Tengah (flex-1 flex items-center justify-center) -->
                        <div class="flex-1 flex items-center justify-center py-3 w-full">
                          <div
                            class="grid gap-2.5 w-full"
                            :class="[
                              getItemPhotos(item).length === 1 ? 'grid-cols-1' : '',
                              getItemPhotos(item).length === 2 ? 'grid-cols-2' : '',
                              getItemPhotos(item).length === 3 ? 'grid-cols-3' : '',
                              getItemPhotos(item).length >= 4 ? 'grid-cols-2' : '',
                            ]"
                          >
                            <div
                              v-for="(photoUrl, pIdx) in getItemPhotos(item).slice(0, 4)"
                              :key="pIdx"
                              class="rounded-xl overflow-hidden border border-border/80 bg-surface-raised group/img relative"
                            >
                              <img
                                :src="photoUrl"
                                :alt="`${item.company} foto ${pIdx + 1}`"
                                class="w-full object-cover grayscale-[15%] group-hover/img:grayscale-0 transition-all duration-300"
                                :class="[
                                  getItemPhotos(item).length === 1 ? 'h-40 sm:h-48' : 'h-24 sm:h-28',
                                ]"
                                loading="lazy"
                              />
                            </div>
                          </div>
                        </div>

                        <!-- Spacer Penyeimbang Bawah agar posisi foto benar-benar center sejajar kartu -->
                        <div class="hidden md:flex justify-start md:justify-end shrink-0 invisible pointer-events-none" aria-hidden="true">
                          <div class="inline-flex items-center gap-1.5 text-xs px-3 py-1">
                            <span class="w-3.5 h-3.5"></span>
                            <span>0000 – 0000</span>
                          </div>
                        </div>
                      </div>
                    </template>

                    <!-- Entri Genap (index 1, 3, ...): Foto di Kiri (md:col-span-5), Teks di Kanan (md:col-span-7) -->
                    <template v-else>
                      <!-- Kolom Foto (Kiri): Badge Tanggal Terkunci di Atas, Foto di Tengah Vertikal -->
                      <div class="md:col-span-5 flex flex-col justify-between py-1 order-2 md:order-1">
                        <!-- Badge Tanggal (Di Atas Foto, Sejajar Judul) -->
                        <div class="flex justify-start shrink-0">
                          <div class="inline-flex items-center gap-1.5 text-xs text-ink-muted font-mono bg-surface-raised px-3 py-1 rounded-md border border-border/60 shadow-sm shrink-0">
                            <Calendar class="w-3.5 h-3.5 text-accent" />
                            <span>{{ formatPeriod(item.start_date, item.end_date) }}</span>
                          </div>
                        </div>

                        <!-- Wadah Galeri Foto Mini: Vertikal Tepat di Tengah (flex-1 flex items-center justify-center) -->
                        <div class="flex-1 flex items-center justify-center py-3 w-full">
                          <div
                            class="grid gap-2.5 w-full"
                            :class="[
                              getItemPhotos(item).length === 1 ? 'grid-cols-1' : '',
                              getItemPhotos(item).length === 2 ? 'grid-cols-2' : '',
                              getItemPhotos(item).length === 3 ? 'grid-cols-3' : '',
                              getItemPhotos(item).length >= 4 ? 'grid-cols-2' : '',
                            ]"
                          >
                            <div
                              v-for="(photoUrl, pIdx) in getItemPhotos(item).slice(0, 4)"
                              :key="pIdx"
                              class="rounded-xl overflow-hidden border border-border/80 bg-surface-raised group/img relative"
                            >
                              <img
                                :src="photoUrl"
                                :alt="`${item.company} foto ${pIdx + 1}`"
                                class="w-full object-cover grayscale-[15%] group-hover/img:grayscale-0 transition-all duration-300"
                                :class="[
                                  getItemPhotos(item).length === 1 ? 'h-40 sm:h-48' : 'h-24 sm:h-28',
                                ]"
                                loading="lazy"
                              />
                            </div>
                          </div>
                        </div>

                        <!-- Spacer Penyeimbang Bawah agar posisi foto benar-benar center sejajar kartu -->
                        <div class="hidden md:flex justify-start shrink-0 invisible pointer-events-none" aria-hidden="true">
                          <div class="inline-flex items-center gap-1.5 text-xs px-3 py-1">
                            <span class="w-3.5 h-3.5"></span>
                            <span>0000 – 0000</span>
                          </div>
                        </div>
                      </div>

                      <!-- Kolom Teks (Kanan) -->
                      <div class="md:col-span-7 flex flex-col justify-start space-y-3 order-1 md:order-2">
                        <div>
                          <span class="text-xs font-semibold text-accent uppercase tracking-wider block mb-1">
                            {{ item.company }}
                          </span>
                          <h3 class="font-heading font-bold text-lg sm:text-xl text-ink">
                            {{ item.role }}
                          </h3>
                        </div>
                        <p class="text-ink-muted text-sm sm:text-base leading-relaxed">
                          {{ item.description }}
                        </p>
                      </div>
                    </template>
                  </div>

                  <!-- Kasus 2: TANPA FOTO (Teks Full Width 100%, Tanpa Hardcode) -->
                  <div v-else class="space-y-3">
                    <div class="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span class="text-xs font-semibold text-accent uppercase tracking-wider block mb-1">
                          {{ item.company }}
                        </span>
                        <h3 class="font-heading font-bold text-lg sm:text-xl text-ink">
                          {{ item.role }}
                        </h3>
                      </div>
                      <div class="inline-flex items-center gap-1.5 text-xs text-ink-muted font-mono bg-surface-raised px-3 py-1 rounded-md border border-border/60 shadow-sm shrink-0">
                        <Calendar class="w-3.5 h-3.5 text-accent" />
                        <span>{{ formatPeriod(item.start_date, item.end_date) }}</span>
                      </div>
                    </div>
                    <p class="text-ink-muted text-sm sm:text-base leading-relaxed">
                      {{ item.description }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- TAB 2: PENGALAMAN KERJA -->
          <div v-else-if="activeTab === 'experience'" key="experience" class="w-full space-y-3 sm:space-y-4">
            <div
              v-for="(item, index) in workList"
              :key="item.id"
              class="relative flex items-start gap-4 sm:gap-6 group journey-card-reveal"
              :style="{ animationDelay: `${index * 120}ms` }"
            >
              <!-- Timeline Node Column (Sejajar Tepi Kiri max-w-6xl) -->
              <div class="flex flex-col items-center shrink-0 self-stretch">
                <div
                  class="w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10 shrink-0 bg-surface-raised text-accent border-accent/80 shadow-[0_0_12px_rgba(255,107,0,0.15)] group-hover:scale-110"
                >
                  <Briefcase class="w-5 h-5" />
                </div>

                <div
                  v-if="index !== workList.length - 1"
                  class="w-0.5 bg-border flex-1 my-2"
                ></div>
              </div>

              <!-- Content Card (Lebar Penuh & Selang-Seling) -->
              <div
                class="flex-1"
                :class="{ 'pb-4 sm:pb-5': index !== workList.length - 1 }"
              >
                <div class="bg-surface-alt border border-border rounded-2xl p-6 sm:p-7 hover:border-accent/60 transition-all shadow-sm">
                  <!-- Kasus 1: Memiliki Foto (Layout Selang-Seling 2 Kolom, items-stretch) -->
                  <div v-if="getItemPhotos(item).length > 0" class="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
                    <!-- Entri Ganjil (index 0, 2, ...): Teks di Kiri (md:col-span-7), Foto di Kanan (md:col-span-5) -->
                    <template v-if="index % 2 === 0">
                      <!-- Kolom Teks (Kiri) -->
                      <div class="md:col-span-7 flex flex-col justify-start space-y-3">
                        <div>
                          <span class="text-xs font-semibold text-accent uppercase tracking-wider block mb-1">
                            {{ item.company }}
                          </span>
                          <h3 class="font-heading font-bold text-lg sm:text-xl text-ink">
                            {{ item.role }}
                          </h3>
                        </div>
                        <p class="text-ink-muted text-sm sm:text-base leading-relaxed">
                          {{ item.description }}
                        </p>
                      </div>

                      <!-- Kolom Foto (Kanan): Badge Tanggal Terkunci di Atas, Foto di Tengah Vertikal -->
                      <div class="md:col-span-5 flex flex-col justify-between py-1">
                        <!-- Badge Tanggal (Di Atas Foto, Sejajar Judul) -->
                        <div class="flex justify-start md:justify-end shrink-0">
                          <div class="inline-flex items-center gap-1.5 text-xs text-ink-muted font-mono bg-surface-raised px-3 py-1 rounded-md border border-border/60 shadow-sm shrink-0">
                            <Calendar class="w-3.5 h-3.5 text-accent" />
                            <span>{{ formatPeriod(item.start_date, item.end_date) }}</span>
                          </div>
                        </div>

                        <!-- Wadah Galeri Foto Mini: Vertikal Tepat di Tengah (flex-1 flex items-center justify-center) -->
                        <div class="flex-1 flex items-center justify-center py-3 w-full">
                          <div
                            class="grid gap-2.5 w-full"
                            :class="[
                              getItemPhotos(item).length === 1 ? 'grid-cols-1' : '',
                              getItemPhotos(item).length === 2 ? 'grid-cols-2' : '',
                              getItemPhotos(item).length === 3 ? 'grid-cols-3' : '',
                              getItemPhotos(item).length >= 4 ? 'grid-cols-2' : '',
                            ]"
                          >
                            <div
                              v-for="(photoUrl, pIdx) in getItemPhotos(item).slice(0, 4)"
                              :key="pIdx"
                              class="rounded-xl overflow-hidden border border-border/80 bg-surface-raised group/img relative"
                            >
                              <img
                                :src="photoUrl"
                                :alt="`${item.company} foto ${pIdx + 1}`"
                                class="w-full object-cover grayscale-[15%] group-hover/img:grayscale-0 transition-all duration-300"
                                :class="[
                                  getItemPhotos(item).length === 1 ? 'h-40 sm:h-48' : 'h-24 sm:h-28',
                                ]"
                                loading="lazy"
                              />
                            </div>
                          </div>
                        </div>

                        <!-- Spacer Penyeimbang Bawah agar posisi foto benar-benar center sejajar kartu -->
                        <div class="hidden md:flex justify-start md:justify-end shrink-0 invisible pointer-events-none" aria-hidden="true">
                          <div class="inline-flex items-center gap-1.5 text-xs px-3 py-1">
                            <span class="w-3.5 h-3.5"></span>
                            <span>0000 – 0000</span>
                          </div>
                        </div>
                      </div>
                    </template>

                    <!-- Entri Genap (index 1, 3, ...): Foto di Kiri (md:col-span-5), Teks di Kanan (md:col-span-7) -->
                    <template v-else>
                      <!-- Kolom Foto (Kiri): Badge Tanggal Terkunci di Atas, Foto di Tengah Vertikal -->
                      <div class="md:col-span-5 flex flex-col justify-between py-1 order-2 md:order-1">
                        <!-- Badge Tanggal (Di Atas Foto, Sejajar Judul) -->
                        <div class="flex justify-start shrink-0">
                          <div class="inline-flex items-center gap-1.5 text-xs text-ink-muted font-mono bg-surface-raised px-3 py-1 rounded-md border border-border/60 shadow-sm shrink-0">
                            <Calendar class="w-3.5 h-3.5 text-accent" />
                            <span>{{ formatPeriod(item.start_date, item.end_date) }}</span>
                          </div>
                        </div>

                        <!-- Wadah Galeri Foto Mini: Vertikal Tepat di Tengah (flex-1 flex items-center justify-center) -->
                        <div class="flex-1 flex items-center justify-center py-3 w-full">
                          <div
                            class="grid gap-2.5 w-full"
                            :class="[
                              getItemPhotos(item).length === 1 ? 'grid-cols-1' : '',
                              getItemPhotos(item).length === 2 ? 'grid-cols-2' : '',
                              getItemPhotos(item).length === 3 ? 'grid-cols-3' : '',
                              getItemPhotos(item).length >= 4 ? 'grid-cols-2' : '',
                            ]"
                          >
                            <div
                              v-for="(photoUrl, pIdx) in getItemPhotos(item).slice(0, 4)"
                              :key="pIdx"
                              class="rounded-xl overflow-hidden border border-border/80 bg-surface-raised group/img relative"
                            >
                              <img
                                :src="photoUrl"
                                :alt="`${item.company} foto ${pIdx + 1}`"
                                class="w-full object-cover grayscale-[15%] group-hover/img:grayscale-0 transition-all duration-300"
                                :class="[
                                  getItemPhotos(item).length === 1 ? 'h-40 sm:h-48' : 'h-24 sm:h-28',
                                ]"
                                loading="lazy"
                              />
                            </div>
                          </div>
                        </div>

                        <!-- Spacer Penyeimbang Bawah agar posisi foto benar-benar center sejajar kartu -->
                        <div class="hidden md:flex justify-start shrink-0 invisible pointer-events-none" aria-hidden="true">
                          <div class="inline-flex items-center gap-1.5 text-xs px-3 py-1">
                            <span class="w-3.5 h-3.5"></span>
                            <span>0000 – 0000</span>
                          </div>
                        </div>
                      </div>

                      <!-- Kolom Teks (Kanan) -->
                      <div class="md:col-span-7 flex flex-col justify-start space-y-3 order-1 md:order-2">
                        <div>
                          <span class="text-xs font-semibold text-accent uppercase tracking-wider block mb-1">
                            {{ item.company }}
                          </span>
                          <h3 class="font-heading font-bold text-lg sm:text-xl text-ink">
                            {{ item.role }}
                          </h3>
                        </div>
                        <p class="text-ink-muted text-sm sm:text-base leading-relaxed">
                          {{ item.description }}
                        </p>
                      </div>
                    </template>
                  </div>

                  <!-- Kasus 2: TANPA FOTO (Teks Full Width 100%, Tanpa Hardcode) -->
                  <div v-else class="space-y-3">
                    <div class="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span class="text-xs font-semibold text-accent uppercase tracking-wider block mb-1">
                          {{ item.company }}
                        </span>
                        <h3 class="font-heading font-bold text-lg sm:text-xl text-ink">
                          {{ item.role }}
                        </h3>
                      </div>
                      <div class="inline-flex items-center gap-1.5 text-xs text-ink-muted font-mono bg-surface-raised px-3 py-1 rounded-md border border-border/60 shadow-sm shrink-0">
                        <Calendar class="w-3.5 h-3.5 text-accent" />
                        <span>{{ formatPeriod(item.start_date, item.end_date) }}</span>
                      </div>
                    </div>
                    <p class="text-ink-muted text-sm sm:text-base leading-relaxed">
                      {{ item.description }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- TAB 3: KEAHLIAN TEKNIS (MODERN SQUIRCLE GRID) -->
          <div v-else-if="activeTab === 'skills'" key="skills" class="w-full">
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6 max-w-5xl mx-auto">
              <div
                v-for="(skill, sIdx) in displaySkills"
                :key="skill.name"
                class="relative group rounded-3xl p-5 sm:p-6 bg-surface-alt/70 border border-border/80 hover:border-accent/60 transition-all duration-300 flex flex-col items-center justify-center text-center gap-3.5 shadow-md hover:shadow-[0_0_25px_rgba(255,107,0,0.14)] hover:-translate-y-1 skill-card-reveal"
                :style="{ animationDelay: `${sIdx * 40}ms` }"
              >
                <!-- Icon Container -->
                <div
                  class="w-14 h-14 rounded-2xl bg-surface-raised/80 border border-border flex items-center justify-center p-2.5 group-hover:scale-110 transition-transform duration-300"
                >
                  <TechIcon :name="skill.name" class="w-full h-full" />
                </div>

                <!-- Tech Name -->
                <span class="font-heading font-semibold text-sm sm:text-base text-ink group-hover:text-accent transition-colors">
                  {{ skill.name }}
                </span>

                <!-- Category or Level indicator -->
                <span class="text-[11px] text-ink-muted/80 px-2.5 py-0.5 rounded-full bg-surface-raised border border-border/40 font-mono">
                  {{ skill.category || (skill.level ? `${skill.level}%` : 'Skill') }}
                </span>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Tab Fade & Slide Animation */
.tab-pane-enter-active,
.tab-pane-leave-active {
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
.tab-pane-enter-from {
  opacity: 0;
  transform: translateY(16px);
}
.tab-pane-leave-to {
  opacity: 0;
  transform: translateY(-16px);
}

/* Cascade entrance for journey timeline cards */
@keyframes cardEntrance {
  0% {
    opacity: 0;
    transform: translateY(24px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.journey-card-reveal {
  opacity: 0;
  animation: cardEntrance 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.skill-card-reveal {
  opacity: 0;
  animation: cardEntrance 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
</style>
