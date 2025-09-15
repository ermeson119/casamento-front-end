import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      guests: {
        Row: {
          id: string
          name: string
          email: string
          invite_code: string
          max_companions: number
          confirmed: boolean
          companions_count: number
          companion_names: string[]
          dietary_restrictions: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          invite_code: string
          max_companions?: number
          confirmed?: boolean
          companions_count?: number
          companion_names?: string[]
          dietary_restrictions?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          invite_code?: string
          max_companions?: number
          confirmed?: boolean
          companions_count?: number
          companion_names?: string[]
          dietary_restrictions?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      gifts: {
        Row: {
          id: string
          name: string
          description: string
          category: string
          price_range: string
          image_url: string | null
          is_reserved: boolean
          reserved_by: string | null
          reserved_at: string | null
          temp_reserved_by: string | null
          temp_reserved_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          category: string
          price_range: string
          image_url?: string | null
          is_reserved?: boolean
          reserved_by?: string | null
          reserved_at?: string | null
          temp_reserved_by?: string | null
          temp_reserved_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          category?: string
          price_range?: string
          image_url?: string | null
          is_reserved?: boolean
          reserved_by?: string | null
          reserved_at?: string | null
          temp_reserved_by?: string | null
          temp_reserved_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}