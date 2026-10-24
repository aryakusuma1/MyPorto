<script setup>
import { reactive, watch, ref } from 'vue'
import { X, Sliders } from 'lucide-vue-next'
import { supabase } from '../../../lib/supabase'
import BaseButton from '../../ui/BaseButton.vue'

const props = defineProps({
  skill: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['close', 'saved'])

const isSaving = ref(false)
const errorMessage = ref('')

const predefinedCategories = ['Frontend', 'Backend', 'Database', 'Tools', 'DevOps', 'Mobile']

const form = reactive({
  name: '',
  category: 'Frontend',
  level: 80,
  icon_url: '',
  sort_order: 0,
})

watch(
  () => props.skill,
  (val) => {
    if (val) {
      form.name = val.name || ''
      form.category = val.category || 'Frontend'
      form.level = val.level ?? 80
      form.icon_url = val.icon_url || ''
      form.sort_order = val.sort_order ?? 0
    } else {
      form.name = ''
      form.category = 'Frontend'
      form.level = 80
      form.icon_url = ''
      form.sort_order = 0
    }
  },
  { immediate: true }
)

function selectCategory(cat) {
  form.category = cat
}

async function handleSubmit() {
  errorMessage.value = ''
  if (!form.name.trim()) {
    errorMessage.value = 'Nama skill wajib diisi.'
    return
  }
  if (!form.category.trim()) {
    errorMessage.value = 'Kategori skill wajib diisi.'
    return
  }

  isSaving.value = true

  const levelNum = Math.min(100, Math.max(1, Number(form.level) || 80))

  const payload = {
    name: form.name.trim(),
    category: form.category.trim(),
    level: levelNum,
    icon_url: form.icon_url.trim() || null,
    sort_order: Number(form.sort_order) || 0,
  }

  try {
    if (props.skill?.id) {
      const { error } = await supabase.from('skills').update(payload).eq('id', props.skill.id)
      if (error) throw error
    } else {
      const { error } = await supabase.from('skills').insert([payload])
      if (error) throw error
    }
    emit('saved')
  } catch (err) {
    errorMessage.value = err.message || 'Gagal menyimpan data skill.'
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
    <div
      class="bg-surface-alt border border-border rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh] overflow-hidden my-auto animate-fade-in"
    >
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-border/80 bg-surface-raised/50 shrink-0">
        <div class="flex items-center gap-2.5">
          <div class="p-2 rounded-xl bg-accent/10 text-accent border border-accent/20">
            <Sliders class="w-5 h-5" />
          </div>
          <div>
            <h3 class="text-base font-heading font-semibold text-ink">
              {{ props.skill ? 'Edit Skill' : 'Tambah Skill Baru' }}
            </h3>
            <p class="text-xs text-ink-muted">
              Kompetensi teknis, level kemahiran, dan urutan
            </p>
          </div>
        </div>
        <button
          type="button"
          @click="emit('close')"
          class="p-1.5 text-ink-muted hover:text-ink hover:bg-surface-raised rounded-lg transition-colors cursor-pointer"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Form Body -->
      <form @submit.prevent="handleSubmit" class="p-6 overflow-y-auto space-y-5 flex-1">
        <div
          v-if="errorMessage"
          class="p-3.5 bg-red-950/40 border border-red-800 rounded-xl text-sm text-red-200"
        >
          {{ errorMessage }}
        </div>

        <!-- Nama Skill -->
        <div>
          <label class="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-2">
            Nama Skill <span class="text-accent">*</span>
          </label>
          <input
            v-model="form.name"
            type="text"
            placeholder="Contoh: Vue.js, PostgreSQL, Docker"
            class="w-full px-4 py-2.5 bg-surface-raised border border-border/80 rounded-xl text-ink text-sm focus:outline-none focus:border-accent transition-colors"
            required
          />
        </div>

        <!-- Kategori -->
        <div>
          <label class="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-2">
            Kategori <span class="text-accent">*</span>
          </label>
          <div class="flex flex-wrap gap-1.5 mb-2.5">
            <button
              v-for="cat in predefinedCategories"
              :key="cat"
              type="button"
              @click="selectCategory(cat)"
              class="px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer"
              :class="
                form.category === cat
                  ? 'bg-accent/15 border-accent text-accent font-semibold shadow-sm'
                  : 'bg-surface-raised/70 border-border/70 text-ink-muted hover:text-ink hover:bg-surface-raised'
              "
            >
              {{ cat }}
            </button>
          </div>
          <input
            v-model="form.category"
            type="text"
            placeholder="Atau ketik kategori kustom..."
            class="w-full px-4 py-2 bg-surface-raised border border-border/80 rounded-xl text-ink text-sm focus:outline-none focus:border-accent transition-colors"
            required
          />
        </div>

        <!-- Tingkat Kemahiran -->
        <div>
          <div class="flex justify-between items-center mb-2">
            <label class="text-xs font-semibold text-ink-muted uppercase tracking-wider">
              Tingkat Kemahiran (1-100%)
            </label>
            <span class="font-mono text-sm font-semibold text-accent">{{ form.level }}%</span>
          </div>
          <input
            v-model.number="form.level"
            type="range"
            min="1"
            max="100"
            step="1"
            class="w-full accent-accent h-2 bg-surface-raised rounded-lg cursor-pointer"
          />
          <div class="flex justify-between text-[11px] text-ink-muted/80 mt-1 font-mono">
            <span>Pemula (20%)</span>
            <span>Menengah (60%)</span>
            <span>Mahir (90%+)</span>
          </div>
        </div>

        <!-- Icon URL / Identifier -->
        <div>
          <label class="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-2">
            Icon URL / Identifier (Opsional)
          </label>
          <input
            v-model="form.icon_url"
            type="text"
            placeholder="https://... atau nama ikon"
            class="w-full px-4 py-2.5 bg-surface-raised border border-border/80 rounded-xl text-ink text-sm focus:outline-none focus:border-accent transition-colors"
          />
          <p class="text-[11px] text-ink-muted mt-1.5">
            Dapat berupa URL gambar/SVG ikon atau dikosongkan.
          </p>
        </div>

        <!-- Urutan Tampilan -->
        <div>
          <label class="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-2">
            Urutan Tampilan (Sort Order)
          </label>
          <input
            v-model.number="form.sort_order"
            type="number"
            class="w-full px-4 py-2.5 bg-surface-raised border border-border/80 rounded-xl text-ink text-sm focus:outline-none focus:border-accent transition-colors"
          />
          <p class="text-[11px] text-ink-muted mt-1">
            Nilai lebih kecil ditampilkan lebih awal dalam kategori yang sama.
          </p>
        </div>
      </form>

      <!-- Footer Buttons -->
      <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-border/80 bg-surface-raised/40 shrink-0">
        <BaseButton variant="ghost" @click="emit('close')" :disabled="isSaving">
          Batal
        </BaseButton>
        <BaseButton variant="primary" @click="handleSubmit" :loading="isSaving">
          {{ props.skill ? 'Perbarui Skill' : 'Simpan Skill' }}
        </BaseButton>
      </div>
    </div>
  </div>
</template>
