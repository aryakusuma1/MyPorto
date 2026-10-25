<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Check,
  Move,
  Maximize2,
  Crop,
} from 'lucide-vue-next'
import BaseButton from '../ui/BaseButton.vue'

const props = defineProps({
  imageFile: {
    type: [File, Blob],
    required: true,
  },
  defaultAspectRatio: {
    type: String,
    default: '16:9', // '16:9', '4:3', '3:4', '1:1', 'free'
  },
  title: {
    type: String,
    default: 'Sesuaikan Letak & Potong Foto',
  },
})

const emit = defineEmits(['close', 'crop'])

// Image preview state
const imageSrc = ref('')
const naturalWidth = ref(0)
const naturalHeight = ref(0)
const isLoaded = ref(false)

// Interactive crop state
const selectedRatio = ref(props.defaultAspectRatio || '16:9')
const zoom = ref(1) // 1.0 s/d 3.0
const panX = ref(0)
const panY = ref(0)

const isDragging = ref(false)
const dragStart = { x: 0, y: 0 }
const initialPan = { x: 0, y: 0 }

const cropBoxRef = ref(null)
const imgElementRef = ref(null)

// Ratio presets list
const ratioPresets = [
  { id: '16:9', label: '16:9 (Proyek & Linimasa)', ratio: 16 / 9 },
  { id: '4:3', label: '4:3 (Sertifikat)', ratio: 4 / 3 },
  { id: '3:4', label: '3:4 (Tentang Saya)', ratio: 3 / 4 },
  { id: '1:1', label: '1:1 (Hero & Profil)', ratio: 1 / 1 },
  { id: 'free', label: 'Bebas / Asli', ratio: null },
]

// Hitung aspect ratio angka
const numericRatio = computed(() => {
  if (selectedRatio.value === 'free') {
    if (naturalWidth.value && naturalHeight.value) {
      return naturalWidth.value / naturalHeight.value
    }
    return 16 / 9
  }
  const found = ratioPresets.find((p) => p.id === selectedRatio.value)
  return found?.ratio || 16 / 9
})

// Hitung style framing box (maksimal lebar 500px, tinggi menyesuaikan)
const cropBoxStyle = computed(() => {
  const r = numericRatio.value
  // Batas maksimal container di modal
  const maxW = 520
  const maxH = 340

  let w = maxW
  let h = w / r

  if (h > maxH) {
    h = maxH
    w = h * r
  }

  return {
    width: `${Math.round(w)}px`,
    height: `${Math.round(h)}px`,
  }
})

// Load image file ke Object URL
watch(
  () => props.imageFile,
  (file) => {
    if (file) {
      if (imageSrc.value) URL.revokeObjectURL(imageSrc.value)
      imageSrc.value = URL.createObjectURL(file)
      isLoaded.value = false
      resetTransform()
    }
  },
  { immediate: true }
)

function onImageLoaded(e) {
  const img = e.target
  naturalWidth.value = img.naturalWidth
  naturalHeight.value = img.naturalHeight
  isLoaded.value = true
  resetTransform()
}

function resetTransform() {
  zoom.value = 1
  panX.value = 0
  panY.value = 0
}

function setRatio(ratioId) {
  selectedRatio.value = ratioId
  resetTransform()
}

// Mouse & Touch Dragging Handlers
function onPointerDown(e) {
  isDragging.value = true
  const clientX = e.touches ? e.touches[0].clientX : e.clientX
  const clientY = e.touches ? e.touches[0].clientY : e.clientY
  dragStart.x = clientX
  dragStart.y = clientY
  initialPan.x = panX.value
  initialPan.y = panY.value
}

function onPointerMove(e) {
  if (!isDragging.value) return
  const clientX = e.touches ? e.touches[0].clientX : e.clientX
  const clientY = e.touches ? e.touches[0].clientY : e.clientY

  const dx = clientX - dragStart.x
  const dy = clientY - dragStart.y

  panX.value = initialPan.x + dx
  panY.value = initialPan.y + dy
}

function onPointerUp() {
  isDragging.value = false
}

// Zoom with Mouse Wheel
function onWheel(e) {
  e.preventDefault()
  const delta = e.deltaY > 0 ? -0.1 : 0.1
  const newZoom = Math.min(Math.max(1, zoom.value + delta), 3)
  zoom.value = Math.round(newZoom * 10) / 10
}

