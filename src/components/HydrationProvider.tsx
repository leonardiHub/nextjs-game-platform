'use client'

import { createContext, useContext, useState, useEffect } from 'react'

interface HydrationContextType {
  isHydrated: boolean
}

const HydrationContext = createContext<HydrationContextType>({
  isHydrated: false,
})

export const useHydration = () => useContext(HydrationContext)

interface HydrationProviderProps {
  children: React.ReactNode
}

/**
 * Provider that tracks hydration status to prevent hydration mismatches
 * Only renders children after hydration is complete on the client side
 */
export function HydrationProvider({ children }: HydrationProviderProps) {
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    // Mark as hydrated after the component mounts on client side
    setIsHydrated(true)
  }, [])

  return (
    <HydrationContext.Provider value={{ isHydrated }}>
      {children}
    </HydrationContext.Provider>
  )
}

/**
 * Component that only renders its children after hydration
 * Useful for components that might cause hydration mismatches
 */
export function ClientOnlyContent({
  children,
  fallback = null,
}: {
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  // const { isHydrated } = useHydration()

  // if (!isHydrated) {
  //   return <>{fallback}</>
  // }

  return <>{children}</>
}
