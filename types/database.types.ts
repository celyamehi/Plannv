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
          email: string
          full_name: string | null
          phone: string | null
          avatar_url: string | null
          user_type: 'client' | 'professional' | 'admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          user_type?: 'client' | 'professional' | 'admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          user_type?: 'client' | 'professional' | 'admin'
          created_at?: string
          updated_at?: string
        }
      }
      establishments: {
        Row: {
          id: string
          owner_id: string
          name: string
          slug: string
          description: string | null
          category: string
          address: string
          city: string
          postal_code: string
          country: string
          latitude: number | null
          longitude: number | null
          phone: string | null
          email: string | null
          website: string | null
          logo_url: string | null
          cover_image_url: string | null
          images: string[] | null
          opening_hours: Json | null
          is_active: boolean
          accepts_online_booking: boolean
          requires_prepayment: boolean
          prepayment_percentage: number
          cancellation_policy: string | null
          average_rating: number
          total_reviews: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          name: string
          slug: string
          description?: string | null
          category: string
          address: string
          city: string
          postal_code: string
          country?: string
          latitude?: number | null
          longitude?: number | null
          phone?: string | null
          email?: string | null
          website?: string | null
          logo_url?: string | null
          cover_image_url?: string | null
          images?: string[] | null
          opening_hours?: Json | null
          is_active?: boolean
          accepts_online_booking?: boolean
          requires_prepayment?: boolean
          prepayment_percentage?: number
          cancellation_policy?: string | null
          average_rating?: number
          total_reviews?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          name?: string
          slug?: string
          description?: string | null
          category?: string
          address?: string
          city?: string
          postal_code?: string
          country?: string
          latitude?: number | null
          longitude?: number | null
          phone?: string | null
          email?: string | null
          website?: string | null
          logo_url?: string | null
          cover_image_url?: string | null
          images?: string[] | null
          opening_hours?: Json | null
          is_active?: boolean
          accepts_online_booking?: boolean
          requires_prepayment?: boolean
          prepayment_percentage?: number
          cancellation_policy?: string | null
          average_rating?: number
          total_reviews?: number
          created_at?: string
          updated_at?: string
        }
      }
      staff_members: {
        Row: {
          id: string
          establishment_id: string
          profile_id: string | null
          first_name: string
          last_name: string
          email: string | null
          phone: string | null
          avatar_url: string | null
          title: string | null
          bio: string | null
          specialties: string[] | null
          is_active: boolean
          can_book_online: boolean
          custom_hours: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          establishment_id: string
          profile_id?: string | null
          first_name: string
          last_name: string
          email?: string | null
          phone?: string | null
          avatar_url?: string | null
          title?: string | null
          bio?: string | null
          specialties?: string[] | null
          is_active?: boolean
          can_book_online?: boolean
          custom_hours?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          establishment_id?: string
          profile_id?: string | null
          first_name?: string
          last_name?: string
          email?: string | null
          phone?: string | null
          avatar_url?: string | null
          title?: string | null
          bio?: string | null
          specialties?: string[] | null
          is_active?: boolean
          can_book_online?: boolean
          custom_hours?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      services: {
        Row: {
          id: string
          establishment_id: string
          name: string
          description: string | null
          category: string | null
          duration: number
          price: number
          is_active: boolean
          online_booking_enabled: boolean
          available_staff_ids: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          establishment_id: string
          name: string
          description?: string | null
          category?: string | null
          duration: number
          price: number
          is_active?: boolean
          online_booking_enabled?: boolean
          available_staff_ids?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          establishment_id?: string
          name?: string
          description?: string | null
          category?: string | null
          duration?: number
          price?: number
          is_active?: boolean
          online_booking_enabled?: boolean
          available_staff_ids?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      appointments: {
        Row: {
          id: string
          establishment_id: string
          client_id: string
          staff_member_id: string
          service_id: string
          appointment_date: string
          start_time: string
          end_time: string
          status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'
          client_notes: string | null
          staff_notes: string | null
          total_price: number
          prepayment_amount: number
          prepayment_status: 'none' | 'pending' | 'paid' | 'refunded'
          payment_intent_id: string | null
          reminder_sent: boolean
          reminder_sent_at: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          cancellation_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          establishment_id: string
          client_id: string
          staff_member_id: string
          service_id: string
          appointment_date: string
          start_time: string
          end_time: string
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'
          client_notes?: string | null
          staff_notes?: string | null
          total_price: number
          prepayment_amount?: number
          prepayment_status?: 'none' | 'pending' | 'paid' | 'refunded'
          payment_intent_id?: string | null
          reminder_sent?: boolean
          reminder_sent_at?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          cancellation_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          establishment_id?: string
          client_id?: string
          staff_member_id?: string
          service_id?: string
          appointment_date?: string
          start_time?: string
          end_time?: string
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'
          client_notes?: string | null
          staff_notes?: string | null
          total_price?: number
          prepayment_amount?: number
          prepayment_status?: 'none' | 'pending' | 'paid' | 'refunded'
          payment_intent_id?: string | null
          reminder_sent?: boolean
          reminder_sent_at?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          cancellation_reason?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          establishment_id: string
          client_id: string
          appointment_id: string | null
          rating: number
          comment: string | null
          is_verified: boolean
          is_moderated: boolean
          is_visible: boolean
          response: string | null
          response_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          establishment_id: string
          client_id: string
          appointment_id?: string | null
          rating: number
          comment?: string | null
          is_verified?: boolean
          is_moderated?: boolean
          is_visible?: boolean
          response?: string | null
          response_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          establishment_id?: string
          client_id?: string
          appointment_id?: string | null
          rating?: number
          comment?: string | null
          is_verified?: boolean
          is_moderated?: boolean
          is_visible?: boolean
          response?: string | null
          response_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      search_establishments_nearby: {
        Args: {
          p_latitude: number
          p_longitude: number
          p_radius_km?: number
          p_category?: string
          p_limit?: number
        }
        Returns: {
          id: string
          name: string
          category: string
          address: string
          city: string
          average_rating: number
          total_reviews: number
          distance_km: number
        }[]
      }
      get_available_slots: {
        Args: {
          p_staff_member_id: string
          p_date: string
          p_service_duration: number
        }
        Returns: {
          start_time: string
          end_time: string
        }[]
      }
    }
    Enums: {
      user_type: 'client' | 'professional' | 'admin'
      appointment_status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'
      prepayment_status: 'none' | 'pending' | 'paid' | 'refunded'
    }
  }
}
