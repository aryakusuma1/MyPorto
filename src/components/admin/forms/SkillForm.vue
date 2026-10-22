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

  const levelNum = Number(form.level)
  if (isNaN(levelNum) || levelNum < 1 || levelNum > 100) {
    errorMessage.value = 'Tingkat kemahiran (level) harus berada di antara 1 dan 100.'
    return
  }

  isSaving.value = true

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
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-canvas/80 backdrop-blur-sm">
    <div
      class="bg-canvas-card border border-canvas-subtle/40 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-fade-in"
    >
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-canvas-subtle/30 bg-canvas/50">
        <div class="flex items-center gap-2">
          <div class="p-2 rounded-lg bg-accent/10 text-accent">
            <Sliders class="w-5 h-5" />
          </div>
          <h3 class="text-lg font-heading font-semibold text-ink">
            {{ props.skill ? 'Edit Skill' : 'Tambah Skill Baru' }}
          </h3>
        </div>
        <button
          @click="emit('close')"
          class="p-2 text-ink-muted hover:text-ink hover:bg-canvas-subtle/20 rounded-lg transition-colors"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Form Body -->
      <form @submit.prevent="handleSubmit" class="p-6 overflow-y-auto space-y-5 flex-1">
        <div
          v-if="errorMessage"
          class="p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400"
        >
          {{ errorMessage }}
        </div>

        <!-- Nama Skill -->
        <div>
          <label class="block text-xs font-medium text-ink-muted uppercase tracking-wider mb-2">
            Nama Skill <span class="text-accent">*</span>
          </label>
          <input
            v-model="form.name"
            type="text"
            placeholder="Contoh: Vue.js 3, PostgreSQL, Docker"
            class="w-full px-4 py-2.5 bg-canvas border border-canvas-subtle/40 rounded-xl text-ink text-sm focus:outline-none focus:border-accent transition-colors"
            required
          />
        </div>

        <!-- Kategori -->
        <div>
          <label class="block text-xs font-medium text-ink-muted uppercase tracking-wider mb-2">
            Kategori <span class="text-accent">*</span>
          </label>
          <!-- Quick select chips -->
          <div class="flex flex-wrap gap-1.5 mb-2.5">
            <button
              v-for="cat in predefinedCategories"
              :key="cat"
              type="button"
              @click="selectCategory(cat)"
              class="px-2.5 py-1 text-xs rounded-lg border transition-all"
              :class="
                form.category === cat
                  ? 'bg-accent/15 border-accent text-accent font-medium'
                  : 'bg-canvas/50 border-canvas-subtle/30 text-ink-muted hover:text-ink hover:border-canvas-subtle'
              "
            >
              {{ cat }}
            </button>
          </div>
          <input
            v-model="form.category"
            type="text"
            placeholder="Atau masukkan kategori lain..."
            class="w-full px-4 py-2.5 bg-canvas border border-canvas-subtle/40 rounded-xl text-ink text-sm focus:outline-none focus:border-accent transition-colors"
            required
          />
        </div>

        <!-- Level Kemahiran (1-100) -->
        <div>
          <div class="flex items-center justify-between mb-2">
            <label class="text-xs font-medium text-ink-muted uppercase tracking-wider">
              Tingkat Kemahiran (1-100%)
            </label>
            <span class="text-sm font-semibold text-accent font-mono">{{ form.level }}%</span>
          </div>
          <input
            v-model.number="form.level"
            type="range"
            min="1"
            max="100"
            class="w-full h-2 bg-canvas rounded-lg appearance-none cursor-pointer accent-accent"
          />
          <div class="flex justify-between text-[11px] text-ink-muted/70 mt-1 font-mono">
            <span>Pemula (20%)</span>
            <span>Menengah (60%)</span>
            <span>Mahir (90%+)</span>
          </div>
        </div>

        <!-- Icon URL (Opsional) -->
        <div>
          <label class="block text-xs font-medium text-ink-muted uppercase tracking-wider mb-2">
            Icon URL / Identifier (Opsional)
          </label>
          <input
            v-model="form.icon_url"
            type="text"
            placeholder="https://... atau nama ikon"
            class="w-full px-4 py-2.5 bg-canvas border border-canvas-subtle/40 rounded-xl text-ink text-sm focus:outline-none focus:border-accent transition-colors"
          />
          <p class="text-[11px] text-ink-muted/70 mt-1">
            Dapat berupa URL SVG ikon atau dikosongkan.
          </p>
        </div>

        <!-- Sort Order -->
        <div>
          <label class="block text-xs font-medium text-ink-muted uppercase tracking-wider mb-2">
            Urutan Tampilan (Sort Order)
          </label>
          <input
            v-model.number="form.sort_order"
            type="number"
            class="w-full px-4 py-2.5 bg-canvas border border-canvas-subtle/40 rounded-xl text-ink text-sm focus:outline-none focus:border-accent transition-colors"
          />
          <p class="text-[11px] text-ink-muted/70 mt-1">
            Nilai lebih kecil ditampilkan lebih awal dalam kategori yang sama.
          </p>
        </div>
      </form>

      <!-- Footer Buttons -->
      <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-canvas-subtle/30 bg-canvas/50">
        <BaseButton variant="ghost" @click="emit('close')" :disabled="isSaving">
          Batal
        </BaseButton>
        <BaseButton variant="primary" @click="handleSubmit" :loading="isSaving">
          {{ props.skill ? 'Perbarui Skill' : 'Simpan Skill' }}
        </BaseButton>
      </div>
    </div>
  </div>
</template>\n