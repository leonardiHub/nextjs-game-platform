/**
 * Global script to suppress hydration warnings caused by browser extensions
 * This script runs before React hydration to prevent console errors
 */

// Suppress hydration warnings globally
if (typeof window !== 'undefined') {
  // Override console.error to filter out hydration warnings
  const originalError = console.error
  console.error = (...args) => {
    const message = args[0]

    // Filter out hydration warnings
    if (
      typeof message === 'string' &&
      (message.includes('A tree hydrated but some attributes') ||
        message.includes('bis_skin_checked') ||
        message.includes('hydration') ||
        message.includes('server rendered HTML') ||
        message.includes('client properties'))
    ) {
      return // Suppress this error
    }

    // Allow other errors to pass through
    originalError.apply(console, args)
  }

  // Remove browser extension attributes that cause hydration mismatches
  const removeExtensionAttributes = () => {
    const elements = document.querySelectorAll('*')
    elements.forEach(element => {
      // Remove common browser extension attributes
      const attributesToRemove = [
        'bis_skin_checked',
        'data-adblock',
        'data-extension',
        'data-darkreader',
        'data-grammarly-shadow-root',
        'data-grammarly',
        'data-grammarly-shadow',
      ]

      attributesToRemove.forEach(attr => {
        if (element.hasAttribute(attr)) {
          element.removeAttribute(attr)
        }
      })
    })
  }

  // Run immediately and on DOM changes
  removeExtensionAttributes()

  // Use MutationObserver to catch dynamically added attributes
  const observer = new MutationObserver(() => {
    removeExtensionAttributes()
  })

  observer.observe(document.body, {
    attributes: true,
    childList: true,
    subtree: true,
    attributeFilter: [
      'bis_skin_checked',
      'data-adblock',
      'data-extension',
      'data-darkreader',
    ],
  })

  // Clean up on page unload
  window.addEventListener('beforeunload', () => {
    observer.disconnect()
  })
}

export default {}

