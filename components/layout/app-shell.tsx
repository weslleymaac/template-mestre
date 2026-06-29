'use client'

import { Settings2 } from '@/components/ui/icons'
import { AnimatePresence, motion } from 'motion/react'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { PresetPanel } from '@/components/pages/preset-panel'
import { PaletteSwitcher } from '@/components/palette-switcher'
import { useSidebar } from '@/components/providers/sidebar-provider'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { useToast } from '@/components/ui/toast'
import { useClickOutside } from '@/hooks/use-click-outside'
import { NAV_ITEMS, NAV_SECTIONS } from '@/lib/nav'
import { cn } from '@/lib/utils'

const FLOAT_INSET = 12
// Margem (lateral/vertical) da barra flutuante no modo compacto — um pouco
// maior, para deixar mais respiro em cima, embaixo e à esquerda.
const COMPACT_INSET = 16

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)
  const [presetOpen, setPresetOpen] = useState(false)
  // Item ativo: como é uma SPA de uma página, o Painel fica sempre ativo.
  const [active, setActive] = useState(NAV_ITEMS[0]?.href ?? '/')
  const { visibility, style, mode } = useSidebar()
  // "visible" = barra fixa no desktop; "hidden" = sempre atrás do menu sanduíche.
  const sidebarFixed = visibility === 'visible'
  const floating = style === 'floating'
  // Compacto só existe no estilo flutuante: trilho fino só com ícones.
  const compact = floating && mode === 'compact'

  // Detecta o breakpoint lg (>=1024px) para compensar a margem da sidebar fixa.
  useEffect(() => {
    const mql = window.matchMedia('(min-width: 1024px)')
    const update = () => setIsDesktop(mql.matches)
    update()
    mql.addEventListener('change', update)
    return () => mql.removeEventListener('change', update)
  }, [])

  // No modo compacto a barra é um trilho estreito com margem lateral um
  // pouco maior; nos demais, mantém a largura padrão.
  const sidebarWidth = compact ? 72 : collapsed ? 76 : 264
  const leftGutter = compact ? COMPACT_INSET : FLOAT_INSET
  const contentMargin =
    isDesktop && sidebarFixed
      ? sidebarWidth + (floating ? leftGutter * 2 : 0)
      : 0

  return (
    <div className="min-h-svh bg-background">
      {/* Sidebar desktop (fixa) — só no modo "visível" */}
      {sidebarFixed && (
        <motion.aside
          animate={{ width: sidebarWidth }}
          transition={{ type: 'spring', stiffness: 320, damping: 34 }}
          className={cn(
            'fixed left-0 z-40 hidden flex-col bg-sidebar lg:flex',
            floating
              ? compact
                ? // ~70% da altura, centralizado vertical, com respiro em cima
                  // e embaixo. Sem overflow-hidden: os itens expandem para fora.
                  'left-4 top-1/2 h-[70svh] -translate-y-1/2 rounded-2xl border border-sidebar-border shadow-lg'
                : 'inset-y-3 left-3 overflow-hidden rounded-2xl border border-sidebar-border shadow-lg'
              : 'inset-y-0 h-svh border-r border-sidebar-border',
          )}
        >
          <SidebarContent
            collapsed={collapsed}
            floating={floating}
            compact={compact}
            active={active}
            onNavigate={setActive}
            onToggleCollapse={() => setCollapsed((v) => !v)}
          />
        </motion.aside>
      )}

      {/* Drawer (mobile + modo oculto no desktop) */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm',
                sidebarFixed && 'lg:hidden',
              )}
            />
            <motion.aside
              initial={{ x: '-110%' }}
              animate={{ x: 0 }}
              exit={{ x: '-110%' }}
              transition={{ type: 'spring', stiffness: 360, damping: 38 }}
              className={cn(
                'fixed left-0 z-50 flex w-72 flex-col bg-sidebar',
                floating
                  ? 'inset-y-3 left-3 overflow-hidden rounded-2xl border border-sidebar-border shadow-xl'
                  : 'inset-y-0 border-r border-sidebar-border',
                sidebarFixed && 'lg:hidden',
              )}
            >
              <SidebarContent
                collapsed={false}
                floating={floating}
                compact={false}
                active={active}
                onNavigate={(href) => {
                  setActive(href)
                  setMobileOpen(false)
                }}
                onClose={() => setMobileOpen(false)}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Conteúdo */}
      <motion.div
        animate={{ marginLeft: contentMargin }}
        transition={{ type: 'spring', stiffness: 320, damping: 34 }}
        className="flex min-h-svh min-w-0 flex-col"
      >
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md sm:px-6">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menu"
            className={cn(
              'grid size-9 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
              sidebarFixed && 'lg:hidden',
            )}
          >
            <Icon name="menu" className="size-5" />
          </button>

          <div className="ml-auto flex items-center gap-2">
            <PaletteSwitcher variant="dots" className="hidden sm:flex" />
            <ThemeToggle />
            <Button
              variant="outline"
              size="default"
              onClick={() => setPresetOpen(true)}
            >
              <Settings2 className="size-4" />
              <span className="hidden sm:inline">Preset</span>
            </Button>
          </div>
        </header>

        <main className="flex-1">{children}</main>
      </motion.div>

      <PresetPanel open={presetOpen} onClose={() => setPresetOpen(false)} />
    </div>
  )
}

