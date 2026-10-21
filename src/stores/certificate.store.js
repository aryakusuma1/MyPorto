import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '../lib/supabase'

export const useCertificateStore = defineStore('certificate', () => {
  const certificates = ref([])
  const currentCertificate = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const defaultCertificates = [
    {
      id: 'c-1',
      title: 'Pengembangan Web Frontend dengan Vue.js',
      issuer: 'Dicoding Indonesia / Platform Pelatihan',
      issue_date: '2025-02-15',
      expiry_date: null,
      credential_url: 'https://example.com/certificate/c-1',
      image_url: null,
      category: 'Frontend Development',
      description: 'Menyelesaikan kurikulum intensif pembuatan aplikasi Single Page Application dengan Vue.js dan state management.',
      sort_order: 1,
    },
    {
      id: 'c-2',
      title: 'Perancangan & Optimasi Basis Data SQL',
      issuer: 'Badan Sertifikasi / Tech Academy',
      issue_date: '2024-11-20',
      expiry_date: null,
      credential_url: 'https://example.com/certificate/c-2',
      image_url: null,
      category: 'Database & Backend',
      description: 'Penguasaan normalisasi basis data, penulisan query kompleks, indexing, dan prinsip integritas ACID.',
      sort_order: 2,
    },
    {
      id: 'c-3',
      title: 'Cloud Infrastructure & API Integration',
      issuer: 'Google Cloud Platform / Cloud Training',
      issue_date: '2024-08-10',
      expiry_date: null,
      credential_url: 'https://example.com/certificate/c-3',
      image_url: null,
      category: 'Cloud & DevOps',
      description: 'Memahami dasar komputasi awan, deployment aplikasi web, dan integrasi backend as a service.',
      sort_order: 3,
    },
  ]

  /**
   * Mengambil seluruh sertifikat
   */
  async function fetchCertificates() {
    loading.value = true
    error.value = null
    try {
      const { data, error: fetchError } = await supabase
        .from('certificates')
        .select('*')
        .order('sort_order')

      if (fetchError) throw fetchError

      if (data && data.length > 0) {
        certificates.value = data
      } else {
        certificates.value = defaultCertificates
      }
      return certificates.value
    } catch (err) {
      console.warn('[CertificateStore] Menggunakan fallback certificates:', err.message)
      certificates.value = defaultCertificates
      error.value = err.message
      return defaultCertificates
    } finally {
      loading.value = false
    }
  }

  /**
   * Mengambil detail sertifikat berdasarkan id
   * @param {string} id
   */
  async function fetchCertificateById(id) {
    loading.value = true
    error.value = null
    try {
      const { data, error: fetchError } = await supabase
        .from('certificates')
        .select('*')
        .eq('id', id)
        .maybeSingle()

      if (fetchError) throw fetchError

      if (data) {
        currentCertificate.value = data
      } else {
        const fallback = defaultCertificates.find((c) => c.id === id)
        currentCertificate.value = fallback || null
      }
      return currentCertificate.value
    } catch (err) {
      console.warn('[CertificateStore] Gagal mengambil sertifikat:', err.message)
      error.value = err.message
      return null
    } finally {
      loading.value = false
    }
  }

  return {
    certificates,
    currentCertificate,
    loading,
    error,
    fetchCertificates,
    fetchCertificateById,
  }
})
