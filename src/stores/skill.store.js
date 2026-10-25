import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '../lib/supabase'

export const useSkillStore = defineStore('skill', () => {
  const skills = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Default fallback data jika belum ada data di Supabase
  const defaultSkills = [
    { id: '1', name: 'Vue.js 3', category: 'Frontend', level: 90, sort_order: 1 },
    { id: '2', name: 'JavaScript (ES6+)', category: 'Frontend', level: 88, sort_order: 2 },
    { id: '3', name: 'Tailwind CSS', category: 'Frontend', level: 92, sort_order: 3 },
    { id: '4', name: 'HTML5 & CSS3', category: 'Frontend', level: 95, sort_order: 4 },
    { id: '5', name: 'Node.js', category: 'Backend', level: 82, sort_order: 1 },
    { id: '6', name: 'PHP / Laravel', category: 'Backend', level: 80, sort_order: 2 },
    { id: '7', name: 'RESTful API', category: 'Backend', level: 85, sort_order: 3 },
    { id: '8', name: 'PostgreSQL', category: 'Database', level: 84, sort_order: 1 },
    { id: '9', name: 'MySQL / SQL Server', category: 'Database', level: 86, sort_order: 2 },
    { id: '10', name: 'Supabase BaaS', category: 'Database', level: 82, sort_order: 3 },
    { id: '11', name: 'Git & GitHub', category: 'Tools', level: 88, sort_order: 1 },
    { id: '12', name: 'Vite & Build Tools', category: 'Tools', level: 85, sort_order: 2 },
    { id: '13', name: 'VS Code & Clean Code', category: 'Tools', level: 90, sort_order: 3 },
  ]

  /**
   * Mengambil daftar skills dari Supabase
   */
  async function fetchSkills() {
    loading.value = true
    error.value = null
    try {
      const { data, error: fetchError } = await supabase
        .from('skills')
        .select('*')
        .order('sort_order', { ascending: true })

      if (fetchError) throw fetchError

      if (data && data.length > 0) {
        skills.value = data
      } else {
        skills.value = defaultSkills
      }
      return skills.value
    } catch (err) {
      console.warn('[SkillStore] Menggunakan fallback skills:', err.message)
      skills.value = defaultSkills
      error.value = err.message
      return defaultSkills
    } finally {
      loading.value = false
    }
  }

  return {
    skills,
    loading,
    error,
    fetchSkills,
  }
})
