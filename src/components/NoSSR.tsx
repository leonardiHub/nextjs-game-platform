'use client'

import { useClientOnly } from '@/hooks/useClientOnly'

interface NoSSRProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

/**
 * Component that prevents server-side rendering of its children
 * Useful for avoiding hydration mismatches with dynamic content
 */
export default function NoSSR({ children, fallback = null }: NoSSRProps) {
  const isClient = useClientOnly()

  if (!isClient) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