function SidebarContent({
  collapsed,
  floating,
  compact = false,
  active,
  onNavigate,
  onToggleCollapse,
  onClose,
}: {
  collapsed: boolean
  floating: boolean
  compact?: boolean
  active: string
  onNavigate: (href: string) => void
  onToggleCollapse?: () => void
  onClose?: () => void
}) {
  if (compact) {
    return (
      <CompactSidebarContent active={active} onNavigate={onNavigate} />
    )
  }

  return (
    <div className="flex h-full flex-col">
      {/* Traffic lights — só no estilo flutuante (igual ao mock) */}
      {floating && !collapsed && (
        <div className="flex items-center gap-1.5 px-4 pt-4" aria-hidden>
          <span className="size-3 rounded-full bg-[#ff5f57]" />
          <span className="size-3 rounded-full bg-[#febc2e]" />
          <span className="size-3 rounded-full bg-[#28c840]" />
        </div>
      )}

      {/* Marca */}
      <div
        className={cn(
          'flex',
          floating ? 'border-b-0' : 'border-b border-sidebar-border',
          collapsed
            ? 'flex-col items-center gap-2 py-3'
            : 'h-16 items-center gap-3 px-4',
        )}
      >
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
          <Icon name="logo" className="size-5" />
        </span>
        {!collapsed && (
          <span className="font-heading text-base font-semibold tracking-tight text-sidebar-foreground">
            Nova UI
          </span>
        )}
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar menu"
            className="ml-auto grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            <Icon name="close" className="size-4" />
          </button>
        ) : (
          onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
              className={cn(
                'grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground',
                collapsed ? 'size-9' : 'ml-auto',
              )}
            >
              <Icon
                name={collapsed ? 'expand' : 'collapse'}
                className="size-4"
              />
            </button>
          )
        )}
      </div>

      {/* Navegação */}
      <nav
        className={cn(
          'flex flex-1 flex-col gap-1 overflow-y-auto p-3',
          collapsed && 'items-center',
        )}
      >
        {NAV_SECTIONS.map((section, sectionIndex) => (
          <div
            key={section.title ?? sectionIndex}
            className={cn(
              'flex w-full flex-col gap-1',
              collapsed && 'items-center',
              sectionIndex > 0 && (collapsed ? 'mt-3' : 'mt-4'),
            )}
          >
            {section.title &&
              (collapsed ? (
                sectionIndex > 0 && (
                  <div className="my-1 h-px w-6 bg-sidebar-border" />
                )
              ) : (
                <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {section.title}
                </p>
              ))}
            {section.items.map((item) => {
              const isActive = active === item.href
              return (
                <button
                  key={item.href}
                  type="button"
                  onClick={() => onNavigate(item.href)}
                  title={collapsed ? item.label : undefined}
                  aria-label={collapsed ? item.label : undefined}
                  className={cn(
                    'flex items-center text-sm font-medium transition-colors',
                    collapsed
                      ? 'size-10 justify-center rounded-xl'
                      : 'w-full gap-3 rounded-xl px-3 py-2.5',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground',
                  )}
                >
                  <Icon name={item.icon} className="size-5 shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </button>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Perfil */}
      <ProfileFooter collapsed={collapsed} floating={floating} />
    </div>
  )
}

/**
 * Trilho compacto: só ícones. Ao passar o mouse, o item sob o cursor
 * expande para a direita (sobre o conteúdo) revelando o rótulo, com efeito
 * de "over". Como cada item reage ao próprio hover, ao mover o mouse entre
 * eles o anterior se retrai e o atual se expande naturalmente.
 */
function CompactSidebarContent({
  active,
  onNavigate,
}: {
  active: string
  onNavigate: (href: string) => void
}) {
  return (
    <div className="flex h-full flex-col">
      {/* Marca — só o logo, centralizado */}
      <div className="flex items-center justify-center py-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
          <Icon name="logo" className="size-5" />
        </span>
      </div>

      {/* Navegação (overflow visível para os itens expandirem para fora) */}
      <nav className="flex flex-1 flex-col gap-1 overflow-visible px-3 py-2">
        {NAV_SECTIONS.map((section, sectionIndex) => (
          <div
            key={section.title ?? sectionIndex}
            className="flex w-full flex-col gap-1"
          >
            {section.title && sectionIndex > 0 && (
              <div className="my-1 ml-2 h-px w-6 bg-sidebar-border" />
            )}
            {section.items.map((item) => {
              const isActive = active === item.href
              return (
                <button
                  key={item.href}
                  type="button"
                  onClick={() => onNavigate(item.href)}
                  aria-label={item.label}
                  className={cn(
                    // pílula opaca elevada ao expandir: borda + sombra para
                    // se destacar sobre o conteúdo claro atrás dela
                    'group relative flex h-10 w-10 items-center overflow-hidden rounded-xl border border-transparent shadow-none transition-[width,background-color,border-color,box-shadow,color] duration-200 ease-out hover:z-50 hover:w-56 hover:border-sidebar-border hover:bg-sidebar hover:shadow-lg',
                    isActive
                      ? 'bg-primary-soft text-primary hover:bg-primary-soft'
                      : 'text-sidebar-foreground/80 hover:text-sidebar-foreground',
                  )}
                >
                  <span className="grid size-10 shrink-0 place-items-center">
                    <Icon name={item.icon} className="size-5" />
                  </span>
                  <span className="whitespace-nowrap pr-3 text-sm font-medium opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                    {item.label}
                  </span>
                </button>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Perfil — avatar somente (layout recolhido) */}
      <ProfileFooter collapsed floating />
    </div>
  )
}

function ProfileFooter({
  collapsed,
  floating,
}: {
  collapsed: boolean
  floating: boolean
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  useClickOutside(ref, () => setOpen(false), open)

  const menuItems = [
    { label: 'Meu perfil', icon: 'profile' as const },
    { label: 'Configurações da conta', icon: 'profileSettings' as const },
  ]

  const handleAction = (label: string) => {
    setOpen(false)
    toast({ title: label, description: 'Ação de exemplo do template.' })
  }

  return (
    <div
      className={cn(
        'relative p-3',
        floating ? 'border-t-0' : 'border-t border-sidebar-border',
      )}
      ref={ref}
    >
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            role="menu"
            className={cn(
              'absolute bottom-full z-50 mb-2 overflow-hidden rounded-xl border border-border bg-popover p-1 shadow-app-md',
              collapsed ? 'left-3 w-56' : 'inset-x-3',
            )}
          >
            {menuItems.map((item) => (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                onClick={() => handleAction(item.label)}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-popover-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <Icon
                  name={item.icon}
                  className="size-4 shrink-0 text-muted-foreground"
                />
                <span className="truncate">{item.label}</span>
              </button>
            ))}
            <div className="my-1 h-px bg-border" />
            <button
              type="button"
              role="menuitem"
              onClick={() => handleAction('Sair')}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-destructive transition-colors hover:bg-destructive/10"
            >
              <Icon name="logout" className="size-4 shrink-0" />
              <span className="truncate">Sair</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={cn('flex items-center gap-1', collapsed && 'justify-center')}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label="Abrir menu de perfil"
          className={cn(
            'flex min-w-0 flex-1 items-center gap-3 rounded-xl p-2 transition-colors hover:bg-sidebar-accent',
            collapsed && 'flex-none p-0',
          )}
        >
          <Image
            src="/avatar.png"
            alt="Foto de perfil de Ana Martins"
            width={36}
            height={36}
            className="size-9 shrink-0 rounded-full object-cover"
          />
          {!collapsed && (
            <div className="min-w-0 text-left">
              <p className="truncate text-sm font-medium text-sidebar-foreground">
                Ana Martins
              </p>
              <p className="truncate text-xs text-muted-foreground">
                Administradora
              </p>
            </div>
          )}
        </button>
        {!collapsed && (
          <button
            type="button"
            onClick={() => handleAction('Sair')}
            aria-label="Sair"
            title="Sair"
            className="grid size-9 shrink-0 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <Icon name="logout" className="size-[18px]" />
          </button>
        )}
      </div>
    </div>
  )
}
