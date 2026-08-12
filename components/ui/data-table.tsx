'use client'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog } from '@/components/ui/dialog'
import { FloatingPanel } from '@/components/ui/floating-panel'
import {
  ArrowDown,
  ArrowUp,
  ChevronsUpDown,
  Menu,
  Plus,
  RotateCcw,
  Search,
  Settings2,
  X,
} from '@/components/ui/icons'
import { Switch } from '@/components/ui/switch'
import { useClickOutside } from '@/hooks/use-click-outside'
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

const DEFAULT_MIN_WIDTH = 72
const DEFAULT_COL_WIDTH = 160
const STORAGE_PREFIX = 'data-table:'

export type Column<T> = {
  key: string
  header: string
  /** Conteúdo customizado da célula */
  cell?: (row: T) => React.ReactNode
  /** Valor usado para ordenar (default: row[key]) */
  accessor?: (row: T) => string | number
  /** Valor usado na busca/filtro textual (default: accessor) */
  filterAccessor?: (row: T) => string | number
  sortable?: boolean
  /** Permite filtro nesta coluna quando filtros estão habilitados (default: true) */
  filterable?: boolean
  /** Pode ser ocultada no painel de colunas (default: true) */
  hideable?: boolean
  className?: string
  align?: 'left' | 'right' | 'center'
  /** Largura inicial em pixels */
  width?: number
  /** Largura mínima ao redimensionar (default: 72) */
  minWidth?: number
  /** Permite redimensionar esta coluna (default: true quando resizableColumns) */
  resizable?: boolean
}

type SortState = { key: string; dir: 'asc' | 'desc' } | null

type ResizeState = {
  key: string
  startX: number
  startWidth: number
  minWidth: number
}

type ColumnFilter = {
  text: string
  /** null = todos os valores; array = apenas estes */
  values: string[] | null
}

type ColumnPrefs = {
  order: string[]
  hidden: string[]
  /** Filtro via setinha no cabeçalho */
  filtersEnabled: boolean
  /** Linha de inputs abaixo dos títulos das colunas */
  filtersBelow: boolean
}

type DataTableProps<T> = {
  columns: Column<T>[]
  data: T[]
  searchable?: boolean
  searchPlaceholder?: string
  pageSize?: number
  className?: string
  /** Habilita redimensionamento de colunas por arraste */
  resizableColumns?: boolean
  /** Callback ao clicar em "Adicionar linha". Quando definido, exibe o botão. */
  onAddRow?: () => void
  addRowLabel?: string
  /** Permite o recurso de filtros por coluna (default: true) */
  columnFilters?: boolean
  /** Exibe engrenagem para ordem/visibilidade das colunas (default: true) */
  columnSettings?: boolean
  /**
   * Chave do localStorage para persistir ordem/visibilidade/filtros.
   * Se omitida, gera uma chave a partir das colunas.
   */
  storageKey?: string
}

function defaultAccessor<T>(row: T, key: string): string | number {
  const v = (row as Record<string, unknown>)[key]
  if (typeof v === 'number') return v
  return String(v ?? '')
}

function getSortValue<T>(row: T, col: Column<T>): string | number {
  return col.accessor ? col.accessor(row) : defaultAccessor(row, col.key)
}

function getFilterValue<T>(row: T, col: Column<T>): string | number {
  if (col.filterAccessor) return col.filterAccessor(row)
  return getSortValue(row, col)
}

function buildInitialWidths<T>(columns: Column<T>[]) {
  const widths: Record<string, number> = {}
  for (const col of columns) {
    widths[col.key] = col.width ?? DEFAULT_COL_WIDTH
  }
  return widths
}

function defaultOrder<T>(columns: Column<T>[]) {
  return columns.map((c) => c.key)
}

function resolveStorageKey<T>(storageKey: string | undefined, columns: Column<T>[]) {
  if (storageKey) return `${STORAGE_PREFIX}${storageKey}`
  return `${STORAGE_PREFIX}${columns.map((c) => c.key).join('|')}`
}

