import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'

export const useAuthStore = defineStore('auth', () => {
  const session = ref(null)
  const user = ref(null)
  const loading = ref(true)
  const error = ref(null)

  const isAuthenticated = computed(() => !!session.value)

  /**
   * Inisialisasi status autentikasi dari Supabase session
   */
  async function initAuth() {
    loading.value = true
    try {
      const { data, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) throw sessionError

      session.value = data.session
      user.value = data.session?.user ?? null

      // Dengarkan perubahan state auth (login, logout, refresh token)
      supabase.auth.onAuthStateChange((_event, currentSession) => {
        session.value = currentSession
        user.value = currentSession?.user ?? null
      })
    } catch (err) {
      console.error('[AuthStore] Gagal inisialisasi autentikasi:', err)
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  /**
   * Login Admin dengan email dan password
   * @param {string} email
   * @param {string} password
   */
  async function signIn(email, password) {
    loading.value = true
    error.value = null
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (signInError) throw signInError

      session.value = data.session
      user.value = data.user
      return { success: true }
    } catch (err) {
      error.value = err.message || 'Gagal masuk. Periksa email dan password Anda.'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * Logout Admin
   */
  async function signOut() {
    loading.value = true
    error.value = null
    try {
      const { error: signOutError } = await supabase.auth.signOut()
      if (signOutError) throw signOutError

      session.value = null
      user.value = null
      return { success: true }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  return {
    session,
    user,
    loading,
    error,
    isAuthenticated,
    initAuth,
    signIn,
    signOut,
  }
})
