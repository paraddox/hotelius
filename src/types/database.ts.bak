/**
 * Database types for Supabase
 *
 * TODO: Generate these types from your Supabase database schema using:
 * npx supabase gen types typescript --project-id YOUR_PROJECT_ID --schema public > src/types/database.ts
 */

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
      hotels: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          description: string | null
          address: string
          city: string
          country: string
          postal_code: string | null
          phone: string | null
          email: string | null
          star_rating: number | null
          image_url: string | null
          amenities: Json | null
          owner_id: string
          is_active: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          description?: string | null
          address: string
          city: string
          country: string
          postal_code?: string | null
          phone?: string | null
          email?: string | null
          star_rating?: number | null
          image_url?: string | null
          amenities?: Json | null
          owner_id: string
          is_active?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          description?: string | null
          address?: string
          city?: string
          country?: string
          postal_code?: string | null
          phone?: string | null
          email?: string | null
          star_rating?: number | null
          image_url?: string | null
          amenities?: Json | null
          owner_id?: string
          is_active?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "hotels_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      rooms: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          hotel_id: string
          room_number: string
          room_type: string
          description: string | null
          max_occupancy: number
          price_per_night: number
          currency: string
          amenities: Json | null
          image_urls: Json | null
          is_available: boolean
          floor_number: number | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          hotel_id: string
          room_number: string
          room_type: string
          description?: string | null
          max_occupancy: number
          price_per_night: number
          currency?: string
          amenities?: Json | null
          image_urls?: Json | null
          is_available?: boolean
          floor_number?: number | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          hotel_id?: string
          room_number?: string
          room_type?: string
          description?: string | null
          max_occupancy?: number
          price_per_night?: number
          currency?: string
          amenities?: Json | null
          image_urls?: Json | null
          is_available?: boolean
          floor_number?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "rooms_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          }
        ]
      }
      bookings: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          room_id: string
          hotel_id: string
          guest_id: string
          check_in_date: string
          check_out_date: string
          number_of_guests: number
          total_price: number
          currency: string
          status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          special_requests: string | null
          payment_status: 'pending' | 'paid' | 'refunded'
          payment_intent_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          room_id: string
          hotel_id: string
          guest_id: string
          check_in_date: string
          check_out_date: string
          number_of_guests: number
          total_price: number
          currency?: string
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          special_requests?: string | null
          payment_status?: 'pending' | 'paid' | 'refunded'
          payment_intent_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          room_id?: string
          hotel_id?: string
          guest_id?: string
          check_in_date?: string
          check_out_date?: string
          number_of_guests?: number
          total_price?: number
          currency?: string
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          special_requests?: string | null
          payment_status?: 'pending' | 'paid' | 'refunded'
          payment_intent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          email: string
          full_name: string | null
          avatar_url: string | null
          phone: string | null
          role: 'guest' | 'hotel_owner' | 'admin'
          is_verified: boolean
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          role?: 'guest' | 'hotel_owner' | 'admin'
          is_verified?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          role?: 'guest' | 'hotel_owner' | 'admin'
          is_verified?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      reviews: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          hotel_id: string
          booking_id: string
          guest_id: string
          rating: number
          title: string | null
          comment: string | null
          response: string | null
          response_date: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          hotel_id: string
          booking_id: string
          guest_id: string
          rating: number
          title?: string | null
          comment?: string | null
          response?: string | null
          response_date?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          hotel_id?: string
          booking_id?: string
          guest_id?: string
          rating?: number
          title?: string | null
          comment?: string | null
          response?: string | null
          response_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      booking_status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
      payment_status: 'pending' | 'paid' | 'refunded'
      user_role: 'guest' | 'hotel_owner' | 'admin'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database['public']['Tables'] & Database['public']['Views'])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
        Database[PublicTableNameOrOptions['schema']]['Views'])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
      Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database['public']['Tables'] &
      Database['public']['Views'])
  ? (Database['public']['Tables'] &
      Database['public']['Views'])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database['public']['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database['public']['Tables']
  ? Database['public']['Tables'][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database['public']['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database['public']['Tables']
  ? Database['public']['Tables'][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database['public']['Enums']
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
  : PublicEnumNameOrOptions extends keyof Database['public']['Enums']
  ? Database['public']['Enums'][PublicEnumNameOrOptions]
  : never
