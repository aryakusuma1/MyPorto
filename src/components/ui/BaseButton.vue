<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (v) => ['primary', 'secondary', 'ghost'].includes(v),
  },
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['sm', 'md', 'lg'].includes(v),
  },
  type: {
    type: String,
    default: 'button',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['click'])

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'secondary':
      return 'bg-surface-raised hover:bg-surface-alt text-ink border border-border hover:border-accent'
    case 'ghost':
      return 'bg-transparent hover:bg-surface-raised text-ink-muted hover:text-ink border border-transparent'
    case 'primary':
    default:
      return 'bg-accent hover:bg-accent-light text-ink font-medium border border-transparent'
  }
})

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'px-3 py-1.5 text-xs rounded-md'
    case 'lg':
      return 'px-6 py-3 text-base rounded-lg'
    case 'md':
    default:
      return 'px-4 py-2 text-sm rounded-md'
  }
})

function handleClick(event) {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="[
      'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent/50 disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer',
      variantClasses,
      sizeClasses,
    ]"
    @click="handleClick"
  >
    <svg
      v-if="loading"
      class="animate-spin h-4 w-4 text-current"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      ></circle>
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v8H4z"
      ></path>
    </svg>
    <slot />
  </button>
</template>
