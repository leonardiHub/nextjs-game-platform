import { useState, useEffect } from 'react'

/**
 * Hook to prevent hydration mismatches by ensuring code only runs on the client
 * @returns {boolean} true if component has mounted on client side
 */
export function useClientOnly(): boolean {
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  return hasMounted
}

/**
 * Hook for generating unique IDs that are consistent between server and client
 * @returns {string} A unique ID that's consistent across renders
 */
export function useUniqueId(): string {
  const [id, setId] = useState('')
  
  useEffect(() => {
    // Only generate the ID on the client side to avoid hydration mismatch
    setId(`id_${Math.random().toString(36).substr(2, 9)}`)
  }, [])
  
  return id
}

/**
 * Hook for getting current timestamp in a hydration-safe way
 * @returns {number} Current timestamp (0 during SSR, actual timestamp on client)
 */
export function useTimestamp(): number {
  const [timestamp, setTimestamp] = useState(0)
  
  useEffect(() => {
    setTimestamp(Date.now())
  }, [])
  
  return timestamp
}
