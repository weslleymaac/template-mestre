'use client'

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react'
import { ChevronsUpDown, Pipette } from '@/components/ui/icons'
import { FloatingPanel } from '@/components/ui/floating-panel'
import { Input } from '@/components/ui/input'
import {
  hexToHsv,
  hexToRgb,
  hsvToHex,
  hueToCss,
  rgbToHex,
  type Hsv,
} from '@/lib/color'
import { normalizeHex } from '@/lib/custom-palette'
import { cn } from '@/lib/utils'

type Format = 'rgb' | 'hex'

type ColorPickerProps = {
  value: string
  onChange: (hex: string) => void
  open: boolean
  onOpenChange: (open: boolean) => void
  anchorRef: RefObject<HTMLElement | null>
}

export function ColorPicker({
  value,
  onChange,
  open,
  onOpenChange,
  anchorRef,
}: ColorPickerProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const [hsv, setHsv] = useState<Hsv>(() => hexToHsv(value))
  const [format, setFormat] = useState<Format>('rgb')
  const [eyedropperSupported, setEyedropperSupported] = useState(false)

  useEffect(() => {
    setEyedropperSupported(
      typeof window !== 'undefined' && 'EyeDropper' in window,
    )
  }, [])

  useEffect(() => {
    if (!open) return
    setHsv(hexToHsv(value))
  }, [open, value])

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node
      if (panelRef.current?.contains(target)) return
      if (anchorRef.current?.contains(target)) return
      onOpenChange(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onOpenChange(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, onOpenChange, anchorRef])

  const commit = useCallback(
    (next: Hsv) => {
      setHsv(next)
      onChange(hsvToHex(next))
    },
    [onChange],
  )

  const rgb = hexToRgb(hsvToHex(hsv)) ?? { r: 255, g: 255, b: 255 }
  const hex = hsvToHex(hsv)

  async function pickFromScreen() {
    type EyeDropperCtor = new () => {
      open: () => Promise<{ sRGBHex: string }>
    }
    const EyeDropper = (
      window as Window & { EyeDropper?: EyeDropperCtor }
    ).EyeDropper
    if (!EyeDropper) return
    try {
      const result = await new EyeDropper().open()
      const next = normalizeHex(result.sRGBHex)
      if (!next) return
      commit(hexToHsv(next))
    } catch {
      // usuário cancelou
    }
  }

  function updateChannel(channel: 'r' | 'g' | 'b', raw: string) {
    const n = Number(raw)
    if (!Number.isFinite(n)) return
    const next = {
      r: channel === 'r' ? n : rgb.r,
      g: channel === 'g' ? n : rgb.g,
      b: channel === 'b' ? n : rgb.b,
    }
    commit(hexToHsv(rgbToHex(next.r, next.g, next.b)))
  }

  function updateHex(raw: string) {
    const next = normalizeHex(raw.startsWith('#') ? raw : `#${raw}`)
    if (!next) return
    commit(hexToHsv(next))
  }

  return (
    <FloatingPanel
      open={open}
      anchorRef={anchorRef}
      panelRef={panelRef}
      width={248}
      offset={8}
      className="z-[80] overflow-visible rounded-2xl p-3 shadow-xl"
    >
      <div className="flex flex-col gap-3">
        <SaturationValueArea hsv={hsv} onChange={commit} />

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            aria-label="Capturar cor da tela"
            title={
              eyedropperSupported
                ? 'Pincel — capturar cor da tela'
                : 'Pincel indisponível neste navegador'
            }
            disabled={!eyedropperSupported}
            onClick={pickFromScreen}
            className={cn(
              'grid size-8 shrink-0 place-items-center rounded-lg text-foreground transition-colors',
              eyedropperSupported
                ? 'hover:bg-muted'
                : 'cursor-not-allowed opacity-40',
            )}
          >
            <Pipette className="size-4" />
          </button>

          <span
            aria-hidden
            className="size-7 shrink-0 rounded-full border border-border shadow-sm"
            style={{ backgroundColor: hex }}
          />

          <HueSlider
            hue={hsv.h}
            onChange={(h) => commit({ ...hsv, h })}
          />
        </div>

        {format === 'rgb' ? (
          <div className="flex items-end gap-1.5">
            {(['r', 'g', 'b'] as const).map((channel) => (
              <label key={channel} className="flex min-w-0 flex-1 flex-col gap-1">
                <Input
                  type="number"
                  min={0}
                  max={255}
                  value={rgb[channel]}
                  onChange={(e) => updateChannel(channel, e.target.value)}
                  className="h-9 px-2 text-center tabular-nums shadow-none"
                />
                <span className="text-center text-[10px] font-medium uppercase text-muted-foreground">
                  {channel}
                </span>
              </label>
            ))}
            <button
              type="button"
              aria-label="Alternar para HEX"
              title="Alternar formato"
              onClick={() => setFormat('hex')}
              className="mb-5 grid size-9 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <ChevronsUpDown className="size-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-end gap-1.5">
            <label className="flex min-w-0 flex-1 flex-col gap-1">
              <Input
                value={hex.toUpperCase()}
                onChange={(e) => updateHex(e.target.value)}
                className="h-9 px-2 text-center font-mono text-xs uppercase tabular-nums shadow-none"
                maxLength={7}
              />
              <span className="text-center text-[10px] font-medium uppercase text-muted-foreground">
                Hex
              </span>
            </label>
            <button
              type="button"
              aria-label="Alternar para RGB"
              title="Alternar formato"
              onClick={() => setFormat('rgb')}
              className="mb-5 grid size-9 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <ChevronsUpDown className="size-4" />
            </button>
          </div>
        )}
      </div>
    </FloatingPanel>
  )
}

