export const isBrowser = typeof window !== 'undefined'

export const safeWindow = new Proxy(
  {},
  {
    get: (target, prop) => {
      if (!isBrowser) return undefined
      try {
        return window[prop]
      } catch (e) {
        console.warn(`Error accessing window.${String(prop)}:`, e)
        return undefined
      }
    },
    set: (target, prop, value) => {
      if (!isBrowser) return true
      try {
        window[prop] = value
        return true
      } catch (e) {
        console.warn(`Error setting window.${String(prop)}:`, e)
        return false
      }
    },
  }
) as typeof window
