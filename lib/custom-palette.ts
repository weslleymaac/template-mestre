/** Cor personalizada padrão (teal). */
export const DEFAULT_CUSTOM_COLOR = '#0d9488'

const CUSTOM_VARS = [
  '--primary',
  '--primary-foreground',
  '--primary-soft',
  '--ring',
  '--sidebar-primary',
  '--sidebar-ring',
  '--chart-1',
  '--chart-2',
  '--chart-3',
  '--chart-4',
  '--chart-5',
] as const

function parseHex(hex: string): { r: number; g: number; b: number } | null {
  const raw = hex.trim().replace(/^#/, '')
  const full =
    raw.length === 3
      ? raw
          .split('')
          .map((c) => c + c)
          .join('')
      : raw
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  }
}

function srgbChannel(c: number) {
  const v = c / 255
  return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
}

/** Texto claro ou escuro conforme o contraste da cor. */
export function contrastForeground(hex: string): string {
  const rgb = parseHex(hex)
  if (!rgb) return 'oklch(0.99 0 0)'
  const lum =
    0.2126 * srgbChannel(rgb.r) +
    0.7152 * srgbChannel(rgb.g) +
    0.0722 * srgbChannel(rgb.b)
  return lum > 0.55 ? 'oklch(0.21 0.01 250)' : 'oklch(0.99 0 0)'
}

export function normalizeHex(hex: string): string | null {
  const rgb = parseHex(hex)
  if (!rgb) return null
  const to = (n: number) => n.toString(16).padStart(2, '0')
  return `#${to(rgb.r)}${to(rgb.g)}${to(rgb.b)}`
}

export function isValidHex(hex: string): boolean {
  return normalizeHex(hex) != null
}

/** Aplica a paleta custom via CSS variables inline no :root. */
export function applyCustomPalette(hex: string, isDark = false) {
  const color = normalizeHex(hex) ?? DEFAULT_CUSTOM_COLOR
  const root = document.documentElement.style
  const soft = isDark
    ? `color-mix(in oklab, ${color} 28%, black)`
    : `color-mix(in oklab, ${color} 14%, white)`

  root.setProperty('--primary', color)
  root.setProperty('--primary-foreground', contrastForeground(color))
  root.setProperty('--primary-soft', soft)
  root.setProperty('--ring', color)
  root.setProperty('--sidebar-primary', color)
  root.setProperty('--sidebar-ring', color)
  root.setProperty('--chart-1', color)
  root.setProperty(
    '--chart-2',
    `color-mix(in oklab, ${color} 75%, oklch(0.75 0.12 200))`,
  )
  root.setProperty(
    '--chart-3',
    `color-mix(in oklab, ${color} 70%, oklch(0.55 0.14 280))`,
  )
  root.setProperty(
    '--chart-4',
    `color-mix(in oklab, ${color} 65%, oklch(0.8 0.12 140))`,
  )
  root.setProperty(
    '--chart-5',
    `color-mix(in oklab, ${color} 60%, oklch(0.5 0.1 320))`,
  )
}

/** Remove as variáveis inline da paleta custom (volta às regras CSS). */
export function clearCustomPalette() {
  const root = document.documentElement.style
  for (const key of CUSTOM_VARS) root.removeProperty(key)
}
