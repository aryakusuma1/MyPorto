import { ref, onMounted, onUnmounted } from 'vue'

/**
 * Composable untuk mendeteksi section aktif di viewport saat scroll
 * @param {Array<string>} sectionIds - Daftar ID section yang akan diamati
 * @param {string} defaultSection - ID section aktif awal
 */
export function useScrollSpy(
  sectionIds = ['hero', 'about', 'skills', 'projects', 'experience', 'certificates', 'contact'],
  defaultSection = 'hero'
) {
  const activeSection = ref(defaultSection)
  let observer = null

  function initObserver() {
    const options = {
      root: null,
      rootMargin: '-25% 0px -65% 0px',
      threshold: 0,
    }

    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          activeSection.value = entry.target.id
        }
      })
    }, options)

    sectionIds.forEach((id) => {
      const el = document.getElementById(id)
      if (el) {
        observer.observe(el)
      }
    })
  }

  onMounted(() => {
    // Beri sedikit jeda agar DOM semua section selesai di-render
    setTimeout(initObserver, 100)
  })

  onUnmounted(() => {
    if (observer) {
      observer.disconnect()
    }
  })

  return {
    activeSection,
  }
}
