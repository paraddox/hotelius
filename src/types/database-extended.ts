/**
 * Extended Database Types for Stripe Integration
 *
 * These types extend the base database schema to include Stripe-related tables:
 * - subscriptions: SaaS billing for hotels
 * - invoices: Payment records for subscriptions
 * - connect_accounts: Stripe Connect account information
 * - payments: Guest booking payment records
 * - payouts: Hotel payout records
 *
 * Add these columns to the hotels table in your Supabase schema:
 * - stripe_customer_id: text
 * - stripe_account_id: text
 * - stripe_onboarding_complete: boolean (default: false)
 * - stripe_charges_enabled: boolean (default: false)
 * - stripe_payouts_enabled: boolean (default: false)
 * - stripe_details_submitted: boolean (default: false)
 * - subscription_status: text
 *
 * Create these new tables in your Supabase database:
 */

import type { Database as BaseDatabase } from './database'

export interface StripeTablesExtension {
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
        foreignKeyName: 'subscriptions_hotel_id_fkey'
        columns: ['hotel_id']
        isOneToOne: false
        referencedRelation: 'hotels'
        referencedColumns: ['id']
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
        foreignKeyName: 'connect_accounts_hotel_id_fkey'
        columns: ['hotel_id']
        isOneToOne: true
        referencedRelation: 'hotels'
        referencedColumns: ['id']
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
        foreignKeyName: 'payments_booking_id_fkey'
        columns: ['booking_id']
        isOneToOne: false
        referencedRelation: 'bookings'
        referencedColumns: ['id']
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
        foreignKeyName: 'payouts_hotel_id_fkey'
        columns: ['hotel_id']
        isOneToOne: false
        referencedRelation: 'hotels'
        referencedColumns: ['id']
      }
    ]
  }
}

// Extended hotels table with Stripe fields
export type ExtendedHotelsTable = {
  Row: BaseDatabase['public']['Tables']['hotels']['Row'] & {
    stripe_customer_id: string | null
    stripe_account_id: string | null
    stripe_onboarding_complete: boolean
    stripe_charges_enabled: boolean
    stripe_payouts_enabled: boolean
    stripe_details_submitted: boolean
    subscription_status: string | null
  }
  Insert: BaseDatabase['public']['Tables']['hotels']['Insert'] & {
    stripe_customer_id?: string | null
    stripe_account_id?: string | null
    stripe_onboarding_complete?: boolean
    stripe_charges_enabled?: boolean
    stripe_payouts_enabled?: boolean
    stripe_details_submitted?: boolean
    subscription_status?: string | null
  }
  Update: BaseDatabase['public']['Tables']['hotels']['Update'] & {
    stripe_customer_id?: string | null
    stripe_account_id?: string | null
    stripe_onboarding_complete?: boolean
    stripe_charges_enabled?: boolean
    stripe_payouts_enabled?: boolean
    stripe_details_submitted?: boolean
    subscription_status?: string | null
  }
}

// Extended Database type that includes Stripe tables
export interface ExtendedDatabase extends BaseDatabase {
  public: {
    Tables: BaseDatabase['public']['Tables'] & StripeTablesExtension & {
      hotels: ExtendedHotelsTable
    }
    Views: BaseDatabase['public']['Views']
    Functions: BaseDatabase['public']['Functions']
    Enums: BaseDatabase['public']['Enums']
    CompositeTypes: BaseDatabase['public']['CompositeTypes']
  }
}

export type { BaseDatabase as Database }
