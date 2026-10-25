import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '../lib/supabase'

export const useExperienceStore = defineStore('experience', () => {
  const experiences = ref([])
  const loading = ref(false)
  const error = ref(null)

  const defaultExperiences = [
    {
      id: 'e-1',
      company: 'Freelance Software Developer',
      role: 'Full Stack Web Developer',
      type: 'work',
      start_date: '2025-01-01',
      end_date: null,
      description:
        'Merancang dan membangun antarmuka web responsif, integrasi database relasional, dan implementasi REST API untuk berbagai kebutuhan klien.',
      logo_url: null,
      photos: [],
      sort_order: 1,
    },
    {
      id: 'e-2',
      company: 'Universitas / Institut',
      role: 'S1 Teknik Informatika / Ilmu Komputer',
      type: 'education',
      start_date: '2021-09-01',
      end_date: '2025-08-01',
      description:
        'Fokus pada rekayasa perangkat lunak, struktur data & algoritma, perancangan basis data, dan pengembangan aplikasi web & mobile.',
      logo_url: null,
      photos: [],
      sort_order: 2,
    },
  ]

  /**
   * Mengambil data pengalaman kerja dan pendidikan dari Supabase
   * Mengutamakan urutan kustom sort_order (ASC), lalu tanggal mulai terbaru (DESC)
   */
  async function fetchExperiences() {
    loading.value = true
    error.value = null
    try {
      const { data, error: fetchError } = await supabase
        .from('experiences')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('start_date', { ascending: false })

      if (fetchError) throw fetchError

      if (data && data.length > 0) {
        experiences.value = data
      } else {
        experiences.value = defaultExperiences
      }
      return experiences.value
    } catch (err) {
      console.warn('[ExperienceStore] Menggunakan fallback experiences:', err.message)
      experiences.value = defaultExperiences
      error.value = err.message
      return defaultExperiences
    } finally {
      loading.value = false
    }
  }

  /**
   * Memperbarui sort_order untuk urutan tampilan
   */
  async function updateItemOrder(id, newOrder) {
    try {
      const { error: updateError } = await supabase
        .from('experiences')
        .update({ sort_order: newOrder })
        .eq('id', id)

      if (updateError) throw updateError
    } catch (err) {
      console.error('[ExperienceStore] Gagal update sort_order:', err)
      throw err
    }
  }

  return {
    experiences,
    loading,
    error,
    fetchExperiences,
    updateItemOrder,
  }
})
