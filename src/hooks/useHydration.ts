import { useState, useEffect } from 'react'
import React from 'react'

/**
 * Custom hook to handle hydration state and prevent server/client mismatches
 * This is particularly useful for components that rely on browser-specific APIs
 * or have dynamic content that differs between server and client rendering
 */
export function useHydration() {
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  return isHydrated
}

/**
 * Higher-order component to wrap components that need hydration handling
 * This prevents hydration mismatches by only rendering the component on the client
 */
export function withHydration<T extends object>(
  Component: React.ComponentType<T>,
  FallbackComponent?: React.ComponentType<T>
) {
  return function HydratedComponent(props: T) {
    const isHydrated = useHydration()

    if (!isHydrated && FallbackComponent) {
      return React.createElement(FallbackComponent, props)
    }

    if (!isHydrated) {
      return null
    }

    return React.createElement(Component, props)
  }
}
