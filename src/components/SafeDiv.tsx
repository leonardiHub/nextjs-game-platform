'use client'

import { useHydration } from '@/components/HydrationProvider'
import { forwardRef } from 'react'

interface SafeDivProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  suppressHydrationWarning?: boolean
}

/**
 * A div component that's safe from hydration mismatches
 * Automatically suppresses hydration warnings for elements that might be modified by browser extensions
 */
const SafeDiv = forwardRef<HTMLDivElement, SafeDivProps>(
  ({ children, suppressHydrationWarning = true, ...props }, ref) => {
    return (
      <div
        ref={ref}
        suppressHydrationWarning={suppressHydrationWarning}
        {...props}
      >
        {children}
      </div>
    )
  }
)

SafeDiv.displayName = 'SafeDiv'

export default SafeDiv