function defaultPrefs<T>(columns: Column<T>[]): ColumnPrefs {
  return {
    order: defaultOrder(columns),
    hidden: [],
    filtersEnabled: false,
    filtersBelow: false,
  }
}

function loadPrefs(key: string, fallback: ColumnPrefs): ColumnPrefs {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return fallback
    const parsed = JSON.parse(raw) as Partial<ColumnPrefs>
    const order = Array.isArray(parsed.order)
      ? parsed.order.filter((k): k is string => typeof k === 'string')
      : fallback.order
    const hidden = Array.isArray(parsed.hidden)
      ? parsed.hidden.filter((k): k is string => typeof k === 'string')
      : []
    const filtersEnabled =
      typeof parsed.filtersEnabled === 'boolean'
        ? parsed.filtersEnabled
        : fallback.filtersEnabled
    const filtersBelow =
      typeof parsed.filtersBelow === 'boolean'
        ? parsed.filtersBelow
        : fallback.filtersBelow
    return { order, hidden, filtersEnabled, filtersBelow }
  } catch {
    return fallback
  }
}

function normalizePrefs(prefs: ColumnPrefs, allKeys: string[]): ColumnPrefs {
  const known = new Set(allKeys)
  const order = [
    ...prefs.order.filter((k) => known.has(k)),
    ...allKeys.filter((k) => !prefs.order.includes(k)),
  ]
  const hidden = prefs.hidden.filter((k) => known.has(k))
  if (hidden.length >= order.length) {
    return {
      ...prefs,
      order,
      hidden: hidden.filter((k) => k !== order[0]),
    }
  }
  return { ...prefs, order, hidden }
}

/** Busca parcial — contém o texto digitado (case-insensitive). */
function matchesTextFilter(value: string | number, filter: string) {
  const hay = String(value).toLowerCase()
  const needle = filter.trim().toLowerCase()
  if (!needle) return true
  return hay.includes(needle)
}

function hasActiveFilter(filter: ColumnFilter | undefined) {
  if (!filter) return false
  return filter.text.trim().length > 0 || filter.values != null
}

function emptyFilter(): ColumnFilter {
  return { text: '', values: null }
}

