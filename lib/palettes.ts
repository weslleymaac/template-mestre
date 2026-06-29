export type PaletteId =
  | 'emerald'
  | 'blue'
  | 'violet'
  | 'orange'
  | 'rose'
  | 'slate'

export type Palette = {
  id: PaletteId
  name: string
  /** cor de referência usada para o "swatch" principal no seletor */
  swatch: string
  /** amostras de cores (chart-1..3) para preview no card de paleta */
  preview: string[]
}

export const PALETTES: Palette[] = [
  {
    id: 'emerald',
    name: 'Esmeralda',
    swatch: 'oklch(0.62 0.15 162)',
    preview: ['oklch(0.62 0.15 162)', 'oklch(0.7 0.13 180)', 'oklch(0.78 0.14 140)'],
  },
  {
    id: 'blue',
    name: 'Azul',
    swatch: 'oklch(0.58 0.17 252)',
    preview: ['oklch(0.58 0.17 252)', 'oklch(0.68 0.14 220)', 'oklch(0.6 0.15 280)'],
  },
  {
    id: 'violet',
    name: 'Violeta',
    swatch: 'oklch(0.56 0.2 295)',
    preview: ['oklch(0.56 0.2 295)', 'oklch(0.65 0.18 320)', 'oklch(0.6 0.16 270)'],
  },
  {
    id: 'orange',
    name: 'Laranja',
    swatch: 'oklch(0.67 0.17 48)',
    preview: ['oklch(0.67 0.17 48)', 'oklch(0.72 0.16 70)', 'oklch(0.62 0.18 30)'],
  },
  {
    id: 'rose',
    name: 'Rosa',
    swatch: 'oklch(0.62 0.22 16)',
    preview: ['oklch(0.62 0.22 16)', 'oklch(0.68 0.18 350)', 'oklch(0.6 0.19 30)'],
  },
  {
    id: 'slate',
    name: 'Grafite',
    swatch: 'oklch(0.44 0.03 255)',
    preview: ['oklch(0.44 0.03 255)', 'oklch(0.58 0.03 255)', 'oklch(0.68 0.03 255)'],
  },
]

export const DEFAULT_PALETTE: PaletteId = 'emerald'