function SaturationValueArea({
  hsv,
  onChange,
}: {
  hsv: Hsv
  onChange: (hsv: Hsv) => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  const updateFromPointer = useCallback(
    (clientX: number, clientY: number) => {
      const el = ref.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const x = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
      const y = Math.min(1, Math.max(0, (clientY - rect.top) / rect.height))
      onChange({ h: hsv.h, s: x, v: 1 - y })
    },
    [hsv.h, onChange],
  )

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      if (!dragging.current) return
      updateFromPointer(event.clientX, event.clientY)
    }
    const onUp = () => {
      dragging.current = false
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [updateFromPointer])

  return (
    <div
      ref={ref}
      role="presentation"
      onPointerDown={(event) => {
        dragging.current = true
        event.currentTarget.setPointerCapture(event.pointerId)
        updateFromPointer(event.clientX, event.clientY)
      }}
      className="relative aspect-square w-full cursor-crosshair overflow-hidden rounded-xl"
      style={{
        backgroundColor: hueToCss(hsv.h),
        backgroundImage:
          'linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, transparent)',
      }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.25)]"
        style={{
          left: `${hsv.s * 100}%`,
          top: `${(1 - hsv.v) * 100}%`,
        }}
      />
    </div>
  )
}

function HueSlider({
  hue,
  onChange,
}: {
  hue: number
  onChange: (hue: number) => void
}) {
  const id = useId()
  return (
    <div className="relative min-w-0 flex-1 py-1">
      <input
        id={id}
        type="range"
        min={0}
        max={360}
        value={Math.round(hue)}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label="Matiz"
        className={cn(
          'h-3 w-full cursor-pointer appearance-none rounded-full',
          '[&::-webkit-slider-thumb]:relative [&::-webkit-slider-thumb]:z-10 [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-transparent [&::-webkit-slider-thumb]:shadow-[0_0_0_1px_rgba(0,0,0,0.2)]',
          '[&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-transparent [&::-moz-range-thumb]:shadow-[0_0_0_1px_rgba(0,0,0,0.2)]',
        )}
        style={{
          background:
            'linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)',
        }}
      />
    </div>
  )
}

/** Trigger + painel: clique abre a caixa; ícone de pincel no seletor. */
export function ColorPickerTrigger({
  value,
  onChange,
  active,
  className,
  children,
  'aria-label': ariaLabel = 'Cor personalizada',
}: {
  value: string
  onChange: (hex: string) => void
  active?: boolean
  className?: string
  children?: ReactNode
  'aria-label'?: string
}) {
  const [open, setOpen] = useState(false)
  const anchorRef = useRef<HTMLButtonElement>(null)

  return (
    <>
      <button
        ref={anchorRef}
        type="button"
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-haspopup="dialog"
        title="Personalizar cor"
        onClick={() => {
          onChange(value)
          setOpen(true)
        }}
        className={className}
        style={active ? { backgroundColor: value } : undefined}
      >
        {children ?? (
          active ? null : <Pipette className="size-3.5 text-muted-foreground" />
        )}
      </button>
      <ColorPicker
        value={value}
        onChange={onChange}
        open={open}
        onOpenChange={setOpen}
        anchorRef={anchorRef}
      />
    </>
  )
}
