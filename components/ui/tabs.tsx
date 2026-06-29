'use client'

import { motion } from 'motion/react'
import {
  createContext,
  useContext,
  useId,
  useState,
  type ReactNode,
} from 'react'
import { cn } from '@/lib/utils'

type TabsContextValue = {
  value: string
  setValue: (v: string) => void
  groupId: string
}

const TabsContext = createContext<TabsContextValue | null>(null)

function useTabs() {
  const ctx = useContext(TabsContext)
  if (!ctx) throw new Error('Tabs.* deve ser usado dentro de <Tabs>')
  return ctx
}

export function Tabs({
  defaultValue,
  value: controlled,
  onValueChange,
  className,
  children,
}: {
  defaultValue: string
  value?: string
  onValueChange?: (v: string) => void
  className?: string
  children: ReactNode
}) {
  const [internal, setInternal] = useState(defaultValue)
  const value = controlled ?? internal
  const groupId = useId()

  const setValue = (v: string) => {
    if (controlled === undefined) setInternal(v)
    onValueChange?.(v)
  }

  return (
    <TabsContext.Provider value={{ value, setValue, groupId }}>
      <div className={cn('flex flex-col gap-4', className)}>{children}</div>
    </TabsContext.Provider>
  )
}

export function TabsList({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return (
    <div
      role="tablist"
      className={cn(
        'inline-flex items-center gap-1 rounded-xl bg-muted p-1 text-muted-foreground',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function TabsTrigger({
  value,
  className,
  children,
}: {
  value: string
  className?: string
  children: ReactNode
}) {
  const { value: active, setValue, groupId } = useTabs()
  const selected = active === value

  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      onClick={() => setValue(value)}
      className={cn(
        'relative inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-sm whitespace-nowrap transition-colors outline-none',
        'focus-visible:ring-2 focus-visible:ring-ring/50',
        selected
          ? 'font-semibold text-primary'
          : 'font-medium hover:text-foreground',
        className,
      )}
    >
      {selected && (
        <motion.span
          layoutId={`tab-indicator-${groupId}`}
          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
          className="absolute inset-0 -z-10 rounded-lg bg-background shadow-sm"
        />
      )}
      {children}
    </button>
  )
}

export function TabsContent({
  value,
  className,
  children,
}: {
  value: string
  className?: string
  children: ReactNode
}) {
  const { value: active } = useTabs()
  if (active !== value) return null

  return (
    <motion.div
      role="tabpanel"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className={cn('text-sm', className)}
    >
      {children}
    </motion.div>
  )
}
