'use client'

import { useEffect } from 'react'
import { safeWindow } from '@/utils/browser'

export function ExtensionGuard({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Store original defineProperty
    const originalDefineProperty = Object.defineProperty

    // Create a wrapped version that catches errors
    const safeDefineProperty: typeof Object.defineProperty = (obj, prop, descriptor) => {
      try {
        return originalDefineProperty(obj, prop, descriptor)
      } catch (e) {
        console.warn(`Failed to define property ${String(prop)}:`, e)
        return obj
      }
    }

    // Replace global defineProperty with safe version
    Object.defineProperty = safeDefineProperty

    // Cleanup
    return () => {
      Object.defineProperty = originalDefineProperty
    }
  }, [])

  return <>{children}</>
}
