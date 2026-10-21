import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '../lib/supabase'

export const useProfileStore = defineStore('profile', () => {
  const profile = ref(null)
  const loading = ref(false)
  const error = ref(null)

  /**
   * Mengambil data profil pemilik portfolio dari Supabase
   */
  async function fetchProfile() {
    loading.value = true
    error.value = null
    try {
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1)
        .maybeSingle()

      if (fetchError) throw fetchError

      profile.value = data
      return data
    } catch (err) {
      console.warn('[ProfileStore] Gagal mengambil data profil dari Supabase:', err.message)
      error.value = err.message
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Memperbarui data profil (Admin)
   * @param {Object} updatedData
   */
  async function updateProfile(updatedData) {
    loading.value = true
    error.value = null
    try {
      const { data, error: updateError } = await supabase
        .from('profiles')
        .upsert(updatedData)
        .select()
        .single()

      if (updateError) throw updateError

      profile.value = data
      return { success: true, data }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  return {
    profile,
    loading,
    error,
    fetchProfile,
    updateProfile,
  }
})
