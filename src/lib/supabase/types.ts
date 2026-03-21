export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string
          role: 'freelancer' | 'employer'
          name: string | null
          avatar_url: string | null
          bio: string | null
          bio_en: string | null
          skills: string[] | null
          hourly_rate: number | null
          willing_to_travel: boolean | null
          company_name: string | null
          company_logo: string | null
          company_bio: string | null
          website: string | null
          contact_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role: 'freelancer' | 'employer'
          name?: string | null
          avatar_url?: string | null
          bio?: string | null
          bio_en?: string | null
          skills?: string[] | null
          hourly_rate?: number | null
          willing_to_travel?: boolean | null
          company_name?: string | null
          company_logo?: string | null
          company_bio?: string | null
          website?: string | null
          contact_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role?: 'freelancer' | 'employer'
          name?: string | null
          avatar_url?: string | null
          bio?: string | null
          bio_en?: string | null
          skills?: string[] | null
          hourly_rate?: number | null
          willing_to_travel?: boolean | null
          company_name?: string | null
          company_logo?: string | null
          company_bio?: string | null
          website?: string | null
          contact_name?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      portfolio_items: {
        Row: {
          id: string
          profile_id: string
          title: string
          title_en: string | null
          description: string | null
          description_en: string | null
          image_url: string
          created_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          title: string
          title_en?: string | null
          description?: string | null
          description_en?: string | null
          image_url: string
          created_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          title?: string
          title_en?: string | null
          description?: string | null
          description_en?: string | null
          image_url?: string
          created_at?: string
        }
      }
      availability: {
        Row: {
          id: string
          profile_id: string
          date: string
          time_slot: string
          is_available: boolean
        }
        Insert: {
          id?: string
          profile_id: string
          date: string
          time_slot: string
          is_available?: boolean
        }
        Update: {
          id?: string
          profile_id?: string
          date?: string
          time_slot?: string
          is_available?: boolean
        }
      }
      jobs: {
        Row: {
          id: string
          employer_id: string
          title: string
          title_en: string | null
          description: string
          description_en: string | null
          category: string
          budget_min: number
          budget_max: number
          deadline: string | null
          status: 'open' | 'in_progress' | 'completed' | 'cancelled'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          employer_id: string
          title: string
          title_en?: string | null
          description: string
          description_en?: string | null
          category: string
          budget_min: number
          budget_max: number
          deadline?: string | null
          status?: 'open' | 'in_progress' | 'completed' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          employer_id?: string
          title?: string
          title_en?: string | null
          description?: string
          description_en?: string | null
          category?: string
          budget_min?: number
          budget_max?: number
          deadline?: string | null
          status?: 'open' | 'in_progress' | 'completed' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
      }
      applications: {
        Row: {
          id: string
          job_id: string
          freelancer_id: string
          proposal: string
          status: 'pending' | 'accepted' | 'rejected'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          job_id: string
          freelancer_id: string
          proposal: string
          status?: 'pending' | 'accepted' | 'rejected'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          job_id?: string
          freelancer_id?: string
          proposal?: string
          status?: 'pending' | 'accepted' | 'rejected'
          created_at?: string
          updated_at?: string
        }
      }
      conversations: {
        Row: {
          id: string
          participant_1: string
          participant_2: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          participant_1: string
          participant_2: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          participant_1?: string
          participant_2?: string
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          content: string
          attachments: string[] | null
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_id: string
          content: string
          attachments?: string[] | null
          read_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          sender_id?: string
          content?: string
          attachments?: string[] | null
          read_at?: string | null
          created_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          employer_id: string
          freelancer_id: string
          job_id: string | null
          date: string
          time_slot: string
          status: 'pending' | 'confirmed' | 'cancelled'
          created_at: string
        }
        Insert: {
          id?: string
          employer_id: string
          freelancer_id: string
          job_id?: string | null
          date: string
          time_slot: string
          status?: 'pending' | 'confirmed' | 'cancelled'
          created_at?: string
        }
        Update: {
          id?: string
          employer_id?: string
          freelancer_id?: string
          job_id?: string | null
          date?: string
          time_slot?: string
          status?: 'pending' | 'confirmed' | 'cancelled'
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'freelancer' | 'employer'
      job_status: 'open' | 'in_progress' | 'completed' | 'cancelled'
      application_status: 'pending' | 'accepted' | 'rejected'
      booking_status: 'pending' | 'confirmed' | 'cancelled'
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

export type Profile = Tables<'profiles'>
export type PortfolioItem = Tables<'portfolio_items'>
export type Availability = Tables<'availability'>
export type Job = Tables<'jobs'> & { profiles?: Profile | null }
export type Application = Tables<'applications'>
export type Conversation = Tables<'conversations'>
export type Message = Tables<'messages'>
export type Booking = Tables<'bookings'>
