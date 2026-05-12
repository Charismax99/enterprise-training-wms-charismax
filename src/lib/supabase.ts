/**
 * Supabase Client Configuration
 * T-WMS (Training Workflow Management System)
 */

import { createClient, RealtimeChannel, Session, SupabaseClient } from '@supabase/supabase-js'

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

const isConfigured = Boolean(supabaseUrl && supabaseAnonKey)

// Create a no-op proxy so callers don't crash when credentials are absent
const noopClient = new Proxy({} as SupabaseClient, {
  get: () => noopClient,
  apply: () => Promise.resolve({ data: null, error: new Error('Supabase is not configured') }),
})

// Create Supabase client only when credentials are available
export const supabase: SupabaseClient = isConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: window.localStorage,
      },
      db: { schema: 'public' },
      global: { headers: { 'x-application-name': 't-wms' } },
    })
  : noopClient

export { isConfigured as isSupabaseConfigured }

/**
 * Get current authenticated user
 */
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

/**
 * Get current user profile with role
 */
export const getCurrentProfile = async () => {
  const user = await getCurrentUser()
  if (!user) return null

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) throw error
  return profile
}

/**
 * Sign in with email and password
 */
export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (error) throw error
  return data
}

/**
 * Sign up new user
 */
export const signUp = async (
  email: string,
  password: string,
  userData: {
    full_name: string
    role?: string
  }
) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData,
    },
  })
  if (error) throw error
  return data
}

/**
 * Sign out current user
 */
export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

/**
 * Subscribe to auth state changes
 */
export const onAuthStateChange = (
  callback: (event: string, session: Session | null) => void
) => {
  return supabase.auth.onAuthStateChange(callback)
}

/**
 * Upload file to Supabase Storage
 */
export const uploadFile = async (
  bucket: string,
  path: string,
  file: File
) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) throw error
  return data
}

/**
 * Get public URL for uploaded file
 */
export const getPublicUrl = (bucket: string, path: string) => {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

/**
 * Delete file from storage
 */
export const deleteFile = async (bucket: string, path: string) => {
  const { error } = await supabase.storage.from(bucket).remove([path])
  if (error) throw error
}

/**
 * Subscribe to real-time changes on a table
 */
export const subscribeToTable = (
  table: string,
  callback: Parameters<ReturnType<SupabaseClient['channel']>['on']>[2],
  filter?: string
) => {
  const channel = supabase
    .channel(`${table}-changes`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table,
        filter,
      },
      callback
    )
    .subscribe()

  return channel
}

/**
 * Unsubscribe from a real-time channel
 */
export const unsubscribe = async (channel: RealtimeChannel) => {
  await supabase.removeChannel(channel)
}

export default supabase
