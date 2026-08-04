'use client'

import { useEffect, useState, type CSSProperties, type RefObject } from 'react'

type UseFloatingPositionOptions = {
  offset?: number
  maxHeight?: number
  /** Largura do painel. Padrão: mesma largura do gatilho. */
  width?: number | 'anchor'
  /** Alinha a borda direita do painel com a do gatilho. */
  align?: 'start' | 'end'
}

export function useFloatingPosition(
  anchorRef: RefObject<HTMLElement | null>,
  open: boolean,
  {
    offset = 8,
    maxHeight = 256,
    width = 'anchor',
    align = 'start',
  }: UseFloatingPositionOptions = {},
): CSSProperties | undefined {
  const [style, setStyle] = useState<CSSProperties>()

  useEffect(() => {
    if (!open) {
      setStyle(undefined)
      return
    }

    function update() {
      const anchor = anchorRef.current
      if (!anchor) return

      const rect = anchor.getBoundingClientRect()
      const padding = 8
      const panelWidth =
        width === 'anchor'
          ? rect.width
          : Math.min(width, window.innerWidth - padding * 2)

      let left =
        align === 'end' ? rect.right - panelWidth : rect.left
      left = Math.max(
        padding,
        Math.min(left, window.innerWidth - panelWidth - padding),
      )

      const spaceBelow = window.innerHeight - rect.bottom - padding
      const spaceAbove = rect.top - padding
      const openBelow = spaceBelow >= 120 || spaceBelow >= spaceAbove

      const availableHeight = openBelow ? spaceBelow - offset : spaceAbove - offset
      const height = Math.min(maxHeight, Math.max(availableHeight, 96))

      const top = openBelow
        ? rect.bottom + offset
        : rect.top - offset - height

      setStyle({
        position: 'fixed',
        top,
        left,
        width: panelWidth,
        maxHeight: height,
        zIndex: 100,
      })
    }

    update()
    window.addEventListener('scroll', update, true)
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update, true)
      window.removeEventListener('resize', update)
    }
  }, [anchorRef, open, offset, maxHeight, width, align])

  return style
}
