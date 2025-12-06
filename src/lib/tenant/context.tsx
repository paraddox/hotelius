'use client';

import { createContext, useContext, ReactNode } from 'react';

interface Tenant {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  primary_color?: string;
  subscription_status: string;
  subscription_tier: string;
}

interface TenantContextType {
  tenant: Tenant | null;
  isLoading: boolean;
}

const TenantContext = createContext<TenantContextType>({
  tenant: null,
  isLoading: true,
});

export function TenantProvider({
  children,
  tenant
}: {
  children: ReactNode;
  tenant: Tenant | null;
}) {
  return (
    <TenantContext.Provider value={{ tenant, isLoading: false }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}

export type { Tenant };
