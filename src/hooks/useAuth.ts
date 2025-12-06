'use client'

import { useContext } from 'react'
import { AuthContext } from '@/components/auth/AuthProvider'

/**
 * Client-side auth hook
 * Must be used within AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}
