<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProjectStore } from '../../stores/project.store'
import { useIntersection } from '../../composables/useIntersection'
import SectionTitle from '../ui/SectionTitle.vue'
import ProjectCard from '../project/ProjectCard.vue'
import SkeletonLoader from '../ui/SkeletonLoader.vue'

const router = useRouter()
const projectStore = useProjectStore()
const contentRef = ref(null)
const { isVisible, observe } = useIntersection({ threshold: 0.15 })

function navigateToProject(slug) {
  router.push(`/projects/${slug}`)
}

onMounted(() => {
  projectStore.fetchProjects()
  if (contentRef.value) {
    observe(contentRef.value)
  }
})
</script>

<template>
  <section id="projects" class="py-20 border-t border-border/50">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <SectionTitle
        tag="Portofolio Proyek"
        title="Karya & Solusi Nyata"
        subtitle="Eksplorasi proyek-proyek terpilih yang telah saya rancang dan bangun dengan arsitektur modern."
      />

      <div
        ref="contentRef"
        class="transition-all duration-700 ease-out transform"
        :class="isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
      >
        <!-- Skeleton Loading State -->
        <div
          v-if="projectStore.loading"
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <SkeletonLoader type="card" :count="3" />
        </div>

        <!-- Projects Grid State -->
        <div
          v-else-if="projectStore.projects && projectStore.projects.length > 0"
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <ProjectCard
            v-for="project in projectStore.projects"
            :key="project.id"
            :project="project"
            @click="navigateToProject"
          />
        </div>

        <!-- Empty State -->
        <div
          v-else
          class="text-center py-16 bg-surface-alt border border-border rounded-lg p-8"
        >
          <p class="text-ink-muted text-base">
            Belum ada proyek yang ditampilkan saat ini.
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
