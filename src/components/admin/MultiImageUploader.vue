<script setup>
import { ref } from 'vue'
import { UploadCloud, X, AlertCircle, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { supabase } from '../../lib/supabase'
import ImageCropperModal from './ImageCropperModal.vue'

const props = defineProps({
  bucket: {
    type: String,
    default: 'portfolio-images',
  },
  folder: {
    type: String,
    default: 'experiences',
  },
  modelValue: {
    type: Array,
    default: () => [],
  },
  maxImages: {
    type: Number,
    default: 4,
  },
  label: {
    type: String,
    default: 'Foto Dokumentasi / Kegiatan / Logo (Maksimal 4 Foto)',
  },
  aspectRatio: {
    type: String,
    default: '16:9',
  },
})

const emit = defineEmits(['update:modelValue', 'error'])

const isUploading = ref(false)
const errorMessage = ref('')
const fileInputRef = ref(null)

// Queue crop state
const cropQueue = ref([])
const activeCropFile = ref(null)
const isCropperOpen = ref(false)

function triggerFileInput() {
  if (fileInputRef.value) {
    fileInputRef.value.click()
  }
}

function handleFileChange(event) {
  const files = Array.from(event.target.files || [])
  if (!files.length) return

  errorMessage.value = ''
  const currentImages = Array.isArray(props.modelValue) ? [...props.modelValue] : []
  const availableSlots = props.maxImages - currentImages.length

  if (availableSlots <= 0) {
    errorMessage.value = `Batas maksimal ${props.maxImages} foto sudah tercapai. Hapus salah satu foto terlebih dahulu.`
    if (event.target) event.target.value = ''
    return
  }

  // Ambil hanya sejumlah slot yang tersedia
  const filesToProcess = files.slice(0, availableSlots)
  if (files.length > availableSlots) {
    errorMessage.value = `Hanya ${availableSlots} foto pertama yang diproses karena batas maksimal ${props.maxImages} foto.`
  }

  // Validasi tipe dan ukuran berkas
  for (const file of filesToProcess) {
    if (!file.type.startsWith('image/')) {
      errorMessage.value = `Berkas "${file.name}" bukan gambar yang valid (JPG, PNG, WebP).`
      if (event.target) event.target.value = ''
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      errorMessage.value = `Berkas "${file.name}" melebihi batas ukuran 10MB.`
      if (event.target) event.target.value = ''
      return
    }
  }

  // Simpan ke antrean pemotongan
  cropQueue.value = [...filesToProcess]
  processNextInQueue()

  if (event.target) event.target.value = ''
}

function processNextInQueue() {
  if (cropQueue.value.length > 0) {
    activeCropFile.value = cropQueue.value.shift()
    isCropperOpen.value = true
  } else {
    activeCropFile.value = null
    isCropperOpen.value = false
  }
}

function handleCropperClose() {
  // Batalkan seluruh antrean sisa jika ditutup
  cropQueue.value = []
  activeCropFile.value = null
  isCropperOpen.value = false
}

async function handleCropped(croppedFile) {
  isUploading.value = true
  errorMessage.value = ''

  try {
    const fileExt = croppedFile.name.split('.').pop() || 'jpg'
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`
    const filePath = `${props.folder}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from(props.bucket)
      .upload(filePath, croppedFile, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) throw uploadError

    const { data: urlData } = supabase.storage
      .from(props.bucket)
      .getPublicUrl(filePath)

    const currentImages = Array.isArray(props.modelValue) ? [...props.modelValue] : []
    emit('update:modelValue', [...currentImages, urlData.publicUrl])
  } catch (err) {
    console.error('[MultiImageUploader] Upload error:', err)
    errorMessage.value = err.message || 'Gagal mengunggah foto. Pastikan sesi login aktif.'
    emit('error', errorMessage.value)
  } finally {
    isUploading.value = false
    // Lanjutkan ke foto berikutnya jika ada di antrean
    processNextInQueue()
  }
}

function moveImage(fromIndex, toIndex) {
  const current = Array.isArray(props.modelValue) ? [...props.modelValue] : []
  if (toIndex < 0 || toIndex >= current.length) return
  const item = current.splice(fromIndex, 1)[0]
  current.splice(toIndex, 0, item)
  emit('update:modelValue', current)
}

function removeImage(index) {
  const current = Array.isArray(props.modelValue) ? [...props.modelValue] : []
  current.splice(index, 1)
  emit('update:modelValue', current)
  errorMessage.value = ''
}
</script>

<template>
  <div class="space-y-3">
    <!-- Header Label & Counter -->
    <div class="flex items-center justify-between">
      <label class="block text-xs font-semibold text-ink-muted uppercase tracking-wider">
        {{ label }}
      </label>
      <div class="flex items-center gap-2">
        <span v-if="aspectRatio" class="text-[10px] font-mono text-ink-muted/80 bg-surface-raised px-2 py-0.5 rounded border border-border/50">
          Rasio: {{ aspectRatio }}
        </span>
        <span
          class="text-xs font-mono px-2 py-0.5 rounded-full border"
          :class="
            (modelValue?.length || 0) >= maxImages
              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              : 'bg-surface-raised text-accent border-border/60'
          "
        >
          {{ modelValue?.length || 0 }} / {{ maxImages }} Foto
        </span>
      </div>
    </div>

    <!-- Error message alert -->
    <div
      v-if="errorMessage"
      class="p-2.5 rounded-lg bg-red-950/40 border border-red-800 text-red-200 text-xs flex items-center gap-2"
    >
      <AlertCircle class="w-4 h-4 text-red-400 shrink-0" />
      <span>{{ errorMessage }}</span>
    </div>

    <!-- Hidden native file input -->
    <input
      ref="fileInputRef"
      type="file"
      accept="image/*"
      multiple
      class="hidden"
      @change="handleFileChange"
    />

    <!-- Uploaded Photos Grid -->
    <div
      v-if="modelValue && modelValue.length > 0"
      class="grid grid-cols-2 sm:grid-cols-4 gap-3"
    >
      <div
        v-for="(photoUrl, index) in modelValue"
        :key="index"
        class="relative group rounded-xl overflow-hidden border border-border/80 bg-surface-raised aspect-video sm:aspect-square flex items-center justify-center shadow-sm"
      >
        <img
          :src="photoUrl"
          :alt="`Dokumentasi ${index + 1}`"
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        <!-- Overlay Number Badge -->
        <span
          class="absolute bottom-1.5 left-1.5 text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-black/75 text-white backdrop-blur-sm pointer-events-none"
        >
          #{{ index + 1 }}
        </span>

        <!-- Reorder Buttons (Move Left / Move Right) -->
        <div class="absolute bottom-1.5 right-1.5 flex items-center gap-1 z-10">
          <button
            v-if="index > 0"
            type="button"
            class="p-1 rounded bg-black/75 hover:bg-accent text-white hover:text-white transition-colors cursor-pointer shadow-md"
            :title="`Pindah foto #${index + 1} ke posisi #${index}`"
            @click.stop="moveImage(index, index - 1)"
          >
            <ChevronLeft class="w-3.5 h-3.5" />
          </button>
          <button
            v-if="index < modelValue.length - 1"
            type="button"
            class="p-1 rounded bg-black/75 hover:bg-accent text-white hover:text-white transition-colors cursor-pointer shadow-md"
            :title="`Pindah foto #${index + 1} ke posisi #${index + 2}`"
            @click.stop="moveImage(index, index + 1)"
          >
            <ChevronRight class="w-3.5 h-3.5" />
          </button>
        </div>

        <!-- Delete Button -->
        <button
          type="button"
          class="absolute top-1.5 right-1.5 p-1 rounded-full bg-red-950/90 text-red-300 hover:text-white hover:bg-red-600 border border-red-800/60 shadow-md transition-all cursor-pointer opacity-90 group-hover:opacity-100"
          title="Hapus foto ini"
          @click.stop="removeImage(index)"
        >
          <X class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>

    <!-- Upload Action Trigger (Active when slots available) -->
    <div
      v-if="(modelValue?.length || 0) < maxImages"
      class="border-2 border-dashed border-border hover:border-accent/70 rounded-xl p-5 text-center cursor-pointer transition-colors bg-surface-raised/40 hover:bg-surface-raised/80 select-none group"
      @click="triggerFileInput"
    >
      <div class="flex flex-col items-center justify-center space-y-2">
        <div class="w-10 h-10 rounded-full bg-surface-raised flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
          <UploadCloud v-if="!isUploading" class="w-5 h-5" />
          <svg
            v-else
            class="animate-spin h-5 w-5 text-accent"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
          </svg>
        </div>
        <div>
          <p class="text-xs sm:text-sm font-medium text-ink">
            {{ isUploading ? 'Sedang mengunggah...' : 'Pilih Foto (Dapat dipotong & diatur fokusnya)' }}
          </p>
          <p class="text-[11px] text-ink-muted mt-0.5">
            Format PNG, JPG, WebP (Tersisa {{ maxImages - (modelValue?.length || 0) }} slot)
          </p>
        </div>
      </div>
    </div>

    <!-- Info note if full -->
    <div
      v-else
      class="text-[11px] text-ink-muted/80 bg-surface-raised/60 p-2.5 rounded-lg border border-border/50 flex items-center justify-between"
    >
      <span>Batas maksimal {{ maxImages }} foto telah terpenuhi.</span>
      <span class="text-accent font-medium">Hapus foto di atas untuk mengganti</span>
    </div>

    <!-- Interactive Cropper Modal -->
    <ImageCropperModal
      v-if="isCropperOpen && activeCropFile"
      :image-file="activeCropFile"
      :default-aspect-ratio="aspectRatio"
      :title="`Sesuaikan Foto Dokumentasi (${(modelValue?.length || 0) + 1} / ${maxImages})`"
      @close="handleCropperClose"
      @crop="handleCropped"
    />
  </div>
</template>
