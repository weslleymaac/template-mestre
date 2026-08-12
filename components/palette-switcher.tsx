'use client'

import { Check, Plus } from '@/components/ui/icons'
import { motion } from 'motion/react'
import { useRef } from 'react'
import { usePalette } from '@/components/providers/palette-provider'
import { PALETTES } from '@/lib/palettes'
import { cn } from '@/lib/utils'

export function PaletteSwitcher({
  variant = 'grid',
  className,
}: {
  variant?: 'grid' | 'dots'
  className?: string
}) {
  const { palette, setPalette, customColor, setCustomColor } = usePalette()
  const colorInputRef = useRef<HTMLInputElement>(null)

  function openCustomPicker() {
    // Ativa a cor atual e abre o seletor nativo para ajustar.
    setCustomColor(customColor)
    colorInputRef.current?.click()
  }

  if (variant === 'dots') {
    return (
      <div className={cn('flex flex-wrap items-center gap-1.5', className)}>
        {PALETTES.map((p) => (
          <button
            key={p.id}
            type="button"
            aria-label={`Paleta ${p.name}`}
            onClick={() => setPalette(p.id)}
            style={{ backgroundColor: p.swatch }}
            className={cn(
              'size-5 rounded-full ring-offset-2 ring-offset-background transition-all hover:scale-110',
              palette === p.id && 'ring-2 ring-foreground',
            )}
          />
        ))}

        <button
          type="button"
          aria-label="Cor personalizada"
          title="Personalizar cor"
          onClick={openCustomPicker}
          className={cn(
            'relative grid size-5 place-items-center overflow-hidden rounded-full ring-offset-2 ring-offset-background transition-all hover:scale-110',
            palette === 'custom'
              ? 'ring-2 ring-foreground'
              : 'border border-dashed border-foreground/35 bg-background',
          )}
          style={
            palette === 'custom' ? { backgroundColor: customColor } : undefined
          }
        >
          {palette !== 'custom' && (
            <Plus className="size-3 text-muted-foreground" strokeWidth={2.5} />
          )}
        </button>
        <input
          ref={colorInputRef}
          type="color"
          value={customColor}
          onChange={(e) => setCustomColor(e.target.value)}
          className="sr-only"
          tabIndex={-1}
          aria-hidden
        />
      </div>
    )
  }

  return (
    <div
      className={cn(
        'grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6',
        className,
      )}
    >
      {PALETTES.map((p) => {
        const active = palette === p.id
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => setPalette(p.id)}
            className={cn(
              'group relative flex flex-col items-center gap-3 rounded-2xl border bg-card p-4 text-sm transition-all',
              active
                ? 'border-primary ring-3 ring-ring/20'
                : 'border-border hover:border-ring/50',
            )}
          >
            <span
              className="grid size-12 place-items-center rounded-full shadow-sm"
              style={{ backgroundColor: p.swatch }}
            >
              {active && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-white"
                >
                  <Check className="size-5" strokeWidth={3} />
                </motion.span>
              )}
            </span>
            <span className="font-medium">{p.name}</span>
          </button>
        )
      })}

      <button
        type="button"
        onClick={openCustomPicker}
        className={cn(
          'group relative flex flex-col items-center gap-3 rounded-2xl border bg-card p-4 text-sm transition-all',
          palette === 'custom'
            ? 'border-primary ring-3 ring-ring/20'
            : 'border-border border-dashed hover:border-ring/50',
        )}
      >
        <span
          className="grid size-12 place-items-center rounded-full shadow-sm"
          style={{
            background:
              palette === 'custom'
                ? customColor
                : 'conic-gradient(from 180deg, #ef4444, #eab308, #22c55e, #06b6d4, #3b82f6, #a855f7, #ef4444)',
          }}
        >
          {palette === 'custom' ? (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-white"
            >
              <Check className="size-5" strokeWidth={3} />
            </motion.span>
          ) : (
            <Plus className="size-5 text-white drop-shadow" strokeWidth={2.5} />
          )}
        </span>
        <span className="font-medium">Personalizada</span>
        <input
          ref={colorInputRef}
          type="color"
          value={customColor}
          onChange={(e) => setCustomColor(e.target.value)}
          className="sr-only"
          tabIndex={-1}
          aria-hidden
        />
      </button>
    </div>
  )
}
