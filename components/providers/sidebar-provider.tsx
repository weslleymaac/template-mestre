'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import {
  DEFAULT_SIDEBAR,
  DEFAULT_SIDEBAR_MODE,
  DEFAULT_SIDEBAR_STYLE,
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
}

const SidebarContext = createContext<SidebarContextValue | null>(null)

const VISIBILITY_KEY = 'v0-sidebar'
const STYLE_KEY = 'v0-sidebar-style'
const MODE_KEY = 'v0-sidebar-mode'

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [visibility, setVisibilityState] =
    useState<SidebarVisibility>(DEFAULT_SIDEBAR)
  const [style, setStyleState] = useState<SidebarStyle>(DEFAULT_SIDEBAR_STYLE)
  const [mode, setModeState] = useState<SidebarMode>(DEFAULT_SIDEBAR_MODE)

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
  }, [])

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

  return (
    <SidebarContext.Provider
      value={{ visibility, setVisibility, style, setStyle, mode, setMode }}
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
