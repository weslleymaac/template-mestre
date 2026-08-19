'use client'

import { useTheme } from 'next-themes'
import { createContext, useContext, useEffect, useState } from 'react'
import { normalizeHex } from '@/lib/custom-palette'
import {
  applyShellColors,
  DEFAULT_BACKGROUND_TONE,
  DEFAULT_CUSTOM_BACKGROUND_COLOR,
  DEFAULT_CUSTOM_SIDEBAR_COLOR,
  DEFAULT_SIDEBAR_COLOR,
  isBackgroundToneId,
  isSidebarColorId,
  type BackgroundToneId,
  type SidebarColorId,
} from '@/lib/shell-colors'
import {
  DEFAULT_SIDEBAR,
  DEFAULT_SIDEBAR_MENU_EFFECT,
  DEFAULT_SIDEBAR_MODE,
  DEFAULT_SIDEBAR_STYLE,
  type SidebarMenuEffect,
  type SidebarMode,
  type SidebarStyle,
  type SidebarVisibility,
} from '@/lib/sidebar'

type SidebarContextValue = {
  visibility: SidebarVisibility
  setVisibility: (visibility: SidebarVisibility) => void
  style: SidebarStyle
  setStyle: (style: SidebarStyle) => void
  mode: SidebarMode
  setMode: (mode: SidebarMode) => void
  menuEffect: SidebarMenuEffect
  setMenuEffect: (effect: SidebarMenuEffect) => void
  sidebarColor: SidebarColorId
  setSidebarColor: (color: SidebarColorId) => void
  customSidebarColor: string
  setCustomSidebarColor: (
    hex: string,
    options?: { activate?: boolean },
  ) => void
  backgroundTone: BackgroundToneId
  setBackgroundTone: (tone: BackgroundToneId) => void
  customBackgroundColor: string
  setCustomBackgroundColor: (
    hex: string,
    options?: { activate?: boolean },
  ) => void
}

const SidebarContext = createContext<SidebarContextValue | null>(null)

