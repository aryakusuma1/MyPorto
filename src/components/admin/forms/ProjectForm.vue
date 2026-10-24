<script setup>
import { ref, reactive, watch } from 'vue'
import { Plus, Trash2, X } from 'lucide-vue-next'
import { supabase } from '../../../lib/supabase'
import BaseButton from '../../ui/BaseButton.vue'
import ImageUploader from '../ImageUploader.vue'

const props = defineProps({
  project: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['close', 'saved'])

const activeTab = ref('general') // 'general' | 'details'
const isSaving = ref(false)
const errorMessage = ref('')

const form = reactive({
  title: '',
  slug: '',
  short_desc: '',
  category: 'Frontend & Fullstack',
  status: 'completed',
  featured: false,
  cover_url: '',
  github_url: '',
  demo_url: '',
  tech_stack_input: '',
  sort_order: 0,
  // Detail fields
  overview: '',
  architecture: '',
  diagram_url: '',
  features: [],
  challenges: [],
  screenshots: [],
})

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
}

function handleTitleChange() {
  if (!props.project) {
    form.slug = slugify(form.title)
  }
}

function addFeature() {
  form.features.push({ title: '', description: '' })
}

function removeFeature(index) {
  form.features.splice(index, 1)
}

function addChallenge() {
  form.challenges.push({ challenge: '', solution: '' })
}

function removeChallenge(index) {
  form.challenges.splice(index, 1)
}

function addScreenshot() {
  form.screenshots.push({ url: '', caption: '' })
}

function removeScreenshot(index) {
  form.screenshots.splice(index, 1)
}

// Watch initial data for edit mode
watch(
  () => props.project,
  (val) => {
    if (val) {
      form.title = val.title || ''
      form.slug = val.slug || ''
      form.short_desc = val.short_desc || ''
      form.category = val.category || 'Web App'
      form.status = val.status || 'completed'
      form.featured = !!val.featured
      form.cover_url = val.cover_url || ''
      form.github_url = val.github_url || ''
      form.demo_url = val.demo_url || ''
      form.sort_order = val.sort_order ?? 0
      form.tech_stack_input = Array.isArray(val.tech_stack) ? val.tech_stack.join(', ') : ''

      const details = val.project_details || {}
      form.overview = details.overview || ''
      form.architecture = details.architecture || ''
      form.diagram_url = details.diagram_url || ''
      form.features = Array.isArray(details.features) ? [...details.features] : []
      form.challenges = Array.isArray(details.challenges) ? [...details.challenges] : []
      form.screenshots = Array.isArray(details.screenshots) ? [...details.screenshots] : []
    }
  },
  { immediate: true }
)

