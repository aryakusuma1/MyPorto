import { ref, onUnmounted } from 'vue'

/**
 * Composable untuk mendeteksi kapan suatu elemen masuk ke dalam viewport
 * untuk memicu animasi masuk (fade-in / slide-in) sekali saja.
 * @param {Object} options - Opsi IntersectionObserver (threshold, rootMargin)
 */
export function useIntersection(options = { threshold: 0.15, rootMargin: '0px' }) {
  const isVisible = ref(false)
  let observer = null

  function observe(elementRef) {
    if (!elementRef) return

    const targetEl = elementRef.$el || elementRef

    if (!targetEl || !(targetEl instanceof Element)) return

    observer = new IntersectionObserver(([entry]) => {
      if (entry && entry.isIntersecting) {
        isVisible.value = true
        observer.unobserve(targetEl) // Hanya trigger sekali
      }
    }, options)

    observer.observe(targetEl)
  }

  onUnmounted(() => {
    if (observer) {
      observer.disconnect()
    }
  })

  return {
    isVisible,
    observe,
  }
}
