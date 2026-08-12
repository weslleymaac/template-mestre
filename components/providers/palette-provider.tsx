'use client'

import { useTheme } from 'next-themes'
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'
import {
  applyCustomPalette,
  clearCustomPalette,
  DEFAULT_CUSTOM_COLOR,
  normalizeHex,
} from '@/lib/custom-palette'
import {
  DEFAULT_PALETTE,
  isPaletteId,
  type PaletteId,
} from '@/lib/palettes'

type PaletteContextValue = {
  palette: PaletteId
  setPalette: (palette: PaletteId) => void
  /** Hex da cor personalizada (#rrggbb). */
  customColor: string
  /**
   * Define a cor personalizada.
   * Por padrão ativa a paleta `custom`. Passe `{ activate: false }` para só salvar.
   */
  setCustomColor: (hex: string, options?: { activate?: boolean }) => void
}

const PaletteContext = createContext<PaletteContextValue | null>(null)

const STORAGE_KEY = 'v0-palette'
const CUSTOM_COLOR_KEY = 'v0-custom-color'

export function PaletteProvider({ children }: { children: React.ReactNode }) {
  const [palette, setPaletteState] = useState<PaletteId>(DEFAULT_PALETTE)
  const [customColor, setCustomColorState] = useState(DEFAULT_CUSTOM_COLOR)
  const [ready, setReady] = useState(false)
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  useEffect(() => {
    const storedPalette = window.localStorage.getItem(STORAGE_KEY)
    const storedCustom = window.localStorage.getItem(CUSTOM_COLOR_KEY)
    const color = normalizeHex(storedCustom ?? '') ?? DEFAULT_CUSTOM_COLOR
    setCustomColorState(color)

    if (storedPalette && isPaletteId(storedPalette)) {
      setPaletteState(storedPalette)
      document.documentElement.setAttribute('data-palette', storedPalette)
      if (storedPalette === 'custom') {
        applyCustomPalette(
          color,
          document.documentElement.classList.contains('dark'),
        )
      } else {
        clearCustomPalette()
      }
    }
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready || palette !== 'custom') return
    applyCustomPalette(customColor, isDark)
  }, [ready, palette, customColor, isDark])

  const setPalette = (next: PaletteId) => {
    setPaletteState(next)
    document.documentElement.setAttribute('data-palette', next)
    window.localStorage.setItem(STORAGE_KEY, next)
    if (next === 'custom') {
      applyCustomPalette(customColor, isDark)
    } else {
      clearCustomPalette()
    }
  }

  const setCustomColor = (
    hex: string,
    options: { activate?: boolean } = {},
  ) => {
    const activate = options.activate !== false
    const color = normalizeHex(hex)
    if (!color) return
    setCustomColorState(color)
    window.localStorage.setItem(CUSTOM_COLOR_KEY, color)
    if (activate) {
      setPaletteState('custom')
      document.documentElement.setAttribute('data-palette', 'custom')
      window.localStorage.setItem(STORAGE_KEY, 'custom')
      applyCustomPalette(color, isDark)
    } else if (palette === 'custom') {
      applyCustomPalette(color, isDark)
    }
  }

  return (
    <PaletteContext.Provider
      value={{ palette, setPalette, customColor, setCustomColor }}
    >
      {children}
    </PaletteContext.Provider>
  )
}

export function usePalette() {
  const ctx = useContext(PaletteContext)
  if (!ctx) throw new Error('usePalette deve ser usado dentro de PaletteProvider')
  return ctx
}
