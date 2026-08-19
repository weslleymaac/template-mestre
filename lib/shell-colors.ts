import {
  contrastForeground,
  isLightColor,
  normalizeHex,
} from '@/lib/custom-palette'
import { PALETTES, type PresetPaletteId } from '@/lib/palettes'

/** Cor de fundo da barra lateral. */
export type SidebarColorId = 'neutral' | 'white' | PresetPaletteId | 'custom'

/** Tom do fundo principal da aplicação. */
export type BackgroundToneId = 'white' | 'neutral' | 'custom'

export type SidebarColorOption = {
  id: SidebarColorId
  label: string
  /** Cor exibida no seletor (swatch). */
  swatch: string
  /** Ícone especial em vez de swatch sólido (ex.: sol para branco). */
  icon?: 'sun' | 'custom'
}

export type BackgroundToneOption = {
  id: BackgroundToneId
  label: string
  value: string
  icon?: 'sun' | 'custom'
}

export const DEFAULT_SIDEBAR_COLOR: SidebarColorId = 'neutral'
export const DEFAULT_BACKGROUND_TONE: BackgroundToneId = 'white'
export const DEFAULT_CUSTOM_SIDEBAR_COLOR = '#0f766e'
export const DEFAULT_CUSTOM_BACKGROUND_COLOR = '#F3F4F6'

export const BACKGROUND_TONE_OPTIONS: BackgroundToneOption[] = [
  { id: 'white', label: 'Branco', value: '#FFFFFF', icon: 'sun' },
  { id: 'neutral', label: 'Neutro', value: '#F9FAFB' },
  {
    id: 'custom',
    label: 'Personalizada',
    value: DEFAULT_CUSTOM_BACKGROUND_COLOR,
    icon: 'custom',
  },
]

type SidebarSurface = {
  sidebar: string
  accent: string
  border: string
  /** Quando true, texto e ícones usam tons claros sobre o fundo sólido. */
  solid?: boolean
  foreground?: string
  accentForeground?: string
}

const NEUTRAL_SIDEBAR: SidebarSurface = {
  sidebar: '#F9FAFB',
  accent: '#EFEFEF',
  border: '#E5E5E5',
}

const WHITE_SIDEBAR: SidebarSurface = {
  sidebar: '#FFFFFF',
  accent: '#F5F5F5',
  border: '#EBEBEB',
}

/** Fundo sólido escuro por paleta — texto e ícones invertidos para claro. */
const PALETTE_SIDEBAR_SURFACES: Record<PresetPaletteId, SidebarSurface> = {
  emerald: {
    sidebar: 'oklch(0.36 0.11 162)',
    accent: 'oklch(1 0 0 / 0.12)',
    border: 'oklch(1 0 0 / 0.12)',
    solid: true,
    foreground: 'oklch(0.98 0 0)',
    accentForeground: 'oklch(0.98 0 0)',
  },
  blue: {
    sidebar: 'oklch(0.34 0.12 252)',
    accent: 'oklch(1 0 0 / 0.12)',
    border: 'oklch(1 0 0 / 0.12)',
    solid: true,
    foreground: 'oklch(0.98 0 0)',
    accentForeground: 'oklch(0.98 0 0)',
  },
  violet: {
    sidebar: 'oklch(0.33 0.14 295)',
    accent: 'oklch(1 0 0 / 0.12)',
    border: 'oklch(1 0 0 / 0.12)',
    solid: true,
    foreground: 'oklch(0.98 0 0)',
    accentForeground: 'oklch(0.98 0 0)',
  },
  orange: {
    sidebar: 'oklch(0.40 0.13 48)',
    accent: 'oklch(1 0 0 / 0.12)',
    border: 'oklch(1 0 0 / 0.12)',
    solid: true,
    foreground: 'oklch(0.98 0 0)',
    accentForeground: 'oklch(0.98 0 0)',
  },
  rose: {
    sidebar: 'oklch(0.36 0.14 16)',
    accent: 'oklch(1 0 0 / 0.12)',
    border: 'oklch(1 0 0 / 0.12)',
    solid: true,
    foreground: 'oklch(0.98 0 0)',
    accentForeground: 'oklch(0.98 0 0)',
  },
  slate: {
    sidebar: 'oklch(0.32 0.03 255)',
    accent: 'oklch(1 0 0 / 0.12)',
    border: 'oklch(1 0 0 / 0.12)',
    solid: true,
    foreground: 'oklch(0.98 0 0)',
    accentForeground: 'oklch(0.98 0 0)',
  },
  amber: {
    sidebar: 'oklch(0.42 0.12 85)',
    accent: 'oklch(1 0 0 / 0.12)',
    border: 'oklch(1 0 0 / 0.12)',
    solid: true,
    foreground: 'oklch(0.98 0 0)',
    accentForeground: 'oklch(0.98 0 0)',
  },
  cyan: {
    sidebar: 'oklch(0.37 0.11 200)',
    accent: 'oklch(1 0 0 / 0.12)',
    border: 'oklch(1 0 0 / 0.12)',
    solid: true,
    foreground: 'oklch(0.98 0 0)',
    accentForeground: 'oklch(0.98 0 0)',
  },
  fuchsia: {
    sidebar: 'oklch(0.36 0.14 330)',
    accent: 'oklch(1 0 0 / 0.12)',
    border: 'oklch(1 0 0 / 0.12)',
    solid: true,
    foreground: 'oklch(0.98 0 0)',
    accentForeground: 'oklch(0.98 0 0)',
  },
  lime: {
    sidebar: 'oklch(0.40 0.13 130)',
    accent: 'oklch(1 0 0 / 0.12)',
    border: 'oklch(1 0 0 / 0.12)',
    solid: true,
    foreground: 'oklch(0.98 0 0)',
    accentForeground: 'oklch(0.98 0 0)',
  },
  red: {
    sidebar: 'oklch(0.34 0.14 27)',
    accent: 'oklch(1 0 0 / 0.12)',
    border: 'oklch(1 0 0 / 0.12)',
    solid: true,
    foreground: 'oklch(0.98 0 0)',
    accentForeground: 'oklch(0.98 0 0)',
  },
  indigo: {
    sidebar: 'oklch(0.32 0.13 275)',
    accent: 'oklch(1 0 0 / 0.12)',
    border: 'oklch(1 0 0 / 0.12)',
    solid: true,
    foreground: 'oklch(0.98 0 0)',
    accentForeground: 'oklch(0.98 0 0)',
  },
}

