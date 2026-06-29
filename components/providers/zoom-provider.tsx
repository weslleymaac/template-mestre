'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { DEFAULT_ZOOM, resolveZoom, type ZoomId } from '@/lib/zoom'

type ZoomContextValue = {
  zoom: ZoomId
  setZoom: (zoom: ZoomId) => void
}

const ZoomContext = createContext<ZoomContextValue | null>(null)

const STORAGE_KEY = 'v0-zoom'

function applyZoom(id: ZoomId) {
  const factor = resolveZoom(id, window.innerWidth)
  // `zoom` é suportado nos navegadores modernos e não dispara reflow custoso.
  document.documentElement.style.setProperty('zoom', String(factor))
}

export function ZoomProvider({ children }: { children: React.ReactNode }) {
  const [zoom, setZoomState] = useState<ZoomId>(DEFAULT_ZOOM)

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as ZoomId | null
    const initial = stored ?? DEFAULT_ZOOM
    setZoomState(initial)
    applyZoom(initial)

    // Reaplica quando a janela muda de tamanho (relevante no modo automático).
    const onResize = () => {
      const current =
        (window.localStorage.getItem(STORAGE_KEY) as ZoomId | null) ??
        DEFAULT_ZOOM
      if (current === 'auto') applyZoom(current)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const setZoom = (next: ZoomId) => {
    setZoomState(next)
    applyZoom(next)
    window.localStorage.setItem(STORAGE_KEY, next)
  }

  return (
    <ZoomContext.Provider value={{ zoom, setZoom }}>
      {children}
    </ZoomContext.Provider>
  )
}

export function useZoom() {
  const ctx = useContext(ZoomContext)
  if (!ctx) throw new Error('useZoom deve ser usado dentro de ZoomProvider')
  return ctx
}
