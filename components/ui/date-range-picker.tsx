'use client'

import { AnimatePresence, motion } from 'motion/react'
import { CalendarDays } from '@/components/ui/icons'
import { useEffect, useRef, useState } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { useClickOutside } from '@/hooks/use-click-outside'
import {
  DATE_PRESETS,
  formatRange,
  getPresetRange,
  type DatePresetId,
  type DateRange,
} from '@/lib/date-presets'
import { cn } from '@/lib/utils'

type DateRangePickerProps = {
  value?: { preset: DatePresetId; range: DateRange }
  onChange?: (value: { preset: DatePresetId; range: DateRange }) => void
  className?: string
}

export function DateRangePicker({
  value,
  onChange,
  className,
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false)
  const [internal, setInternal] = useState<{
    preset: DatePresetId
    range: DateRange
  }>(() => value ?? { preset: 'last7', range: getPresetRange('last7') })

  // estado de rascunho enquanto o popover está aberto
  const [draftPreset, setDraftPreset] = useState<DatePresetId>(internal.preset)
  const [draftRange, setDraftRange] = useState<Partial<DateRange>>(
    internal.range,
  )

  const ref = useRef<HTMLDivElement>(null)
  const [alignRight, setAlignRight] = useState(false)
  useClickOutside(ref, () => setOpen(false), open)

  // ao abrir, sincroniza o rascunho e decide o alinhamento conforme o espaço
  useEffect(() => {
    if (open) {
      const sel = value ?? internal
      setDraftPreset(sel.preset)
      setDraftRange(sel.range)

      // mede o espaço à direita do gatilho; se o popover (~560px) não couber,
      // alinha pela direita para não estourar a tela
      const rect = ref.current?.getBoundingClientRect()
      if (rect) {
        const popoverWidth = Math.min(window.innerWidth * 0.92, 560)
        setAlignRight(rect.left + popoverWidth > window.innerWidth - 8)
      }
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  const selected = value ?? internal
  const currentLabel =
    DATE_PRESETS.find((p) => p.id === selected.preset)?.label ?? 'Período'

  function selectPreset(id: DatePresetId) {
    setDraftPreset(id)
    if (id !== 'custom') {
      setDraftRange(getPresetRange(id))
    }
  }

  function selectDate(date: Date) {
    setDraftPreset('custom')
    setDraftRange((prev) => {
      // sem início ou intervalo já completo → começa um novo
      if (!prev.from || (prev.from && prev.to)) {
        return { from: date, to: undefined }
      }
      // já tem início → define o fim (ordenando)
      if (date.getTime() < prev.from.getTime()) {
        return { from: date, to: prev.from }
      }
      return { from: prev.from, to: date }
    })
  }

  function apply() {
    if (!draftRange.from) return
    const to = draftRange.to ?? draftRange.from
    const from = new Date(draftRange.from)
    from.setHours(0, 0, 0, 0)
    const end = new Date(to)
    end.setHours(23, 59, 59, 999)
    const next = { preset: draftPreset, range: { from, to: end } }
    setInternal(next)
    onChange?.(next)
    setOpen(false)
  }

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex h-10 items-center gap-2 rounded-xl border border-input bg-background px-3.5 text-sm shadow-sm transition-all outline-none',
          'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/25',
          open && 'border-ring ring-3 ring-ring/25',
        )}
      >
        <CalendarDays className="size-4 shrink-0 text-muted-foreground" />
        <span className="font-medium">{currentLabel}</span>
        <span className="hidden text-muted-foreground sm:inline">
          · {formatRange(selected.range)}
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className={cn(
              'absolute z-50 mt-2 flex w-[min(92vw,560px)] flex-col overflow-hidden rounded-2xl border border-border bg-popover shadow-xl sm:flex-row',
              alignRight ? 'right-0' : 'left-0',
            )}
          >
            {/* Presets */}
            <div className="flex max-h-72 shrink-0 flex-row gap-1 overflow-x-auto border-b border-border p-2 sm:max-h-none sm:w-44 sm:flex-col sm:overflow-y-auto sm:border-b-0 sm:border-r">
              {DATE_PRESETS.map((preset) => {
                const isActive = draftPreset === preset.id
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => selectPreset(preset.id)}
                    className={cn(
                      'shrink-0 rounded-lg px-3 py-2 text-left text-sm whitespace-nowrap transition-colors',
                      isActive
                        ? 'bg-primary-soft font-medium text-primary'
                        : 'text-foreground hover:bg-muted',
                    )}
                  >
                    {preset.label}
                  </button>
                )
              })}
            </div>

            {/* Calendário */}
            <div className="flex flex-1 flex-col p-3">
              <Calendar
                defaultMonth={draftRange.from ?? new Date()}
                range={draftRange}
                onSelectDate={selectDate}
              />
              <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                <span className="text-xs text-muted-foreground">
                  {draftRange.from
                    ? formatRange({
                        from: draftRange.from,
                        to: draftRange.to ?? draftRange.from,
                      })
                    : 'Selecione as datas'}
                </span>
                <button
                  type="button"
                  onClick={apply}
                  disabled={!draftRange.from}
                  className="h-9 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                  Aplicar
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
