'use client'

import { useEffect } from 'react'

interface ClientOnlyScriptProps {
  code: string
}

export default function ClientOnlyScript({ code }: ClientOnlyScriptProps) {
  useEffect(() => {
    // Only inject the script on the client side to prevent hydration mismatches
    if (code && typeof window !== 'undefined') {
      const script = document.createElement('script')
      script.innerHTML = code
      script.async = true
      document.head.appendChild(script)

      // Cleanup function
      return () => {
        if (document.head.contains(script)) {
          document.head.removeChild(script)
        }
      }
    }
  }, [code])

  // Don't render anything on the server
  return null
}
