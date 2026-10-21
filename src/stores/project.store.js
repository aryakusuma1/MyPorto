import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '../lib/supabase'

export const useProjectStore = defineStore('project', () => {
  const projects = ref([])
  const currentProject = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Fallback data proyek awal jika belum diisi di database
  const defaultProjects = [
    {
      id: 'p-1',
      title: 'Web Portfolio Personal',
      slug: 'web-portfolio-personal',
      short_desc:
        'Aplikasi web portfolio personal dengan arsitektur modern Vue 3, Tailwind CSS, dan Supabase BaaS yang dibangun berbasis spesifikasi SDD.',
      cover_url: null,
      tech_stack: ['Vue 3', 'Vite', 'Tailwind CSS', 'Supabase', 'Pinia'],
      category: 'Frontend & Fullstack',
      status: 'completed',
      featured: true,
      github_url: 'https://github.com/aryakusuma1/MyPorto',
      demo_url: '',
    },
    {
      id: 'p-2',
      title: 'Sistem Manajemen Data & Inventaris',
      slug: 'sistem-manajemen-inventaris',
      short_desc:
        'Platform web untuk pencatatan inventaris, pelacakan stok otomatis, dan pembuatan laporan terintegrasi dengan otentikasi multi-level.',
      cover_url: null,
      tech_stack: ['Vue.js', 'PostgreSQL', 'Node.js', 'Tailwind CSS'],
      category: 'Web App',
      status: 'completed',
      featured: false,
      github_url: 'https://github.com/aryakusuma1',
      demo_url: '',
    },
    {
      id: 'p-3',
      title: 'RESTful API Service & Authentication',
      slug: 'restful-api-service',
      short_desc:
        'Backend layanan REST API dengan arsitektur modular, validasi data ketat, manajemen JWT session, dan dokumentasi OpenAPI/Swagger.',
      cover_url: null,
      tech_stack: ['Node.js', 'Express', 'PostgreSQL', 'JWT'],
      category: 'Backend',
      status: 'completed',
      featured: false,
      github_url: 'https://github.com/aryakusuma1',
      demo_url: '',
    },
  ]

  /**
   * Mengambil seluruh daftar proyek untuk halaman utama
   */
  async function fetchProjects() {
    loading.value = true
    error.value = null
    try {
      const { data, error: fetchError } = await supabase
        .from('projects')
        .select('id,title,slug,short_desc,cover_url,tech_stack,category,status,featured')
        .order('sort_order')

      if (fetchError) throw fetchError

      if (data && data.length > 0) {
        projects.value = data
      } else {
        projects.value = defaultProjects
      }
      return projects.value
    } catch (err) {
      console.warn('[ProjectStore] Menggunakan fallback projects:', err.message)
      projects.value = defaultProjects
      error.value = err.message
      return defaultProjects
    } finally {
      loading.value = false
    }
  }

  /**
   * Mengambil detail lengkap proyek berdasarkan slug
   * @param {string} slug
   */
  async function fetchProjectBySlug(slug) {
    loading.value = true
    error.value = null
    try {
      const { data, error: fetchError } = await supabase
        .from('projects')
        .select('*, project_details(*)')
        .eq('slug', slug)
        .maybeSingle()

      if (fetchError) throw fetchError

      if (data) {
        currentProject.value = data
      } else {
        // Fallback untuk mock item
        const fallback = defaultProjects.find((p) => p.slug === slug)
        if (fallback) {
          currentProject.value = {
            ...fallback,
            project_details: {
              overview: fallback.short_desc,
              architecture: 'Dibangun dengan pendekatan Clean Architecture dan pemisahan concerns yang ketat.',
              challenges: [
                {
                  challenge: 'Menjaga ukuran bundle tetap ringan dan performa rendering optimal.',
                  solution: 'Menerapkan dynamic code splitting dan seleksi dependensi minimalis.',
                },
              ],
              features: [
                { title: 'Navigasi Responsif', description: 'Smooth scroll dengan active scroll spy.' },
                { title: 'Panel Admin Terproteksi', description: 'Autentikasi sesi JWT dan Row Level Security.' },
              ],
              screenshots: [],
            },
          }
        } else {
          currentProject.value = null
        }
      }
      return currentProject.value
    } catch (err) {
      console.warn('[ProjectStore] Gagal mengambil detail proyek:', err.message)
      error.value = err.message
      return null
    } finally {
      loading.value = false
    }
  }

  return {
    projects,
    currentProject,
    loading,
    error,
    fetchProjects,
    fetchProjectBySlug,
  }
})