export function getCustomSidebarSurface(hex: string): SidebarSurface {
  const color = normalizeHex(hex) ?? DEFAULT_CUSTOM_SIDEBAR_COLOR
  const foreground = contrastForeground(color)
  const light = isLightColor(color)
  return {
    sidebar: color,
    accent: light
      ? 'color-mix(in oklab, black 6%, transparent)'
      : 'oklch(1 0 0 / 0.12)',
    border: light
      ? 'color-mix(in oklab, black 10%, transparent)'
      : 'oklch(1 0 0 / 0.12)',
    solid: true,
    foreground,
    accentForeground: foreground,
  }
}

export const SIDEBAR_COLOR_OPTIONS: SidebarColorOption[] = [
  ...PALETTES.map((p) => ({
    id: p.id as SidebarColorId,
    label: p.name,
    swatch: p.swatch,
  })),
  {
    id: 'custom',
    label: 'Personalizada',
    swatch: DEFAULT_CUSTOM_SIDEBAR_COLOR,
    icon: 'custom' as const,
  },
  { id: 'neutral', label: 'Neutro (#F9FAFB)', swatch: '#F9FAFB' },
  { id: 'white', label: 'Branco', swatch: '#FFFFFF', icon: 'sun' as const },
]

export function isSidebarColorId(value: unknown): value is SidebarColorId {
  return SIDEBAR_COLOR_OPTIONS.some((o) => o.id === value)
}

export function isBackgroundToneId(value: unknown): value is BackgroundToneId {
  return BACKGROUND_TONE_OPTIONS.some((o) => o.id === value)
}

/**
 * Barra “sólida” (tratamento de hover claro) — false para neutro/branco
 * e para custom clara.
 */
export function isSolidSidebarColor(
  id: SidebarColorId,
  customHex?: string,
): boolean {
  if (id === 'neutral' || id === 'white') return false
  if (id === 'custom') {
    return !isLightColor(customHex ?? DEFAULT_CUSTOM_SIDEBAR_COLOR)
  }
  return true
}

export function getSidebarSurface(
  id: SidebarColorId,
  customHex = DEFAULT_CUSTOM_SIDEBAR_COLOR,
): SidebarSurface {
  if (id === 'neutral') return NEUTRAL_SIDEBAR
  if (id === 'white') return WHITE_SIDEBAR
  if (id === 'custom') return getCustomSidebarSurface(customHex)
  return PALETTE_SIDEBAR_SURFACES[id]
}

export function getBackgroundValue(
  id: BackgroundToneId,
  customHex = DEFAULT_CUSTOM_BACKGROUND_COLOR,
): string {
  if (id === 'custom') {
    return normalizeHex(customHex) ?? DEFAULT_CUSTOM_BACKGROUND_COLOR
  }
  return (
    BACKGROUND_TONE_OPTIONS.find((o) => o.id === id)?.value ?? '#FFFFFF'
  )
}

const SHELL_CSS_VARS = [
  '--sidebar',
  '--sidebar-accent',
  '--sidebar-border',
  '--sidebar-foreground',
  '--sidebar-accent-foreground',
  '--background',
] as const

export type ShellColorOptions = {
  customSidebarColor?: string
  customBackgroundColor?: string
}

/** Aplica cores da barra lateral e do fundo via CSS variables no :root. */
export function applyShellColors(
  sidebarColor: SidebarColorId,
  backgroundTone: BackgroundToneId,
  isDark: boolean,
  options: ShellColorOptions = {},
) {
  const root = document.documentElement.style

  if (isDark) {
    for (const key of SHELL_CSS_VARS) root.removeProperty(key)
    return
  }

  const surface = getSidebarSurface(
    sidebarColor,
    options.customSidebarColor ?? DEFAULT_CUSTOM_SIDEBAR_COLOR,
  )
  root.setProperty('--sidebar', surface.sidebar)
  root.setProperty('--sidebar-accent', surface.accent)
  root.setProperty('--sidebar-border', surface.border)

  if (surface.solid && surface.foreground && surface.accentForeground) {
    root.setProperty('--sidebar-foreground', surface.foreground)
    root.setProperty('--sidebar-accent-foreground', surface.accentForeground)
  } else {
    root.removeProperty('--sidebar-foreground')
    root.removeProperty('--sidebar-accent-foreground')
  }

  root.setProperty(
    '--background',
    getBackgroundValue(
      backgroundTone,
      options.customBackgroundColor ?? DEFAULT_CUSTOM_BACKGROUND_COLOR,
    ),
  )
}