const VISIBILITY_KEY = 'v0-sidebar'
const STYLE_KEY = 'v0-sidebar-style'
const MODE_KEY = 'v0-sidebar-mode'
const MENU_EFFECT_KEY = 'v0-sidebar-menu-effect'
const SIDEBAR_COLOR_KEY = 'v0-sidebar-color'
const CUSTOM_SIDEBAR_COLOR_KEY = 'v0-custom-sidebar-color'
const BACKGROUND_TONE_KEY = 'v0-background-tone'
const CUSTOM_BACKGROUND_COLOR_KEY = 'v0-custom-background-color'

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme()
  const [visibility, setVisibilityState] =
    useState<SidebarVisibility>(DEFAULT_SIDEBAR)
  const [style, setStyleState] = useState<SidebarStyle>(DEFAULT_SIDEBAR_STYLE)
  const [mode, setModeState] = useState<SidebarMode>(DEFAULT_SIDEBAR_MODE)
  const [menuEffect, setMenuEffectState] = useState<SidebarMenuEffect>(
    DEFAULT_SIDEBAR_MENU_EFFECT,
  )
  const [sidebarColor, setSidebarColorState] = useState<SidebarColorId>(
    DEFAULT_SIDEBAR_COLOR,
  )
  const [customSidebarColor, setCustomSidebarColorState] = useState(
    DEFAULT_CUSTOM_SIDEBAR_COLOR,
  )
  const [backgroundTone, setBackgroundToneState] = useState<BackgroundToneId>(
    DEFAULT_BACKGROUND_TONE,
  )
  const [customBackgroundColor, setCustomBackgroundColorState] = useState(
    DEFAULT_CUSTOM_BACKGROUND_COLOR,
  )

  useEffect(() => {
    const storedVisibility = window.localStorage.getItem(
      VISIBILITY_KEY,
    ) as SidebarVisibility | null
    if (storedVisibility === 'visible' || storedVisibility === 'hidden') {
      setVisibilityState(storedVisibility)
    }
    const storedStyle = window.localStorage.getItem(
      STYLE_KEY,
    ) as SidebarStyle | null
    if (storedStyle === 'flat' || storedStyle === 'floating') {
      setStyleState(storedStyle)
    }
    const storedMode = window.localStorage.getItem(
      MODE_KEY,
    ) as SidebarMode | null
    if (storedMode === 'full' || storedMode === 'compact') {
      setModeState(storedMode)
    }
    const storedMenuEffect = window.localStorage.getItem(
      MENU_EFFECT_KEY,
    ) as SidebarMenuEffect | null
    if (storedMenuEffect === 'fade' || storedMenuEffect === 'slide') {
      setMenuEffectState(storedMenuEffect)
    }
    const storedSidebarColor = window.localStorage.getItem(
      SIDEBAR_COLOR_KEY,
    ) as SidebarColorId | null
    if (storedSidebarColor && isSidebarColorId(storedSidebarColor)) {
      setSidebarColorState(storedSidebarColor)
    }
    const storedCustomSidebar = normalizeHex(
      window.localStorage.getItem(CUSTOM_SIDEBAR_COLOR_KEY) ?? '',
    )
    if (storedCustomSidebar) setCustomSidebarColorState(storedCustomSidebar)

    const storedBackgroundTone = window.localStorage.getItem(BACKGROUND_TONE_KEY)
    if (storedBackgroundTone && isBackgroundToneId(storedBackgroundTone)) {
      setBackgroundToneState(storedBackgroundTone)
    }
    const storedCustomBg = normalizeHex(
      window.localStorage.getItem(CUSTOM_BACKGROUND_COLOR_KEY) ?? '',
    )
    if (storedCustomBg) setCustomBackgroundColorState(storedCustomBg)
  }, [])

  useEffect(() => {
    applyShellColors(sidebarColor, backgroundTone, resolvedTheme === 'dark', {
      customSidebarColor,
      customBackgroundColor,
    })
  }, [
    sidebarColor,
    backgroundTone,
    customSidebarColor,
    customBackgroundColor,
    resolvedTheme,
  ])

  const setVisibility = (next: SidebarVisibility) => {
    setVisibilityState(next)
    window.localStorage.setItem(VISIBILITY_KEY, next)
  }

  const setStyle = (next: SidebarStyle) => {
    setStyleState(next)
    window.localStorage.setItem(STYLE_KEY, next)
  }

  const setMode = (next: SidebarMode) => {
    setModeState(next)
    window.localStorage.setItem(MODE_KEY, next)
  }

  const setMenuEffect = (next: SidebarMenuEffect) => {
    setMenuEffectState(next)
    window.localStorage.setItem(MENU_EFFECT_KEY, next)
  }

  const setSidebarColor = (next: SidebarColorId) => {
    setSidebarColorState(next)
    window.localStorage.setItem(SIDEBAR_COLOR_KEY, next)
  }

  const setCustomSidebarColor = (
    hex: string,
    options: { activate?: boolean } = {},
  ) => {
    const activate = options.activate !== false
    const color = normalizeHex(hex)
    if (!color) return
    setCustomSidebarColorState(color)
    window.localStorage.setItem(CUSTOM_SIDEBAR_COLOR_KEY, color)
    if (activate) {
      setSidebarColorState('custom')
      window.localStorage.setItem(SIDEBAR_COLOR_KEY, 'custom')
    }
  }

  const setBackgroundTone = (next: BackgroundToneId) => {
    setBackgroundToneState(next)
    window.localStorage.setItem(BACKGROUND_TONE_KEY, next)
  }

  const setCustomBackgroundColor = (
    hex: string,
    options: { activate?: boolean } = {},
  ) => {
    const activate = options.activate !== false
    const color = normalizeHex(hex)
    if (!color) return
    setCustomBackgroundColorState(color)
    window.localStorage.setItem(CUSTOM_BACKGROUND_COLOR_KEY, color)
    if (activate) {
      setBackgroundToneState('custom')
      window.localStorage.setItem(BACKGROUND_TONE_KEY, 'custom')
    }
  }

  return (
    <SidebarContext.Provider
      value={{
        visibility,
        setVisibility,
        style,
        setStyle,
        mode,
        setMode,
        menuEffect,
        setMenuEffect,
        sidebarColor,
        setSidebarColor,
        customSidebarColor,
        setCustomSidebarColor,
        backgroundTone,
        setBackgroundTone,
        customBackgroundColor,
        setCustomBackgroundColor,
      }}
    >
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const ctx = useContext(SidebarContext)
  if (!ctx) throw new Error('useSidebar deve ser usado dentro de SidebarProvider')
  return ctx
}