// Zoom buttons
function zoomIn() {
  zoom.value = Math.min(3, Math.round((zoom.value + 0.15) * 100) / 100)
}

function zoomOut() {
  zoom.value = Math.max(1, Math.round((zoom.value - 0.15) * 100) / 100)
}

// Canvas-based precise export
const isProcessing = ref(false)

async function applyCrop() {
  if (!cropBoxRef.value || !imgElementRef.value) return
  isProcessing.value = true

  try {
    const boxRect = cropBoxRef.value.getBoundingClientRect()
    const imgRect = imgElementRef.value.getBoundingClientRect()

    // Tentukan resolusi output canvas kualitas tinggi
    const targetW = Math.min(1920, Math.max(800, Math.round(boxRect.width * 2.5)))
    const targetH = Math.round(targetW / numericRatio.value)

    const canvas = document.createElement('canvas')
    canvas.width = targetW
    canvas.height = targetH
    const ctx = canvas.getContext('2d')

    if (!ctx) throw new Error('Canvas context tidak didukung')

    // Smoothing & high quality image rendering
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'

    // Rasio transformasi antara ukuran gambar di layar dan ukuran asli
    const scaleToTarget = targetW / boxRect.width

    // Titik pusat box di canvas
    const cx = targetW / 2
    const cy = targetH / 2

    // Offset transformasi
    ctx.translate(cx + panX.value * scaleToTarget, cy + panY.value * scaleToTarget)

    // Base rendered width & height of the image element (sebelum zoom)
    const baseDispW = (imgRect.width / zoom.value) * scaleToTarget
    const baseDispH = (imgRect.height / zoom.value) * scaleToTarget

    ctx.scale(zoom.value, zoom.value)

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = imageSrc.value

    await new Promise((resolve, reject) => {
      if (img.complete) return resolve()
      img.onload = resolve
      img.onerror = reject
    })

    ctx.drawImage(img, -baseDispW / 2, -baseDispH / 2, baseDispW, baseDispH)

    // Konversi canvas ke Blob
    const mimeType = 'image/jpeg'
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          isProcessing.value = false
          return
        }
        // Buat file baru dengan nama asli
        const fileName = (props.imageFile.name || 'cropped-image.jpg').replace(/\.[^/.]+$/, '.jpg')
        const croppedFile = new File([blob], fileName, { type: mimeType })
        emit('crop', croppedFile)
        isProcessing.value = false
      },
      mimeType,
      0.92
    )
  } catch (err) {
    console.error('[ImageCropper] Error saat memotong foto:', err)
    isProcessing.value = false
  }
}

onMounted(() => {
  window.addEventListener('mouseup', onPointerUp)
  window.addEventListener('touchend', onPointerUp)
})

onUnmounted(() => {
  window.removeEventListener('mouseup', onPointerUp)
  window.removeEventListener('touchend', onPointerUp)
  if (imageSrc.value) URL.revokeObjectURL(imageSrc.value)
})
</script>

