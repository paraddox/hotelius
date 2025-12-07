/**
 * Database types for Supabase
 *
 * These types match the database schema defined in supabase/migrations/
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Enum types matching the database
export type BookingStatus = 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled' | 'no_show' | 'expired'
export type PaymentStatus = 'pending' | 'authorized' | 'paid' | 'partially_refunded' | 'refunded' | 'failed'
export type SubscriptionStatus = 'trial' | 'active' | 'past_due' | 'canceled' | 'suspended'
export type RoomStatus = 'available' | 'occupied' | 'maintenance' | 'out_of_service'
export type UserRole = 'guest' | 'hotel_owner' | 'hotel_staff' | 'super_admin'

export interface Database {
  public: {
    Tables: {
      hotels: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          slug: string
          email: string
          phone: string | null
          website: string | null
          address_line1: string
          address_line2: string | null
          city: string
          state_province: string | null
          postal_code: string
          country: string
          latitude: number | null
          longitude: number | null
          settings: Json
          subscription_status: SubscriptionStatus
          subscription_started_at: string | null
          subscription_ends_at: string | null
          trial_ends_at: string | null
          stripe_customer_id: string | null
          stripe_account_id: string | null
          stripe_onboarding_complete: boolean
          stripe_charges_enabled: boolean
          stripe_payouts_enabled: boolean
          stripe_details_submitted: boolean
          is_active: boolean
          owner_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          slug: string
          email: string
          phone?: string | null
          website?: string | null
          address_line1: string
          address_line2?: string | null
          city: string
          state_province?: string | null
          postal_code: string
          country: string
          latitude?: number | null
          longitude?: number | null
          settings?: Json
          subscription_status?: SubscriptionStatus
          subscription_started_at?: string | null
          subscription_ends_at?: string | null
          trial_ends_at?: string | null
          stripe_customer_id?: string | null
          stripe_account_id?: string | null
          stripe_onboarding_complete?: boolean
          stripe_charges_enabled?: boolean
          stripe_payouts_enabled?: boolean
          stripe_details_submitted?: boolean
          is_active?: boolean
          owner_id: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          slug?: string
          email?: string
          phone?: string | null
          website?: string | null
          address_line1?: string
          address_line2?: string | null
          city?: string
          state_province?: string | null
          postal_code?: string
          country?: string
          latitude?: number | null
          longitude?: number | null
          settings?: Json
          subscription_status?: SubscriptionStatus
          subscription_started_at?: string | null
          subscription_ends_at?: string | null
          trial_ends_at?: string | null
          stripe_customer_id?: string | null
          stripe_account_id?: string | null
          stripe_onboarding_complete?: boolean
          stripe_charges_enabled?: boolean
          stripe_payouts_enabled?: boolean
          stripe_details_submitted?: boolean
          is_active?: boolean
          owner_id?: string
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
      room_types: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          hotel_id: string
          name: Json
          description: Json
          name_default: string
          base_price_cents: number
          currency: string
          max_adults: number
          max_children: number
          max_occupancy: number
          size_sqm: number | null
          bed_configuration: Json
          amenities: Json
          sort_order: number
          is_active: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          hotel_id: string
          name?: Json
          description?: Json
          name_default: string
          base_price_cents: number
          currency?: string
          max_adults?: number
          max_children?: number
          max_occupancy?: number
          size_sqm?: number | null
          bed_configuration?: Json
          amenities?: Json
          sort_order?: number
          is_active?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          hotel_id?: string
          name?: Json
          description?: Json
          name_default?: string
          base_price_cents?: number
          currency?: string
          max_adults?: number
          max_children?: number
          max_occupancy?: number
          size_sqm?: number | null
          bed_configuration?: Json
          amenities?: Json
          sort_order?: number
          is_active?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "room_types_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
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
          room_type_id: string
          room_number: string
          floor: number | null
          building: string | null
          status: RoomStatus
          notes: string | null
          is_active: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          hotel_id: string
          room_type_id: string
          room_number: string
          floor?: number | null
          building?: string | null
          status?: RoomStatus
          notes?: string | null
          is_active?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          hotel_id?: string
          room_type_id?: string
          room_number?: string
          floor?: number | null
          building?: string | null
          status?: RoomStatus
          notes?: string | null
          is_active?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "rooms_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rooms_room_type_id_fkey"
            columns: ["room_type_id"]
            isOneToOne: false
            referencedRelation: "room_types"
            referencedColumns: ["id"]
          }
        ]
      }
      rate_plans: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          hotel_id: string
          room_type_id: string
          name: string
          code: string
          description: string | null
          validity_range: string
          price_cents: number
          currency: string
          priority: number
          min_stay_nights: number
          max_stay_nights: number | null
          min_advance_booking_days: number
          max_advance_booking_days: number | null
          applicable_days: number[]
          is_refundable: boolean
          cancellation_deadline_hours: number | null
          is_active: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          hotel_id: string
          room_type_id: string
          name: string
          code: string
          description?: string | null
          validity_range: string
          price_cents: number
          currency?: string
          priority?: number
          min_stay_nights?: number
          max_stay_nights?: number | null
          min_advance_booking_days?: number
          max_advance_booking_days?: number | null
          applicable_days?: number[]
          is_refundable?: boolean
          cancellation_deadline_hours?: number | null
          is_active?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          hotel_id?: string
          room_type_id?: string
          name?: string
          code?: string
          description?: string | null
          validity_range?: string
          price_cents?: number
          currency?: string
          priority?: number
          min_stay_nights?: number
          max_stay_nights?: number | null
          min_advance_booking_days?: number
          max_advance_booking_days?: number | null
          applicable_days?: number[]
          is_refundable?: boolean
          cancellation_deadline_hours?: number | null
          is_active?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "rate_plans_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rate_plans_room_type_id_fkey"
            columns: ["room_type_id"]
            isOneToOne: false
            referencedRelation: "room_types"
            referencedColumns: ["id"]
          }
        ]
      }
      bookings: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          hotel_id: string
          room_id: string
          room_type_id: string
          guest_id: string | null
          stay_range: string
          check_in_date: string
          check_out_date: string
          actual_check_in_at: string | null
          actual_check_out_at: string | null
          num_adults: number
          num_children: number
          status: BookingStatus
          payment_status: PaymentStatus
          total_price_cents: number
          currency: string
          tax_cents: number
          rate_plan_id: string | null
          stripe_payment_intent_id: string | null
          stripe_charge_id: string | null
          cancelled_at: string | null
          cancellation_reason: string | null
          special_requests: string | null
          internal_notes: string | null
          booking_source: string
          confirmation_code: string
          soft_hold_expires_at: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          hotel_id: string
          room_id: string
          room_type_id: string
          guest_id?: string | null
          stay_range?: string
          check_in_date: string
          check_out_date: string
          actual_check_in_at?: string | null
          actual_check_out_at?: string | null
          num_adults?: number
          num_children?: number
          status?: BookingStatus
          payment_status?: PaymentStatus
          total_price_cents: number
          currency?: string
          tax_cents?: number
          rate_plan_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_charge_id?: string | null
          cancelled_at?: string | null
          cancellation_reason?: string | null
          special_requests?: string | null
          internal_notes?: string | null
          booking_source?: string
          confirmation_code?: string
          soft_hold_expires_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          hotel_id?: string
          room_id?: string
          room_type_id?: string
          guest_id?: string | null
          stay_range?: string
          check_in_date?: string
          check_out_date?: string
          actual_check_in_at?: string | null
          actual_check_out_at?: string | null
          num_adults?: number
          num_children?: number
          status?: BookingStatus
          payment_status?: PaymentStatus
          total_price_cents?: number
          currency?: string
          tax_cents?: number
          rate_plan_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_charge_id?: string | null
          cancelled_at?: string | null
          cancellation_reason?: string | null
          special_requests?: string | null
          internal_notes?: string | null
          booking_source?: string
          confirmation_code?: string
          soft_hold_expires_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_room_type_id_fkey"
            columns: ["room_type_id"]
            isOneToOne: false
            referencedRelation: "room_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_rate_plan_id_fkey"
            columns: ["rate_plan_id"]
            isOneToOne: false
            referencedRelation: "rate_plans"
            referencedColumns: ["id"]
          }
        ]
      }
      booking_guests: {
        Row: {
          id: string
          created_at: string
          booking_id: string
          first_name: string
          last_name: string
          email: string | null
          phone: string | null
          is_primary: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          booking_id: string
          first_name: string
          last_name: string
          email?: string | null
          phone?: string | null
          is_primary?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          booking_id?: string
          first_name?: string
          last_name?: string
          email?: string | null
          phone?: string | null
          is_primary?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "booking_guests_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          }
        ]
      }
      booking_state_log: {
        Row: {
          id: string
          created_at: string
          booking_id: string
          from_state: BookingStatus
          to_state: BookingStatus
          changed_by: string | null
          changed_at: string
          reason: string | null
          metadata: Json
        }
        Insert: {
          id?: string
          created_at?: string
          booking_id: string
          from_state: BookingStatus
          to_state: BookingStatus
          changed_by?: string | null
          changed_at?: string
          reason?: string | null
          metadata?: Json
        }
        Update: {
          id?: string
          created_at?: string
          booking_id?: string
          from_state?: BookingStatus
          to_state?: BookingStatus
          changed_by?: string | null
          changed_at?: string
          reason?: string | null
          metadata?: Json
        }
        Relationships: [
          {
            foreignKeyName: "booking_state_log_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_state_log_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      closed_dates: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          hotel_id: string
          room_type_id: string | null
          closed_range: string
          reason: string | null
          notes: string | null
          is_active: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          hotel_id: string
          room_type_id?: string | null
          closed_range: string
          reason?: string | null
          notes?: string | null
          is_active?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          hotel_id?: string
          room_type_id?: string | null
          closed_range?: string
          reason?: string | null
          notes?: string | null
          is_active?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "closed_dates_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "closed_dates_room_type_id_fkey"
            columns: ["room_type_id"]
            isOneToOne: false
            referencedRelation: "room_types"
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
          role: UserRole
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
          role?: UserRole
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
          role?: UserRole
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
      subscriptions: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          hotel_id: string
          stripe_subscription_id: string
          stripe_customer_id: string
          status: string
          plan: string
          current_period_start: string
          current_period_end: string
          cancel_at_period_end: boolean
          canceled_at: string | null
          trial_end: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          hotel_id: string
          stripe_subscription_id: string
          stripe_customer_id: string
          status: string
          plan: string
          current_period_start: string
          current_period_end: string
          cancel_at_period_end?: boolean
          canceled_at?: string | null
          trial_end?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          hotel_id?: string
          stripe_subscription_id?: string
          stripe_customer_id?: string
          status?: string
          plan?: string
          current_period_start?: string
          current_period_end?: string
          cancel_at_period_end?: boolean
          canceled_at?: string | null
          trial_end?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          }
        ]
      }
      invoices: {
        Row: {
          id: string
          created_at: string
          stripe_invoice_id: string
          stripe_subscription_id: string
          stripe_customer_id: string
          amount_paid: number
          amount_due: number
          currency: string
          status: string
          hosted_invoice_url: string | null
          invoice_pdf: string | null
          paid_at: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          stripe_invoice_id: string
          stripe_subscription_id: string
          stripe_customer_id: string
          amount_paid: number
          amount_due: number
          currency: string
          status: string
          hosted_invoice_url?: string | null
          invoice_pdf?: string | null
          paid_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          stripe_invoice_id?: string
          stripe_subscription_id?: string
          stripe_customer_id?: string
          amount_paid?: number
          amount_due?: number
          currency?: string
          status?: string
          hosted_invoice_url?: string | null
          invoice_pdf?: string | null
          paid_at?: string | null
        }
        Relationships: []
      }
      connect_accounts: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          hotel_id: string
          stripe_account_id: string
          charges_enabled: boolean
          payouts_enabled: boolean
          details_submitted: boolean
          requirements_currently_due: string[]
          requirements_eventually_due: string[]
          requirements_past_due: string[]
          country: string
          default_currency: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          hotel_id: string
          stripe_account_id: string
          charges_enabled?: boolean
          payouts_enabled?: boolean
          details_submitted?: boolean
          requirements_currently_due?: string[]
          requirements_eventually_due?: string[]
          requirements_past_due?: string[]
          country: string
          default_currency?: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          hotel_id?: string
          stripe_account_id?: string
          charges_enabled?: boolean
          payouts_enabled?: boolean
          details_submitted?: boolean
          requirements_currently_due?: string[]
          requirements_eventually_due?: string[]
          requirements_past_due?: string[]
          country?: string
          default_currency?: string
        }
        Relationships: [
          {
            foreignKeyName: "connect_accounts_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: true
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          }
        ]
      }
      payments: {
        Row: {
          id: string
          created_at: string
          booking_id: string
          stripe_payment_intent_id: string
          amount: number
          currency: string
          application_fee_amount: number
          status: string
          payment_method: string | null
          failure_reason: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          booking_id: string
          stripe_payment_intent_id: string
          amount: number
          currency: string
          application_fee_amount: number
          status: string
          payment_method?: string | null
          failure_reason?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          booking_id?: string
          stripe_payment_intent_id?: string
          amount?: number
          currency?: string
          application_fee_amount?: number
          status?: string
          payment_method?: string | null
          failure_reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          }
        ]
      }
      payouts: {
        Row: {
          id: string
          created_at: string
          hotel_id: string
          stripe_payout_id: string
          stripe_account_id: string
          amount: number
          currency: string
          status: string
          arrival_date: string
          description: string | null
          failure_reason: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          hotel_id: string
          stripe_payout_id: string
          stripe_account_id: string
          amount: number
          currency: string
          status: string
          arrival_date: string
          description?: string | null
          failure_reason?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          hotel_id?: string
          stripe_payout_id?: string
          stripe_account_id?: string
          amount?: number
          currency?: string
          status?: string
          arrival_date?: string
          description?: string | null
          failure_reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payouts_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          }
        ]
      }
      media: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          hotel_id: string
          room_type_id: string | null
          type: string
          url: string
          alt_text: Json | null
          sort_order: number
          is_primary: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          hotel_id: string
          room_type_id?: string | null
          type: string
          url: string
          alt_text?: Json | null
          sort_order?: number
          is_primary?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          hotel_id?: string
          room_type_id?: string | null
          type?: string
          url?: string
          alt_text?: Json | null
          sort_order?: number
          is_primary?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "media_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_room_type_id_fkey"
            columns: ["room_type_id"]
            isOneToOne: false
            referencedRelation: "room_types"
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
      get_available_rooms: {
        Args: {
          p_hotel_id: string
          p_room_type_id: string
          p_check_in_date: string
          p_check_out_date: string
        }
        Returns: {
          room_id: string
          room_number: string
          floor: number | null
        }[]
      }
      count_available_rooms: {
        Args: {
          p_hotel_id: string
          p_room_type_id: string
          p_check_in_date: string
          p_check_out_date: string
        }
        Returns: number
      }
      is_room_available: {
        Args: {
          p_room_id: string
          p_check_in_date: string
          p_check_out_date: string
        }
        Returns: boolean
      }
      get_occupancy_stats: {
        Args: {
          p_hotel_id: string
          p_start_date: string
          p_end_date: string
        }
        Returns: {
          date: string
          total_rooms: number
          occupied_rooms: number
          available_rooms: number
          occupancy_rate: number
        }[]
      }
    }
    Enums: {
      booking_status: BookingStatus
      payment_status: PaymentStatus
      subscription_status: SubscriptionStatus
      room_status: RoomStatus
      user_role: UserRole
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
