'use client'

import { ChevronRight, type IconProps } from '@/components/ui/icons'
import { useState, type ComponentType, type ReactNode } from 'react'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export function StepHeading({
  icon: Icon,
  title,
}: {
  icon: ComponentType<IconProps>
  title: string
}) {
  return (
    <h2 className="flex items-center gap-2.5 font-heading text-xl font-semibold tracking-tight">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
        <Icon className="size-4" aria-hidden />
      </span>
      {title}
    </h2>
  )
}

export function SectionLabel({
  icon: Icon,
  children,
  className,
}: {
  icon: ComponentType<IconProps>
  children: ReactNode
  className?: string
}) {
  return (
    <p className={cn('flex items-start gap-2 text-sm font-medium', className)}>
      <Icon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
      {children}
    </p>
  )
}

export function WhyAsk({ children }: { children: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex items-center gap-1 text-sm font-medium text-primary"
      >
        Por que perguntamos isso?
        <ChevronRight className={cn('size-3.5 transition-transform', open && 'rotate-90')} />
      </button>
      {open ? <p className="mt-1 text-sm text-muted-foreground">{children}</p> : null}
    </div>
  )
}

export function Field({
  label,
  htmlFor,
  children,
  why,
}: {
  label: string
  htmlFor?: string
  children: React.ReactNode
  why?: string
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {why ? <WhyAsk>{why}</WhyAsk> : null}
    </div>
  )
}

export function ChoiceGroup({
  value,
  onChange,
  options,
  label,
}: {
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  label: string
}) {
  return (
    <div role="group" aria-label={label} className="inline-flex rounded-full border border-border bg-background p-0.5">
      {options.map((option) => {
        const selected = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              'rounded-full px-3 py-1 text-sm transition-colors',
              selected
                ? 'bg-primary font-medium text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

export function Chip({
  selected,
  onClick,
  children,
}: {
  selected: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        'rounded-full border px-3 py-1.5 text-sm transition-colors',
        selected
          ? 'border-transparent bg-primary font-medium text-primary-foreground'
          : 'border-border bg-background text-foreground hover:bg-muted',
      )}
    >
      {children}
    </button>
  )
}

export function onlyDigits(value: string, max: number) {
  return value.replace(/\D/g, '').slice(0, max)
}
