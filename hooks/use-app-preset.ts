'use client'

import { useTheme } from 'next-themes'
import { useDensity } from '@/components/providers/density-provider'
import { useIconSet } from '@/components/providers/icon-set-provider'
import { usePalette } from '@/components/providers/palette-provider'
import { useRadius } from '@/components/providers/radius-provider'
import { useShadow } from '@/components/providers/shadow-provider'
import { useSidebar } from '@/components/providers/sidebar-provider'
import { useZoom } from '@/components/providers/zoom-provider'
import {
  type AppPreset,
  PRESET_VERSION,
  type ThemeMode,
} from '@/lib/preset'

/**
 * Agrega o estado de todos os providers de aparência num único objeto
 * `AppPreset` e expõe `applyPreset` para aplicar um preset inteiro de uma vez
 * (usado pela importação manual e pela hidratação vinda do banco de dados).
 */
export function useAppPreset() {
  const { theme, setTheme } = useTheme()
  const { palette, setPalette, customColor, setCustomColor } = usePalette()
  const { radius, setRadius } = useRadius()
  const { shadow, setShadow } = useShadow()
  const { density, setDensity } = useDensity()
  const { zoom, setZoom } = useZoom()
  const {
    visibility: sidebar,
    setVisibility: setSidebar,
    style: sidebarStyle,
    setStyle: setSidebarStyle,
    mode: sidebarMode,
    setMode: setSidebarMode,
    menuEffect: sidebarMenuEffect,
    setMenuEffect: setSidebarMenuEffect,
    sidebarColor,
    setSidebarColor,
    customSidebarColor,
    setCustomSidebarColor,
    backgroundTone,
    setBackgroundTone,
    customBackgroundColor,
    setCustomBackgroundColor,
  } = useSidebar()
  const { iconSet, setIconSet } = useIconSet()

  const preset: AppPreset = {
    version: PRESET_VERSION,
    theme: (theme as ThemeMode) ?? 'system',
    palette,
    customColor,
    radius,
    shadow,
    density,
    zoom,
    sidebar,
    sidebarStyle,
    sidebarMode,
    sidebarMenuEffect,
    sidebarColor,
    customSidebarColor,
    backgroundTone,
    customBackgroundColor,
    iconSet,
  }

  const applyPreset = (next: AppPreset) => {
    setTheme(next.theme)
    setCustomColor(next.customColor, { activate: next.palette === 'custom' })
    if (next.palette !== 'custom') {
      setPalette(next.palette)
    }
    setRadius(next.radius)
    setShadow(next.shadow)
    setDensity(next.density)
    setZoom(next.zoom)
    setSidebar(next.sidebar)
    setSidebarStyle(next.sidebarStyle)
    setSidebarMode(next.sidebarMode)
    setSidebarMenuEffect(next.sidebarMenuEffect)
    setCustomSidebarColor(next.customSidebarColor, {
      activate: next.sidebarColor === 'custom',
    })
    if (next.sidebarColor !== 'custom') {
      setSidebarColor(next.sidebarColor)
    }
    setCustomBackgroundColor(next.customBackgroundColor, {
      activate: next.backgroundTone === 'custom',
    })
    if (next.backgroundTone !== 'custom') {
      setBackgroundTone(next.backgroundTone)
    }
    setIconSet(next.iconSet)
  }

  return { preset, applyPreset }
}
