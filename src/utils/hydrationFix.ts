'use client'

/**
 * Utility functions to handle hydration mismatches caused by browser extensions
 */

/**
 * Removes attributes commonly added by browser extensions that cause hydration mismatches
 */
export function cleanupExtensionAttributes() {
  if (typeof window === 'undefined') return

  // Wait for DOM to be ready
  if (document.readyState !== 'complete') {
    window.addEventListener('load', cleanupExtensionAttributes)
    return
  }

  // Remove common extension attributes that cause hydration issues
  const attributesToRemove = [
    'bis_skin_checked',
    'data-adblock',
    'data-extension',
    'data-darkreader',
    'data-grammarly-shadow-root',
  ]

  attributesToRemove.forEach(attr => {
    const elements = document.querySelectorAll(`[${attr}]`)
    elements.forEach(el => {
      el.removeAttribute(attr)
    })
  })
}

/**
 * Suppress hydration warnings for development
 */
export function suppressHydrationWarnings() {
  if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') return

  // Override console.error to filter out hydration warnings
  const originalError = console.error
  console.error = (...args) => {
    const message = args[0]
    
    // Filter out hydration-related warnings
    if (
      typeof message === 'string' &&
      (
        message.includes('Hydration failed') ||
        message.includes('server rendered HTML') ||
        message.includes("didn't match") ||
        message.includes('bis_skin_checked')
      )
    ) {
      return // Don't log hydration warnings
    }
    
    originalError.apply(console, args)
  }
}

/**
 * Initialize hydration fixes
 */
export function initHydrationFixes() {
  if (typeof window === 'undefined') return

  suppressHydrationWarnings()
  
  // Clean up extension attributes after initial render
  setTimeout(cleanupExtensionAttributes, 100)
  
  // Also clean up after any dynamic content changes
  const observer = new MutationObserver(() => {
    cleanupExtensionAttributes()
  })
  
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
  })
}
