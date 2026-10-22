<script setup>
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowLeft,
  Github,
  ExternalLink,
  Layers,
  Cpu,
  CheckCircle2,
  AlertCircle,
  FolderGit2,
} from 'lucide-vue-next'
import { useProjectStore } from '../stores/project.store'
import AppNavbar from '../components/layout/AppNavbar.vue'
import BaseButton from '../components/ui/BaseButton.vue'
import BaseBadge from '../components/ui/BaseBadge.vue'
import BaseCard from '../components/ui/BaseCard.vue'
import SkeletonLoader from '../components/ui/SkeletonLoader.vue'

const route = useRoute()
const router = useRouter()
const projectStore = useProjectStore()

const slug = computed(() => route.params.slug)
const project = computed(() => projectStore.currentProject)
const details = computed(() => project.value?.project_details || {})

function goBack() {
  router.push('/#projects')
}

onMounted(async () => {
  const result = await projectStore.fetchProjectBySlug(slug.value)
  if (!result && !projectStore.loading) {
    router.replace({ name: 'not-found' })
  }
})
</script>

<template>
  <div class="min-h-screen bg-surface text-ink flex flex-col">
    <!-- Navbar -->
    <AppNavbar />

    <!-- Main Content -->
    <main class="flex-1 py-12 sm:py-16">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Back Navigation Button -->
        <button
          type="button"
          class="inline-flex items-center gap-2 text-sm font-medium text-ink-muted hover:text-accent transition-colors mb-8 cursor-pointer select-none group"
          @click="goBack"
        >
          <ArrowLeft class="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Kembali ke Daftar Proyek
        </button>

        <!-- Loading State -->
        <div v-if="projectStore.loading" class="space-y-6">
          <SkeletonLoader type="text" :count="2" />
          <div class="w-full h-72 bg-surface-raised rounded-xl animate-pulse"></div>
          <SkeletonLoader type="text" :count="4" />
        </div>

        <!-- Project Detail Content -->
        <article v-else-if="project" class="space-y-12">
          <!-- Header Area -->
          <header class="space-y-4">
            <div class="flex flex-wrap items-center gap-2">
              <BaseBadge variant="accent">
                {{ project.category || 'Software Project' }}
              </BaseBadge>
              <BaseBadge variant="default" class="uppercase text-[10px]">
                Status: {{ project.status || 'Selesai' }}
              </BaseBadge>
            </div>

            <h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading text-ink tracking-tight">
              {{ project.title }}
            </h1>

            <p class="text-ink-muted text-base sm:text-lg leading-relaxed max-w-3xl">
              {{ project.short_desc }}
            </p>

            <!-- Links (GitHub & Live Demo) -->
            <div class="flex flex-wrap items-center gap-3 pt-2">
              <a
                v-if="project.github_url"
                :href="project.github_url"
                target="_blank"
                rel="noopener noreferrer"
              >
                <BaseButton variant="secondary" size="md">
                  <Github class="w-4 h-4 mr-1.5" />
                  Source Code
                  <ExternalLink class="w-3.5 h-3.5 ml-1 opacity-70" />
                </BaseButton>
              </a>

              <a
                v-if="project.demo_url"
                :href="project.demo_url"
                target="_blank"
                rel="noopener noreferrer"
              >
                <BaseButton variant="primary" size="md">
                  Lihat Demo Langsung
                  <ExternalLink class="w-3.5 h-3.5 ml-1.5" />
                </BaseButton>
              </a>
            </div>
          </header>

          <!-- Cover Image or Banner Placeholder -->
          <div class="w-full rounded-xl overflow-hidden border border-border bg-surface-alt shadow-lg">
            <img
              v-if="project.cover_url"
              :src="project.cover_url"
              :alt="project.title"
              class="w-full h-auto max-h-[480px] object-cover"
            />
            <div
              v-else
              class="w-full h-64 sm:h-80 flex flex-col items-center justify-center bg-gradient-to-br from-surface-raised to-surface-alt p-8 text-center"
            >
              <FolderGit2 class="w-16 h-16 text-accent/50 mb-3" />
              <span class="text-ink font-heading font-semibold text-xl">{{ project.title }}</span>
              <span class="text-ink-muted text-xs mt-1">Pratinjau visual proyek</span>
            </div>
          </div>

          <!-- Tech Stack -->
          <section class="space-y-4">
            <h2 class="text-xl font-bold font-heading text-ink flex items-center gap-2">
              <Cpu class="w-5 h-5 text-accent" />
              Teknologi yang Digunakan
            </h2>
            <div class="flex flex-wrap gap-2">
              <BaseBadge
                v-for="(tech, i) in project.tech_stack || []"
                :key="i"
                variant="default"
                class="px-3 py-1 text-sm"
              >
                {{ tech }}
              </BaseBadge>
            </div>
          </section>

          <!-- Overview Section -->
          <section v-if="details.overview" class="space-y-4">
            <h2 class="text-xl font-bold font-heading text-ink flex items-center gap-2">
              <Layers class="w-5 h-5 text-accent" />
              Gambaran Umum Proyek
            </h2>
            <p class="text-ink-muted text-base leading-relaxed whitespace-pre-line">
              {{ details.overview }}
            </p>
          </section>

          <!-- Key Features -->
          <section v-if="details.features && details.features.length > 0" class="space-y-4">
            <h2 class="text-xl font-bold font-heading text-ink flex items-center gap-2">
              <CheckCircle2 class="w-5 h-5 text-accent" />
              Fitur Utama
            </h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <BaseCard
                v-for="(feat, idx) in details.features"
                :key="idx"
                :hoverable="false"
                class="space-y-1.5"
              >
                <h3 class="font-heading font-semibold text-ink text-base">
                  {{ feat.title }}
                </h3>
                <p class="text-ink-muted text-sm leading-relaxed">
                  {{ feat.description }}
                </p>
              </BaseCard>
            </div>
          </section>

          <!-- Architecture & Technical Design -->
          <section v-if="details.architecture || details.diagram_url" class="space-y-4">
            <h2 class="text-xl font-bold font-heading text-ink">
              Arsitektur & Desain Sistem
            </h2>
            <p v-if="details.architecture" class="text-ink-muted text-base leading-relaxed">
              {{ details.architecture }}
            </p>
            <div v-if="details.diagram_url" class="rounded-lg overflow-hidden border border-border mt-4">
              <img :src="details.diagram_url" alt="Diagram Arsitektur" class="w-full h-auto" />
            </div>
          </section>

          <!-- Challenges & Solutions -->
          <section v-if="details.challenges && details.challenges.length > 0" class="space-y-4">
            <h2 class="text-xl font-bold font-heading text-ink flex items-center gap-2">
              <AlertCircle class="w-5 h-5 text-accent" />
              Tantangan & Solusi Teknis
            </h2>
            <div class="space-y-4">
              <BaseCard
                v-for="(item, idx) in details.challenges"
                :key="idx"
                :hoverable="false"
                class="space-y-3"
              >
                <div>
                  <span class="text-xs font-semibold uppercase text-red-400/90 tracking-wider block mb-1">
                    Tantangan
                  </span>
                  <p class="text-ink font-medium text-sm sm:text-base">
                    {{ item.challenge }}
                  </p>
                </div>
                <div class="pt-3 border-t border-border/50">
                  <span class="text-xs font-semibold uppercase text-accent tracking-wider block mb-1">
                    Solusi yang Diterapkan
                  </span>
                  <p class="text-ink-muted text-sm sm:text-base">
                    {{ item.solution }}
                  </p>
                </div>
              </BaseCard>
            </div>
          </section>

          <!-- Screenshots Gallery -->
          <section v-if="details.screenshots && details.screenshots.length > 0" class="space-y-4">
            <h2 class="text-xl font-bold font-heading text-ink">
              Tangkapan Layar
            </h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                v-for="(shot, idx) in details.screenshots"
                :key="idx"
                class="rounded-lg overflow-hidden border border-border bg-surface-alt"
              >
                <img :src="shot.url" :alt="shot.caption || 'Screenshot'" class="w-full h-auto object-cover" />
                <p v-if="shot.caption" class="p-2.5 text-xs text-ink-muted text-center border-t border-border/40">
                  {{ shot.caption }}
                </p>
              </div>
            </div>
          </section>

          <!-- Bottom Back Button -->
          <div class="pt-8 border-t border-border/50">
            <BaseButton variant="secondary" size="md" @click="goBack">
              <ArrowLeft class="w-4 h-4 mr-1.5" />
              Kembali ke Halaman Utama
            </BaseButton>
          </div>
        </article>
      </div>
    </main>
  </div>
</template>