export function DataTable<T>({
  columns,
  data,
  searchable = true,
  searchPlaceholder = 'Buscar em todas as colunas...',
  pageSize = 8,
  className,
  resizableColumns = true,
  onAddRow,
  addRowLabel = 'Adicionar linha',
  columnFilters = true,
  columnSettings = true,
  storageKey,
}: DataTableProps<T>) {
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortState>(null)
  const [page, setPage] = useState(0)
  const [columnWidths, setColumnWidths] = useState(() => buildInitialWidths(columns))
  const [filters, setFilters] = useState<Record<string, ColumnFilter>>({})
  const [filterMenuKey, setFilterMenuKey] = useState<string | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [prefs, setPrefs] = useState<ColumnPrefs>(() => defaultPrefs(columns))
  const [prefsReady, setPrefsReady] = useState(false)
  const [dragKey, setDragKey] = useState<string | null>(null)
  const resizeRef = useRef<ResizeState | null>(null)
  const settingsTitleId = useId()
  const filtersToggleId = useId()
  const filtersBelowToggleId = useId()
  const resolvedStorageKey = useMemo(
    () => resolveStorageKey(storageKey, columns),
    [storageKey, columns],
  )
  const allKeys = useMemo(() => columns.map((c) => c.key), [columns])
  const columnMap = useMemo(() => {
    const map = new Map<string, Column<T>>()
    for (const col of columns) map.set(col.key, col)
    return map
  }, [columns])

  const filtersInMenu = columnFilters && prefs.filtersEnabled
  const filtersBelow = columnFilters && prefs.filtersBelow
  const anyColumnFilters = filtersInMenu || filtersBelow

  useEffect(() => {
    const loaded = normalizePrefs(
      loadPrefs(resolvedStorageKey, defaultPrefs(columns)),
      allKeys,
    )
    setPrefs(loaded)
    setPrefsReady(true)
  }, [resolvedStorageKey, columns, allKeys])

  useEffect(() => {
    if (!prefsReady) return
    try {
      window.localStorage.setItem(resolvedStorageKey, JSON.stringify(prefs))
    } catch {
      // ignore quota / private mode
    }
  }, [prefs, prefsReady, resolvedStorageKey])

  useEffect(() => {
    setColumnWidths((prev) => {
      const next = { ...prev }
      let changed = false
      for (const col of columns) {
        if (next[col.key] == null) {
          next[col.key] = col.width ?? DEFAULT_COL_WIDTH
          changed = true
        }
      }
      return changed ? next : prev
    })
    setPrefs((prev) => normalizePrefs(prev, allKeys))
  }, [columns, allKeys])

  // Ao desligar todos os filtros, limpa o estado e fecha o menu.
  useEffect(() => {
    if (anyColumnFilters) return
    setFilters({})
    setFilterMenuKey(null)
    setPage(0)
  }, [anyColumnFilters])

  const visibleColumns = useMemo(() => {
    const hidden = new Set(prefs.hidden)
    return prefs.order
      .map((key) => columnMap.get(key))
      .filter((col): col is Column<T> => Boolean(col) && !hidden.has(col!.key))
  }, [prefs, columnMap])

  const uniqueValuesByColumn = useMemo(() => {
    const map = new Map<string, string[]>()
    for (const col of columns) {
      const set = new Set<string>()
      for (const row of data) {
        set.add(String(getFilterValue(row, col)))
      }
      map.set(
        col.key,
        [...set].sort((a, b) => a.localeCompare(b, 'pt-BR')),
      )
    }
    return map
  }, [columns, data])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!resizeRef.current) return
    const { key, startX, startWidth, minWidth } = resizeRef.current
    const nextWidth = Math.max(minWidth, startWidth + (e.clientX - startX))
    setColumnWidths((prev) => ({ ...prev, [key]: nextWidth }))
  }, [])

  const handleMouseUp = useCallback(() => {
    resizeRef.current = null
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }, [handleMouseMove])

  useEffect(() => () => handleMouseUp(), [handleMouseUp])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const activeFilters = Object.entries(filters).filter(([, f]) =>
      hasActiveFilter(f),
    )

    return data.filter((row) => {
      if (q) {
        const matchesGlobal = columns.some((col) =>
          matchesTextFilter(getFilterValue(row, col), q),
        )
        if (!matchesGlobal) return false
      }

      if (!anyColumnFilters) return true

      for (const [key, filter] of activeFilters) {
        const col = columnMap.get(key)
        if (!col) continue
        const value = getFilterValue(row, col)
        const asString = String(value)
        if (filter.text.trim() && !matchesTextFilter(value, filter.text)) {
          return false
        }
        if (filter.values != null && !filter.values.includes(asString)) {
          return false
        }
      }
      return true
    })
  }, [data, columns, columnMap, query, filters, anyColumnFilters])

  const sorted = useMemo(() => {
    if (!sort) return filtered
    const col = columnMap.get(sort.key)
    if (!col) return filtered
    return [...filtered].sort((a, b) => {
      const av = getSortValue(a, col)
      const bv = getSortValue(b, col)
      let cmp = 0
      if (typeof av === 'number' && typeof bv === 'number') cmp = av - bv
      else cmp = String(av).localeCompare(String(bv), 'pt-BR')
      return sort.dir === 'asc' ? cmp : -cmp
    })
  }, [filtered, sort, columnMap])

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize))
  const safePage = Math.min(page, pageCount - 1)
  const paged = sorted.slice(safePage * pageSize, safePage * pageSize + pageSize)

  function toggleSort(key: string) {
    setSort((prev) => {
      if (!prev || prev.key !== key) return { key, dir: 'asc' }
      if (prev.dir === 'asc') return { key, dir: 'desc' }
      return null
    })
  }

  function applySort(key: string, dir: 'asc' | 'desc') {
    setSort({ key, dir })
    setFilterMenuKey(null)
  }

  function isColumnResizable(col: Column<T>) {
    return resizableColumns && col.resizable !== false
  }

  function startResize(e: React.MouseEvent, col: Column<T>) {
    e.preventDefault()
    e.stopPropagation()
    resizeRef.current = {
      key: col.key,
      startX: e.clientX,
      startWidth: columnWidths[col.key] ?? col.width ?? DEFAULT_COL_WIDTH,
      minWidth: col.minWidth ?? DEFAULT_MIN_WIDTH,
    }
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  function colStyle(col: Column<T>) {
    const width = columnWidths[col.key] ?? col.width ?? DEFAULT_COL_WIDTH
    return { width, minWidth: width, maxWidth: width }
  }

  function colBodyCellClass(colIndex: number) {
    return colIndex < visibleColumns.length - 1 ? 'border-r border-border/35' : ''
  }

  function updateColumnFilter(key: string, next: ColumnFilter) {
    setFilters((prev) => {
      if (!hasActiveFilter(next)) {
        const copy = { ...prev }
        delete copy[key]
        return copy
      }
      return { ...prev, [key]: next }
    })
    setPage(0)
  }

  function clearColumnFilter(key: string) {
    setFilters((prev) => {
      const next = { ...prev }
      delete next[key]
      return next
    })
    setPage(0)
  }

  function toggleHidden(key: string, hideable: boolean) {
    if (!hideable) return
    setPrefs((prev) => {
      const hidden = new Set(prev.hidden)
      if (hidden.has(key)) {
        hidden.delete(key)
      } else {
        const visibleCount = prev.order.filter((k) => !hidden.has(k)).length
        if (visibleCount <= 1) return prev
        hidden.add(key)
      }
      return { ...prev, hidden: [...hidden] }
    })
  }

  function moveColumn(key: string, direction: -1 | 1) {
    setPrefs((prev) => {
      const order = [...prev.order]
      const index = order.indexOf(key)
      if (index < 0) return prev
      const target = index + direction
      if (target < 0 || target >= order.length) return prev
      ;[order[index], order[target]] = [order[target], order[index]]
      return { ...prev, order }
    })
  }

  function reorderColumns(fromKey: string, toKey: string) {
    if (fromKey === toKey) return
    setPrefs((prev) => {
      const order = [...prev.order]
      const from = order.indexOf(fromKey)
      const to = order.indexOf(toKey)
      if (from < 0 || to < 0) return prev
      const [item] = order.splice(from, 1)
      order.splice(to, 0, item)
      return { ...prev, order }
    })
  }

  function resetPrefs() {
    setPrefs(defaultPrefs(columns))
    setFilters({})
    setFilterMenuKey(null)
  }

  const showToolbar = searchable || onAddRow || columnSettings
  const settingsOrder = prefs.order
    .map((key) => columnMap.get(key))
    .filter((col): col is Column<T> => Boolean(col))

  return (
    <div className={cn('flex min-w-0 flex-col gap-3', className)}>
      {showToolbar && (
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          {searchable && (
            <div className="flex h-10 min-w-0 flex-1 basis-48 items-center gap-2 rounded-xl border border-input bg-background px-3.5 shadow-sm transition-all focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/25 sm:max-w-xs">
              <Search className="size-4 shrink-0 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setPage(0)
                }}
                placeholder={searchPlaceholder}
                className="h-full w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
          )}
          <div className="ml-auto flex shrink-0 items-center gap-2">
            {onAddRow && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={onAddRow}
                className="w-full shrink-0 sm:w-auto"
              >
                <Plus />
                {addRowLabel}
              </Button>
            )}
            {columnSettings && (
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={() => setSettingsOpen(true)}
                aria-label="Configurar colunas"
                title="Configurar colunas"
              >
                <Settings2 className="size-4" />
              </Button>
            )}
          </div>
        </div>
      )}

      <div className="min-w-0 overflow-hidden rounded-2xl border border-border">
        <div className="overflow-x-auto overscroll-x-contain">
          <table className="w-full min-w-max table-fixed text-sm">
            <colgroup>
              {visibleColumns.map((col) => (
                <col key={col.key} style={colStyle(col)} />
              ))}
            </colgroup>
            <thead>
              <tr className="border-b border-border bg-muted/50">
                {visibleColumns.map((col) => {
                  const active = sort?.key === col.key
                  const showMenuFilter =
                    filtersInMenu && col.filterable !== false
                  const filteredCol = hasActiveFilter(filters[col.key])
                  return (
                    <th
                      key={col.key}
                      style={colStyle(col)}
                      className={cn(
                        'relative px-4 py-3 text-left font-medium text-muted-foreground',
                        col.align === 'right' && 'text-right',
                        col.align === 'center' && 'text-center',
                        col.className,
                      )}
                    >
                      <div
                        className={cn(
                          'flex min-w-0 items-center gap-1 pr-2',
                          col.align === 'right' && 'justify-end',
                          col.align === 'center' && 'justify-center',
                        )}
                      >
                        {col.sortable && !showMenuFilter ? (
                          <button
                            type="button"
                            onClick={() => toggleSort(col.key)}
                            className={cn(
                              'inline-flex max-w-full items-center gap-1.5 transition-colors hover:text-foreground',
                              active && 'text-foreground',
                              col.align === 'right' && 'flex-row-reverse',
                            )}
                          >
                            <span className="truncate">{col.header}</span>
                            {active ? (
                              sort?.dir === 'asc' ? (
                                <ArrowUp className="size-3.5 shrink-0" />
                              ) : (
                                <ArrowDown className="size-3.5 shrink-0" />
                              )
                            ) : (
                              <ChevronsUpDown className="size-3.5 shrink-0 opacity-50" />
                            )}
                          </button>
                        ) : (
                          <>
                            {col.sortable ? (
                              <button
                                type="button"
                                onClick={() => toggleSort(col.key)}
                                className={cn(
                                  'truncate transition-colors hover:text-foreground',
                                  active && 'text-foreground',
                                )}
                              >
                                {col.header}
                              </button>
                            ) : (
                              <span className="truncate">{col.header}</span>
                            )}
                            {showMenuFilter && (
                              <ColumnFilterTrigger
                                open={filterMenuKey === col.key}
                                active={filteredCol || active}
                                sortDir={active ? sort?.dir : null}
                                onToggle={() =>
                                  setFilterMenuKey((prev) =>
                                    prev === col.key ? null : col.key,
                                  )
                                }
                                onClose={() => setFilterMenuKey(null)}
                                header={col.header}
                                filter={filters[col.key] ?? emptyFilter()}
                                uniqueValues={
                                  uniqueValuesByColumn.get(col.key) ?? []
                                }
                                sortable={Boolean(col.sortable)}
                                onSortAsc={
                                  col.sortable
                                    ? () => applySort(col.key, 'asc')
                                    : undefined
                                }
                                onSortDesc={
                                  col.sortable
                                    ? () => applySort(col.key, 'desc')
                                    : undefined
                                }
                                onChange={(next) =>
                                  updateColumnFilter(col.key, next)
                                }
                                onClear={() => clearColumnFilter(col.key)}
                              />
                            )}
                          </>
                        )}
                      </div>
                      {isColumnResizable(col) && (
                        <div
                          role="separator"
                          aria-orientation="vertical"
                          aria-label={`Redimensionar coluna ${col.header}`}
                          onMouseDown={(e) => startResize(e, col)}
                          className="absolute top-0 right-0 z-10 h-full w-2 cursor-col-resize touch-none select-none before:absolute before:top-1/2 before:right-0.5 before:h-4 before:w-px before:-translate-y-1/2 before:bg-border/50 hover:before:bg-primary/50 active:before:bg-primary"
                        />
                      )}
                    </th>
                  )
                })}
              </tr>
              {filtersBelow && (
                <tr className="border-b border-border bg-muted/20">
                  {visibleColumns.map((col) => {
                    const canFilter = col.filterable !== false
                    const current = filters[col.key] ?? emptyFilter()
                    return (
                      <th
                        key={`filter-row-${col.key}`}
                        style={colStyle(col)}
                        className="px-2 py-2 font-normal"
                      >
                        {canFilter ? (
                          <input
                            value={current.text}
                            onChange={(e) =>
                              updateColumnFilter(col.key, {
                                ...current,
                                text: e.target.value,
                              })
                            }
                            placeholder="Filtrar..."
                            aria-label={`Filtrar coluna ${col.header}`}
                            className="h-8 w-full min-w-0 rounded-lg border border-input bg-background px-2.5 text-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/25"
                          />
                        ) : (
                          <span className="block h-8" />
                        )}
                      </th>
                    )
                  })}
                </tr>
              )}
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td
                    colSpan={Math.max(visibleColumns.length, 1)}
                    className="px-4 py-10 text-center text-muted-foreground"
                  >
                    Nenhum registro encontrado.
                  </td>
                </tr>
              ) : (
                paged.map((row, i) => (
                  <tr
                    key={i}
                    className="border-b border-border/35 last:border-0 transition-colors hover:bg-muted/40"
                  >
                    {visibleColumns.map((col, colIndex) => (
                      <td
                        key={col.key}
                        style={colStyle(col)}
                        className={cn(
                          'truncate px-4 py-3 align-middle',
                          col.align === 'right' && 'text-right',
                          col.align === 'center' && 'text-center',
                          colBodyCellClass(colIndex),
                        )}
                      >
                        {col.cell
                          ? col.cell(row)
                          : String(defaultAccessor(row, col.key))}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <span>
          {sorted.length} registro{sorted.length === 1 ? '' : 's'}
        </span>
        <div className="flex items-center justify-between gap-1 sm:justify-end">
          <button
            type="button"
            disabled={safePage === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className="rounded-lg border border-border px-2.5 py-1.5 transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
          >
            Anterior
          </button>
          <span className="px-2 tabular-nums">
            {safePage + 1} / {pageCount}
          </span>
          <button
            type="button"
            disabled={safePage >= pageCount - 1}
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            className="rounded-lg border border-border px-2.5 py-1.5 transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
          >
            Próximo
          </button>
        </div>
      </div>

      <Dialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        title="Colunas da tabela"
        description="Escolha quais colunas exibir, a ordem e como os filtros aparecem. As preferências ficam salvas neste navegador."
        className="max-w-md"
        footer={
          <div className="flex w-full flex-wrap items-center justify-between gap-2">
            <Button type="button" variant="outline" onClick={resetPrefs}>
              <RotateCcw className="size-4" />
              Restaurar padrão
            </Button>
            <Button type="button" onClick={() => setSettingsOpen(false)}>
              Concluir
            </Button>
          </div>
        }
      >
        {columnFilters && (
          <div className="mb-4 flex flex-col gap-2">
            <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/30 px-3 py-3">
              <div className="min-w-0">
                <label
                  htmlFor={filtersToggleId}
                  className="text-sm font-medium text-foreground"
                >
                  Filtros na setinha
                </label>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Abre o menu de filtro e ordenação em cada coluna.
                </p>
              </div>
              <Switch
                id={filtersToggleId}
                checked={prefs.filtersEnabled}
                onCheckedChange={(checked) =>
                  setPrefs((prev) => ({ ...prev, filtersEnabled: checked }))
                }
                aria-label="Habilitar filtros na setinha"
              />
            </div>
            <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/30 px-3 py-3">
              <div className="min-w-0">
                <label
                  htmlFor={filtersBelowToggleId}
                  className="text-sm font-medium text-foreground"
                >
                  Filtros abaixo das colunas
                </label>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Mostra um campo de filtro sob o título de cada coluna.
                </p>
              </div>
              <Switch
                id={filtersBelowToggleId}
                checked={prefs.filtersBelow}
                onCheckedChange={(checked) =>
                  setPrefs((prev) => ({ ...prev, filtersBelow: checked }))
                }
                aria-label="Habilitar filtros abaixo das colunas"
              />
            </div>
          </div>
        )}

        <ul className="flex flex-col gap-1.5" aria-labelledby={settingsTitleId}>
          {settingsOrder.map((col, index) => {
            const hideable = col.hideable !== false
            const visible = !prefs.hidden.includes(col.key)
            const isDragging = dragKey === col.key
            return (
              <li
                key={col.key}
                draggable
                onDragStart={() => setDragKey(col.key)}
                onDragEnd={() => setDragKey(null)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (dragKey) reorderColumns(dragKey, col.key)
                  setDragKey(null)
                }}
                className={cn(
                  'flex items-center gap-2 rounded-xl border border-border bg-background px-2.5 py-2 transition-colors',
                  isDragging && 'opacity-50',
                  dragKey && !isDragging && 'hover:border-primary/40',
                )}
              >
                <span
                  className="grid size-8 shrink-0 cursor-grab place-items-center rounded-lg text-muted-foreground active:cursor-grabbing"
                  aria-hidden
                >
                  <Menu className="size-4" />
                </span>
                <Checkbox
                  checked={visible}
                  disabled={!hideable || (visible && visibleColumns.length <= 1)}
                  onCheckedChange={() => toggleHidden(col.key, hideable)}
                  aria-label={`${visible ? 'Ocultar' : 'Exibir'} coluna ${col.header}`}
                />
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                  {col.header}
                  {!hideable && (
                    <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                      (fixa)
                    </span>
                  )}
                </span>
                <div className="flex shrink-0 items-center gap-0.5">
                  <button
                    type="button"
                    aria-label={`Mover ${col.header} para cima`}
                    disabled={index === 0}
                    onClick={() => moveColumn(col.key, -1)}
                    className="grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
                  >
                    <ArrowUp className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Mover ${col.header} para baixo`}
                    disabled={index === settingsOrder.length - 1}
                    onClick={() => moveColumn(col.key, 1)}
                    className="grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
                  >
                    <ArrowDown className="size-3.5" />
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      </Dialog>
    </div>
  )
}

function ColumnFilterTrigger({
  open,
  active,
  sortDir,
  onToggle,
  onClose,
  header,
  filter,
  uniqueValues,
  sortable,
  onSortAsc,
  onSortDesc,
  onChange,
  onClear,
}: {
  open: boolean
  active: boolean
  sortDir: 'asc' | 'desc' | null | undefined
  onToggle: () => void
  onClose: () => void
  header: string
  filter: ColumnFilter
  uniqueValues: string[]
  sortable: boolean
  onSortAsc?: () => void
  onSortDesc?: () => void
  onChange: (next: ColumnFilter) => void
  onClear: () => void
}) {
  const anchorRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  useClickOutside([anchorRef, panelRef], onClose, open)

  const listQuery = filter.text.trim().toLowerCase()
  const visibleValues = useMemo(() => {
    if (!listQuery) return uniqueValues
    return uniqueValues.filter((value) =>
      value.toLowerCase().includes(listQuery),
    )
  }, [uniqueValues, listQuery])

  const selected = new Set(filter.values ?? uniqueValues)
  const allVisibleSelected =
    visibleValues.length > 0 && visibleValues.every((v) => selected.has(v))
  const someVisibleSelected = visibleValues.some((v) => selected.has(v))

  function toggleValue(value: string) {
    const nextSelected = new Set(selected)
    if (nextSelected.has(value)) nextSelected.delete(value)
    else nextSelected.add(value)

    if (nextSelected.size === 0) {
      onChange({ ...filter, values: [] })
      return
    }
    if (nextSelected.size === uniqueValues.length) {
      onChange({ ...filter, values: null })
      return
    }
    onChange({ ...filter, values: [...nextSelected] })
  }

  function toggleAll(checked: boolean) {
    // Sem busca: seleciona/limpa todos. Com busca: só os valores visíveis.
    if (!listQuery) {
      onChange({
        ...filter,
        values: checked ? null : [],
      })
      return
    }
    const nextSelected = new Set(selected)
    if (checked) {
      for (const value of visibleValues) nextSelected.add(value)
    } else {
      for (const value of visibleValues) nextSelected.delete(value)
    }
    if (nextSelected.size === 0) {
      onChange({ ...filter, values: [] })
      return
    }
    if (nextSelected.size === uniqueValues.length) {
      onChange({ ...filter, values: null })
      return
    }
    onChange({ ...filter, values: [...nextSelected] })
  }

  return (
    <>
      <button
        ref={anchorRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onToggle()
        }}
        aria-label={`Filtrar coluna ${header}`}
        aria-expanded={open}
        aria-haspopup="dialog"
        className={cn(
          'grid size-6 shrink-0 place-items-center rounded-md transition-colors hover:bg-muted hover:text-foreground',
          active || open
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground opacity-70',
        )}
      >
        {sortDir === 'asc' ? (
          <ArrowUp className="size-3.5" />
        ) : sortDir === 'desc' ? (
          <ArrowDown className="size-3.5" />
        ) : (
          <ChevronsUpDown className="size-3.5" />
        )}
      </button>

      <FloatingPanel
        open={open}
        anchorRef={anchorRef}
        panelRef={panelRef}
        width={260}
        maxHeight={360}
        align="start"
        className="z-50 shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-border px-3 py-2">
          <p className="truncate text-sm font-medium text-foreground">{header}</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar filtro"
            className="grid size-7 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="size-3.5" />
          </button>
        </div>

        {sortable && (
          <div className="flex flex-col gap-0.5 border-b border-border p-1.5">
            <button
              type="button"
              onClick={onSortAsc}
              className={cn(
                'flex items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors hover:bg-muted',
                sortDir === 'asc' && 'bg-primary/10 font-medium text-primary',
              )}
            >
              <ArrowUp className="size-3.5 shrink-0" />
              Ordenar crescente
            </button>
            <button
              type="button"
              onClick={onSortDesc}
              className={cn(
                'flex items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors hover:bg-muted',
                sortDir === 'desc' && 'bg-primary/10 font-medium text-primary',
              )}
            >
              <ArrowDown className="size-3.5 shrink-0" />
              Ordenar decrescente
            </button>
          </div>
        )}

        <div className="border-b border-border p-2">
          <div className="flex h-9 items-center gap-2 rounded-lg border border-input bg-background px-2.5">
            <Search className="size-3.5 shrink-0 text-muted-foreground" />
            <input
              autoFocus
              value={filter.text}
              onChange={(e) => onChange({ ...filter, text: e.target.value })}
              placeholder="Filtrar..."
              className="h-full w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            {filter.text && (
              <button
                type="button"
                onClick={() => onChange({ ...filter, text: '' })}
                aria-label="Limpar texto do filtro"
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        </div>

        {uniqueValues.length > 0 && (
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex items-center gap-2 border-b border-border px-3 py-2">
              <Checkbox
                checked={
                  allVisibleSelected
                    ? true
                    : someVisibleSelected
                      ? 'indeterminate'
                      : false
                }
                onCheckedChange={(checked) => toggleAll(checked)}
                aria-label="Selecionar todos os valores visíveis"
                disabled={visibleValues.length === 0}
              />
              <span className="text-xs font-medium text-muted-foreground">
                Valores
                {listQuery ? ` (${visibleValues.length})` : ''}
              </span>
            </div>
            <ul className="max-h-40 overflow-y-auto p-1.5">
              {visibleValues.length === 0 ? (
                <li className="px-2 py-3 text-center text-xs text-muted-foreground">
                  Nenhum valor encontrado.
                </li>
              ) : (
                visibleValues.map((value) => {
                  const checked = selected.has(value)
                  return (
                    <li key={value}>
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => toggleValue(value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            toggleValue(value)
                          }
                        }}
                        className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-muted"
                      >
                        <Checkbox
                          checked={checked}
                          aria-label={`Filtrar valor ${value || '(vazio)'}`}
                        />
                        <span className="min-w-0 truncate">
                          {value || (
                            <span className="text-muted-foreground">(vazio)</span>
                          )}
                        </span>
                      </div>
                    </li>
                  )
                })
              )}
            </ul>
          </div>
        )}

        <div className="border-t border-border p-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-full"
            onClick={() => {
              onClear()
              onClose()
            }}
            disabled={!hasActiveFilter(filter)}
          >
            Limpar filtro
          </Button>
        </div>
      </FloatingPanel>
    </>
  )
}