async function handleSubmit() {
  errorMessage.value = ''
  if (!form.title.trim() || !form.slug.trim()) {
    errorMessage.value = 'Judul dan slug proyek wajib diisi.'
    return
  }

  isSaving.value = true

  const techStackArray = form.tech_stack_input
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  const projectPayload = {
    title: form.title.trim(),
    slug: form.slug.trim(),
    short_desc: form.short_desc.trim(),
    category: form.category,
    status: form.status,
    featured: form.featured,
    cover_url: form.cover_url || null,
    sort_order: Number(form.sort_order) || 0,
    github_url: form.github_url.trim() || null,
    demo_url: form.demo_url.trim() || null,
    tech_stack: techStackArray,
  }

  try {
    let projectId = props.project?.id

    if (props.project) {
      // Update existing project
      const { error: updateError } = await supabase
        .from('projects')
        .update(projectPayload)
        .eq('id', projectId)

      if (updateError) throw updateError
    } else {
      // Insert new project
      const { data: newProj, error: insertError } = await supabase
        .from('projects')
        .insert(projectPayload)
        .select()
        .single()

      if (insertError) throw insertError
      projectId = newProj.id
    }

    // Upsert project_details
    const detailsPayload = {
      project_id: projectId,
      overview: form.overview.trim() || null,
      architecture: form.architecture.trim() || null,
      diagram_url: form.diagram_url || null,
      features: form.features.filter((f) => f.title.trim()),
      challenges: form.challenges.filter((c) => c.challenge.trim()),
      screenshots: form.screenshots.filter((s) => s.url.trim()),
    }

    const { error: detailsError } = await supabase
      .from('project_details')
      .upsert(detailsPayload, { onConflict: 'project_id' })

    if (detailsError) throw detailsError

    emit('saved')
  } catch (err) {
    console.error('[ProjectForm] Error saving project:', err)
    errorMessage.value = err.message || 'Gagal menyimpan proyek. Pastikan Anda sudah login.'
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div class="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex justify-center items-center p-4 overflow-y-auto">
    <div class="bg-surface-alt border border-border rounded-xl w-full max-w-3xl my-8 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-border flex items-center justify-between">
        <h3 class="font-heading font-bold text-lg text-ink">
          {{ project ? 'Edit Proyek' : 'Tambah Proyek Baru' }}
        </h3>
        <button
          type="button"
          class="p-1 rounded text-ink-muted hover:text-ink hover:bg-surface-raised cursor-pointer"
          @click="emit('close')"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Tab Navigation -->
      <div class="flex border-b border-border bg-surface px-6 pt-2 gap-4">
        <button
          type="button"
          :class="[
            'pb-2.5 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer',
            activeTab === 'general'
              ? 'text-accent border-b-2 border-accent'
              : 'text-ink-muted hover:text-ink',
          ]"
          @click="activeTab = 'general'"
        >
          Informasi Utama
        </button>
        <button
          type="button"
          :class="[
            'pb-2.5 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer',
            activeTab === 'details'
              ? 'text-accent border-b-2 border-accent'
              : 'text-ink-muted hover:text-ink',
          ]"
          @click="activeTab = 'details'"
        >
          Konten Detail & Arsitektur
        </button>
      </div>

      <!-- Form Body -->
      <form class="p-6 overflow-y-auto space-y-5 flex-1" @submit.prevent="handleSubmit">
        <div v-if="errorMessage" class="p-3 bg-red-950/40 border border-red-800 text-red-200 text-xs rounded-lg">
          {{ errorMessage }}
        </div>

        <!-- TAB 1: GENERAL INFO -->
        <div v-show="activeTab === 'general'" class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-medium text-ink-muted mb-1">Judul Proyek *</label>
              <input
                v-model="form.title"
                type="text"
                required
                class="w-full px-3 py-2 rounded-lg bg-surface-raised border border-border text-ink text-sm focus:border-accent focus:outline-none"
                placeholder="Contoh: Web E-Commerce"
                @input="handleTitleChange"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-ink-muted mb-1">Slug URL *</label>
              <input
                v-model="form.slug"
                type="text"
                required
                class="w-full px-3 py-2 rounded-lg bg-surface-raised border border-border text-ink text-sm focus:border-accent focus:outline-none"
                placeholder="web-e-commerce"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-medium text-ink-muted mb-1">Deskripsi Singkat</label>
            <textarea
              v-model="form.short_desc"
              rows="2"
              class="w-full px-3 py-2 rounded-lg bg-surface-raised border border-border text-ink text-sm focus:border-accent focus:outline-none"
              placeholder="Ringkasan 1-2 kalimat mengenai proyek ini"
            ></textarea>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label class="block text-xs font-medium text-ink-muted mb-1">Kategori</label>
              <input
                v-model="form.category"
                type="text"
                class="w-full px-3 py-2 rounded-lg bg-surface-raised border border-border text-ink text-sm focus:border-accent focus:outline-none"
                placeholder="Frontend, Backend, etc."
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-ink-muted mb-1">Status Proyek</label>
              <select
                v-model="form.status"
                class="w-full px-3 py-2 rounded-lg bg-surface-raised border border-border text-ink text-sm focus:border-accent focus:outline-none"
              >
                <option value="completed">Completed (Selesai)</option>
                <option value="ongoing">Ongoing (Dalam Pengerjaan)</option>
                <option value="archived">Archived (Diarsipkan)</option>
              </select>
            </div>
            <div class="flex items-center pt-5">
              <label class="flex items-center gap-2 cursor-pointer select-none text-sm text-ink">
                <input
                  v-model="form.featured"
                  type="checkbox"
                  class="rounded bg-surface-raised border-border text-accent focus:ring-accent"
                />
                Proyek Unggulan (Featured)
              </label>
            </div>
          </div>

          <div>
            <label class="block text-xs font-medium text-ink-muted mb-1">Tech Stack (pisahkan dengan koma)</label>
            <input
              v-model="form.tech_stack_input"
              type="text"
              class="w-full px-3 py-2 rounded-lg bg-surface-raised border border-border text-ink text-sm focus:border-accent focus:outline-none"
              placeholder="Vue 3, Tailwind CSS, Supabase, Pinia"
            />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-medium text-ink-muted mb-1">URL GitHub</label>
              <input
                v-model="form.github_url"
                type="url"
                class="w-full px-3 py-2 rounded-lg bg-surface-raised border border-border text-ink text-sm focus:border-accent focus:outline-none"
                placeholder="https://github.com/..."
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-ink-muted mb-1">URL Demo</label>
              <input
                v-model="form.demo_url"
                type="url"
                class="w-full px-3 py-2 rounded-lg bg-surface-raised border border-border text-ink text-sm focus:border-accent focus:outline-none"
                placeholder="https://..."
              />
            </div>
          </div>

          <ImageUploader
            v-model="form.cover_url"
            folder="projects"
            label="Cover Proyek"
            aspect-ratio="16:9"
          />
        </div>

        <!-- TAB 2: DETAILS & ARCHITECTURE -->
        <div v-show="activeTab === 'details'" class="space-y-6">
          <div>
            <label class="block text-xs font-medium text-ink-muted mb-1">Gambaran Umum (Overview)</label>
            <textarea
              v-model="form.overview"
              rows="3"
              class="w-full px-3 py-2 rounded-lg bg-surface-raised border border-border text-ink text-sm focus:border-accent focus:outline-none"
              placeholder="Penjelasan mendalam mengenai tujuan dan latar belakang proyek..."
            ></textarea>
          </div>

          <div>
            <label class="block text-xs font-medium text-ink-muted mb-1">Arsitektur Teknis</label>
            <textarea
              v-model="form.architecture"
              rows="3"
              class="w-full px-3 py-2 rounded-lg bg-surface-raised border border-border text-ink text-sm focus:border-accent focus:outline-none"
              placeholder="Penjelasan arsitektur sistem, alur data, atau pola desain..."
            ></textarea>
          </div>

          <ImageUploader
            v-model="form.diagram_url"
            folder="projects/diagrams"
            label="Diagram Arsitektur (Opsional)"
            aspect-ratio="16:9"
          />

          <!-- Features list -->
          <div class="space-y-3 pt-2 border-t border-border/60">
            <div class="flex items-center justify-between">
              <label class="text-xs font-semibold text-accent uppercase tracking-wider">Daftar Fitur Utama</label>
              <button
                type="button"
                class="text-xs text-accent hover:underline inline-flex items-center gap-1 cursor-pointer"
                @click="addFeature"
              >
                <Plus class="w-3.5 h-3.5" /> Tambah Fitur
              </button>
            </div>

            <div v-for="(feat, idx) in form.features" :key="idx" class="flex gap-2 items-start bg-surface-raised/40 p-2.5 rounded-lg border border-border/50">
              <div class="flex-1 space-y-1.5">
                <input
                  v-model="feat.title"
                  type="text"
                  placeholder="Nama fitur"
                  class="w-full px-2.5 py-1.5 rounded bg-surface border border-border text-ink text-xs focus:border-accent focus:outline-none"
                />
                <input
                  v-model="feat.description"
                  type="text"
                  placeholder="Deskripsi fitur"
                  class="w-full px-2.5 py-1.5 rounded bg-surface border border-border text-ink text-xs focus:border-accent focus:outline-none"
                />
              </div>
              <button
                type="button"
                class="text-ink-muted hover:text-red-400 p-1 cursor-pointer"
                @click="removeFeature(idx)"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Challenges list -->
          <div class="space-y-3 pt-2 border-t border-border/60">
            <div class="flex items-center justify-between">
              <label class="text-xs font-semibold text-accent uppercase tracking-wider">Tantangan & Solusi</label>
              <button
                type="button"
                class="text-xs text-accent hover:underline inline-flex items-center gap-1 cursor-pointer"
                @click="addChallenge"
              >
                <Plus class="w-3.5 h-3.5" /> Tambah Tantangan
              </button>
            </div>

            <div v-for="(ch, idx) in form.challenges" :key="idx" class="flex gap-2 items-start bg-surface-raised/40 p-2.5 rounded-lg border border-border/50">
              <div class="flex-1 space-y-1.5">
                <input
                  v-model="ch.challenge"
                  type="text"
                  placeholder="Tantangan teknis"
                  class="w-full px-2.5 py-1.5 rounded bg-surface border border-border text-ink text-xs focus:border-accent focus:outline-none"
                />
                <input
                  v-model="ch.solution"
                  type="text"
                  placeholder="Solusi yang diimplementasikan"
                  class="w-full px-2.5 py-1.5 rounded bg-surface border border-border text-ink text-xs focus:border-accent focus:outline-none"
                />
              </div>
              <button
                type="button"
                class="text-ink-muted hover:text-red-400 p-1 cursor-pointer"
                @click="removeChallenge(idx)"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <!-- Submit Footer -->
        <div class="pt-4 border-t border-border flex justify-end gap-3">
          <BaseButton type="button" variant="ghost" size="md" @click="emit('close')">
            Batal
          </BaseButton>
          <BaseButton type="submit" variant="primary" size="md" :loading="isSaving">
            Simpan Proyek
          </BaseButton>
        </div>
      </form>
    </div>
  </div>
</template>
