import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn(
    '[Supabase] Variabel VITE_SUPABASE_URL atau VITE_SUPABASE_ANON_KEY belum dikonfigurasi di file .env'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
