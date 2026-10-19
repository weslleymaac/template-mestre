import type { IconName } from '@/lib/icon-set'

export type NavItem = {
  label: string
  href: string
  icon: IconName
  description?: string
}

export type NavSection = {
  /** Título da seção (ex.: "Menu principal"). Omita para itens sem cabeçalho. */
  title?: string
  items: NavItem[]
}

export const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Menu principal',
    items: [
      {
        label: 'Análise de escala',
        href: '/analise-de-escala',
        icon: 'analytics',
        description: 'Preenchimento dos dados da escala 5x2',
      },
      {
        label: 'Admin',
        href: '/admin',
        icon: 'settings',
        description: 'Informações do banco de dados',
      },
    ],
  },
]

/** Lista achatada de todos os itens (útil para estado ativo e buscas). */
export const NAV_ITEMS: NavItem[] = NAV_SECTIONS.flatMap((s) => s.items)
