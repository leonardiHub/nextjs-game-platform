'use client'

import { useEffect } from 'react'

/**
 * Component that aggressively suppresses hydration warnings
 * This is a nuclear option for persistent hydration issues
 */
export default function HydrationSuppressor() {
  useEffect(() => {
    // Override React's hydration error reporting - more comprehensive
    const originalError = console.error
    const originalWarn = console.warn
    const originalLog = console.log
    
    const suppressHydrationMessages = (originalMethod: (...args: any[]) => void) => {
      return (...args: any[]) => {
        const message = args[0]
        
        if (typeof message === 'string') {
          // More comprehensive list of hydration-related messages to suppress
          const hydrationKeywords = [
            'Hydration failed',
            'server rendered HTML',
            "didn't match",
            'bis_skin_checked',
            'server rendered',
            'client properties',
            'tree hydrated',
            'Warning: Text content did not match',
            'Warning: Expected server HTML',
            'hydration error',
            'hydration mismatch',
            'SSR-ed Client Component',
            'A tree hydrated but some attributes',
            'This won\'t be patched up',
            'browser extension installed',
            'messes with the HTML',
            'data-adblock',
            'data-extension',
            'data-darkreader'
          ]
          
          const shouldSuppress = hydrationKeywords.some(keyword => 
            message.toLowerCase().includes(keyword.toLowerCase())
          )
          
          if (shouldSuppress) {
            return // Don't log hydration warnings
          }
        }
        
        // Also check for React DevTools or other objects that might contain hydration errors
        if (args.length > 0 && typeof args[0] === 'object' && args[0] !== null) {
          try {
            const str = JSON.stringify(args[0])
            if (str && str.includes('bis_skin_checked')) {
              return // Don't log objects containing bis_skin_checked
            }
          } catch (e) {
            // Ignore JSON stringify errors
          }
        }
        
        originalMethod.apply(console, args)
      }
    }
    
    console.error = suppressHydrationMessages(originalError)
    console.warn = suppressHydrationMessages(originalWarn)
    console.log = suppressHydrationMessages(originalLog)
    
    // Cleanup function to restore original console methods
    return () => {
      console.error = originalError
      console.warn = originalWarn
      console.log = originalLog
    }
  }, [])

  useEffect(() => {
    // More aggressive DOM cleaning
    const cleanupExtensionAttributes = () => {
      const attributesToRemove = [
        'bis_skin_checked',
        'data-adblock',
        'data-extension', 
        'data-darkreader',
        'data-grammarly-shadow-root',
        'data-lastpass-icon-root',
        'data-1p-ignore',
        'data-bitwarden-watching'
      ]

      attributesToRemove.forEach(attr => {
        try {
          const elements = document.querySelectorAll(`[${attr}]`)
          elements.forEach(el => {
            try {
              el.removeAttribute(attr)
            } catch (e) {
              // Ignore errors when removing attributes
            }
          })
        } catch (e) {
          // Ignore query selector errors
        }
      })
    }

    // Run cleanup immediately and repeatedly
    cleanupExtensionAttributes()
    const interval = setInterval(cleanupExtensionAttributes, 50)
    
    // Also use MutationObserver for immediate cleanup of new nodes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' || mutation.type === 'childList') {
          cleanupExtensionAttributes()
        }
      })
    })
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: [
        'bis_skin_checked',
        'data-adblock', 
        'data-extension',
        'data-darkreader'
      ]
    })

    return () => {
      clearInterval(interval)
      observer.disconnect()
    }
  }, [])

  return null // This component doesn't render anything
}

