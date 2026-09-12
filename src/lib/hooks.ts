import { useEffect, useState } from 'react'

function useMedia(query: string): boolean {
  const [match, setMatch] = useState(() => (typeof window !== 'undefined' ? window.matchMedia(query).matches : false))
  useEffect(() => {
    const m = window.matchMedia(query)
    const on = () => setMatch(m.matches)
    m.addEventListener('change', on)
    return () => m.removeEventListener('change', on)
  }, [query])
  return match
}

/** True when the visitor's device asks for less motion. Every animation respects this. */
export const useReducedMotion = () => useMedia('(prefers-reduced-motion: reduce)')

/** True on devices with a real mouse/trackpad (never on phones). */
export const useFinePointer = () => useMedia('(pointer: fine)')

/** Live "HH:MM" in the given time zone, updated every 15 s. */
export function useClock(timeZone: string): string {
  const fmt = () => {
    try {
      return new Date().toLocaleTimeString('en-IN', { timeZone, hour: '2-digit', minute: '2-digit', hour12: false })
    } catch {
      return new Date().toTimeString().slice(0, 5)
    }
  }
  const [t, setT] = useState(fmt)
  useEffect(() => {
    const id = setInterval(() => setT(fmt()), 15000)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeZone])
  return t
}