<template>
  <div class="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md select-none overflow-y-auto">
    <div
      class="w-full max-w-2xl bg-surface-alt border border-border rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh] animate-fade-in"
    >
      <!-- Modal Header -->
      <div class="flex items-center justify-between px-5 py-3.5 border-b border-border/80 bg-surface-raised/50 shrink-0">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg bg-surface-raised border border-border flex items-center justify-center text-accent">
            <Crop class="w-4 h-4" />
          </div>
          <div>
            <h3 class="font-heading font-bold text-ink text-sm sm:text-base">
              {{ title }}
            </h3>
            <p class="text-[11px] text-ink-muted">
              Geser dan sesuaikan bagian foto yang ingin ditampilkan
            </p>
          </div>
        </div>
        <button
          type="button"
          class="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-surface-raised transition-colors cursor-pointer"
          @click="emit('close')"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Modal Body (Crop Viewport) -->
      <div class="p-4 sm:p-6 flex-1 flex flex-col items-center justify-center space-y-4 overflow-y-auto bg-canvas/60">
        <!-- Aspect Ratio Selector Pills -->
        <div class="flex flex-wrap items-center justify-center gap-1.5 w-full">
          <button
            v-for="preset in ratioPresets"
            :key="preset.id"
            type="button"
            class="px-2.5 sm:px-3 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer flex items-center gap-1"
            :class="
              selectedRatio === preset.id
                ? 'bg-accent/15 border-accent text-accent font-semibold shadow-sm'
                : 'bg-surface-raised/70 border-border/70 text-ink-muted hover:text-ink hover:bg-surface-raised'
            "
            @click="setRatio(preset.id)"
          >
            <span>{{ preset.label }}</span>
          </button>
        </div>

        <!-- The Crop Framing Stage -->
        <div class="relative w-full flex items-center justify-center py-2 min-h-[260px] sm:min-h-[300px]">
          <!-- Framing Viewport Box -->
          <div
            ref="cropBoxRef"
            :style="cropBoxStyle"
            class="relative overflow-hidden rounded-xl border-2 border-accent/80 shadow-[0_0_30px_rgba(0,0,0,0.8)] cursor-grab active:cursor-grabbing bg-black/90 flex items-center justify-center group"
            @mousedown="onPointerDown"
            @touchstart="onPointerDown"
            @mousemove="onPointerMove"
            @touchmove="onPointerMove"
            @wheel="onWheel"
          >
            <!-- Image with Pan and Zoom Transform -->
            <img
              v-if="imageSrc"
              ref="imgElementRef"
              :src="imageSrc"
              alt="Gambar Editor"
              class="max-w-none pointer-events-none transition-transform duration-75 select-none"
              :style="{
                transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
                maxHeight: '100%',
                maxWidth: '100%',
                objectFit: 'contain',
              }"
              @load="onImageLoaded"
            />

            <!-- Visual Crosshair / Rule of Thirds Grid Overlay -->
            <div class="absolute inset-0 pointer-events-none border border-accent/30 grid grid-cols-3 grid-rows-3 opacity-40 group-hover:opacity-75 transition-opacity">
              <div class="border-r border-b border-accent/20"></div>
              <div class="border-r border-b border-accent/20"></div>
              <div class="border-b border-accent/20"></div>
              <div class="border-r border-b border-accent/20"></div>
              <div class="border-r border-b border-accent/20"></div>
              <div class="border-b border-accent/20"></div>
              <div class="border-r border-accent/20"></div>
              <div class="border-r border-accent/20"></div>
              <div></div>
            </div>

            <!-- Hint overlay text on top left -->
            <div class="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/60 text-[10px] text-white/80 font-mono backdrop-blur-sm pointer-events-none flex items-center gap-1">
              <Move class="w-3 h-3 text-accent" />
              <span>Geser untuk atur posisi</span>
            </div>
          </div>
        </div>

        <!-- Zoom Controls Bar -->
        <div class="flex items-center gap-3 w-full max-w-sm px-2">
          <button
            type="button"
            class="p-1.5 rounded-lg bg-surface-raised border border-border text-ink-muted hover:text-ink hover:border-accent transition-colors cursor-pointer"
            title="Perkecil"
            @click="zoomOut"
          >
            <ZoomOut class="w-4 h-4" />
          </button>

          <input
            v-model.number="zoom"
            type="range"
            min="1"
            max="3"
            step="0.05"
            class="flex-1 accent-accent cursor-pointer h-1.5 bg-surface-raised rounded-lg"
          />

          <button
            type="button"
            class="p-1.5 rounded-lg bg-surface-raised border border-border text-ink-muted hover:text-ink hover:border-accent transition-colors cursor-pointer"
            title="Perbesar"
            @click="zoomIn"
          >
            <ZoomIn class="w-4 h-4" />
          </button>

          <span class="text-xs font-mono text-ink-muted w-10 text-right">
            {{ Math.round(zoom * 100) }}%
          </span>

          <button
            type="button"
            class="p-1.5 rounded-lg bg-surface-raised border border-border text-ink-muted hover:text-accent hover:border-accent transition-colors cursor-pointer"
            title="Kembalikan Posisi Semula"
            @click="resetTransform"
          >
            <RotateCcw class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="flex items-center justify-between px-5 py-3.5 border-t border-border/80 bg-surface-raised/50 shrink-0">
        <BaseButton variant="ghost" @click="emit('close')" :disabled="isProcessing">
          Batal
        </BaseButton>

        <BaseButton
          variant="primary"
          @click="applyCrop"
          :loading="isProcessing"
          class="shadow-md"
        >
          <Check class="w-4 h-4 mr-1.5" />
          Terapkan & Unggah
        </BaseButton>
      </div>
    </div>
  </div>
</template>
