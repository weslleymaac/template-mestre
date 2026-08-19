export type ShadowId = 'none' | 'subtle' | 'default' | 'medium' | 'strong'

export type ShadowPreset = {
  id: ShadowId
  name: string
  description: string
  /** valores aplicados às variáveis --shadow-sm / --shadow-md / --shadow-lg / --shadow-xl */
  sm: string
  md: string
  lg: string
  xl: string
}

export const DEFAULT_SHADOW: ShadowId = 'default'

/** Tom azulado suave — combina com fundos tipo #EBF0F5 (estilo Apple / dashboard). */
const c = '215 28% 18%'

/**
 * Sombras difusas e flutuantes (blur amplo + baixa opacidade).
 * Referência visual: cards brancos “elevados” sobre fundo cinza-azulado.
 */
export const SHADOW_PRESETS: ShadowPreset[] = [
  {
    id: 'none',
    name: 'Nenhuma',
    description: 'Sem sombras, interface plana',
    sm: 'none',
    md: 'none',
    lg: 'none',
    xl: 'none',
  },
  {
    id: 'subtle',
    name: 'Sutil',
    description: 'Sombras quase imperceptíveis',
    sm: `0 1px 3px hsl(${c} / 0.03), 0 4px 14px hsl(${c} / 0.04)`,
    md: `0 2px 6px hsl(${c} / 0.035), 0 8px 22px hsl(${c} / 0.05)`,
    lg: `0 4px 12px hsl(${c} / 0.04), 0 14px 36px hsl(${c} / 0.06)`,
    xl: `0 8px 20px hsl(${c} / 0.05), 0 24px 48px hsl(${c} / 0.07)`,
  },
  {
    id: 'default',
    name: 'Padrão',
    description: 'Profundidade equilibrada (recomendado)',
    sm: `0 2px 6px hsl(${c} / 0.04), 0 8px 24px hsl(${c} / 0.06), 0 16px 40px -4px hsl(${c} / 0.05)`,
    md: `0 4px 10px hsl(${c} / 0.05), 0 12px 32px hsl(${c} / 0.07), 0 24px 48px -6px hsl(${c} / 0.06)`,
    lg: `0 6px 16px hsl(${c} / 0.055), 0 18px 44px hsl(${c} / 0.08), 0 32px 64px -8px hsl(${c} / 0.07)`,
    xl: `0 10px 24px hsl(${c} / 0.06), 0 28px 56px hsl(${c} / 0.09), 0 40px 80px -10px hsl(${c} / 0.08)`,
  },
  {
    id: 'medium',
    name: 'Médio',
    description: 'Mais elevação e contraste',
    sm: `0 3px 8px hsl(${c} / 0.05), 0 10px 28px hsl(${c} / 0.08), 0 20px 48px -4px hsl(${c} / 0.06)`,
    md: `0 5px 14px hsl(${c} / 0.06), 0 16px 40px hsl(${c} / 0.09), 0 28px 56px -6px hsl(${c} / 0.07)`,
    lg: `0 8px 20px hsl(${c} / 0.07), 0 24px 52px hsl(${c} / 0.1), 0 40px 72px -8px hsl(${c} / 0.08)`,
    xl: `0 12px 28px hsl(${c} / 0.08), 0 32px 64px hsl(${c} / 0.12), 0 48px 96px -10px hsl(${c} / 0.09)`,
  },
  {
    id: 'strong',
    name: 'Forte',
    description: 'Sombras intensas e dramáticas',
    sm: `0 4px 12px hsl(${c} / 0.07), 0 14px 36px hsl(${c} / 0.1), 0 24px 56px -4px hsl(${c} / 0.08)`,
    md: `0 6px 18px hsl(${c} / 0.08), 0 20px 48px hsl(${c} / 0.12), 0 36px 72px -6px hsl(${c} / 0.09)`,
    lg: `0 10px 28px hsl(${c} / 0.09), 0 28px 64px hsl(${c} / 0.14), 0 48px 88px -8px hsl(${c} / 0.1)`,
    xl: `0 14px 36px hsl(${c} / 0.1), 0 40px 80px hsl(${c} / 0.16), 0 56px 112px -10px hsl(${c} / 0.12)`,
  },
]

export function getShadowPreset(id: ShadowId): ShadowPreset {
  return SHADOW_PRESETS.find((p) => p.id === id) ?? SHADOW_PRESETS[2]
}
