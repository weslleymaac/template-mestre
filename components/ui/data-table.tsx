'use client'

import { ArrowDown, ArrowUp, ChevronsUpDown, Search } from '@/components/ui/icons'
import { useMemo, useState } from 'react'
import { cn } from '@/lib/utils'

export type Column<T> = {
  key: string
  header: string
  /** Conteúdo customizado da célula */
  cell?: (row: T) => React.ReactNode
  /** Valor usado para ordenar/buscar (default: row[key]) */
  accessor?: (row: T) => string | number
  sortable?: boolean
  className?: string
  align?: 'left' | 'right' | 'center'
}

type SortState = { key: string; dir: 'asc' | 'desc' } | null

type DataTableProps<T> = {
  columns: Column<T>[]
  data: T[]
  searchable?: boolean
  searchPlaceholder?: string
  pageSize?: number
  className?: string
}

function defaultAccessor<T>(row: T, key: string): string | number {
  const v = (row as Record<string, unknown>)[key]
  if (typeof v === 'number') return v
  return String(v ?? '')
}

export function DataTable<T>({
  columns,
  data,
  searchable = true,
  searchPlaceholder = 'Buscar em todas as colunas...',
  pageSize = 8,
  className,
}: DataTableProps<T>) {
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortState>(null)
  const [page, setPage] = useState(0)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return data
    return data.filter((row) =>
      columns.some((col) => {
        const value = col.accessor
          ? col.accessor(row)
          : defaultAccessor(row, col.key)
        return String(value).toLowerCase().includes(q)
      }),
    )
  }, [data, columns, query])

  const sorted = useMemo(() => {
    if (!sort) return filtered
    const col = columns.find((c) => c.key === sort.key)
    if (!col) return filtered
    const acc = (row: T) =>
      col.accessor ? col.accessor(row) : defaultAccessor(row, col.key)
    return [...filtered].sort((a, b) => {
      const av = acc(a)
      const bv = acc(b)
      let cmp = 0
      if (typeof av === 'number' && typeof bv === 'number') cmp = av - bv
      else cmp = String(av).localeCompare(String(bv), 'pt-BR')
      return sort.dir === 'asc' ? cmp : -cmp
    })
  }, [filtered, sort, columns])

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

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {searchable && (
        <div className="flex h-10 items-center gap-2 rounded-xl border border-input bg-background px-3.5 shadow-sm transition-all focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/25 sm:max-w-xs">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setPage(0)
            }}
            placeholder={searchPlaceholder}
            className="h-full w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                {columns.map((col) => {
                  const active = sort?.key === col.key
                  return (
                    <th
                      key={col.key}
                      className={cn(
                        'px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap',
                        col.align === 'right' && 'text-right',
                        col.align === 'center' && 'text-center',
                        col.className,
                      )}
                    >
                      {col.sortable ? (
                        <button
                          type="button"
                          onClick={() => toggleSort(col.key)}
                          className={cn(
                            'inline-flex items-center gap-1.5 transition-colors hover:text-foreground',
                            active && 'text-foreground',
                            col.align === 'right' && 'flex-row-reverse',
                          )}
                        >
                          {col.header}
                          {active ? (
                            sort?.dir === 'asc' ? (
                              <ArrowUp className="size-3.5" />
                            ) : (
                              <ArrowDown className="size-3.5" />
                            )
                          ) : (
                            <ChevronsUpDown className="size-3.5 opacity-50" />
                          )}
                        </button>
                      ) : (
                        col.header
                      )}
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-10 text-center text-muted-foreground"
                  >
                    Nenhum registro encontrado.
                  </td>
                </tr>
              ) : (
                paged.map((row, i) => (
                  <tr
                    key={i}
                    className="border-b border-border last:border-0 transition-colors hover:bg-muted/40"
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={cn(
                          'px-4 py-3 align-middle',
                          col.align === 'right' && 'text-right',
                          col.align === 'center' && 'text-center',
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

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {sorted.length} registro{sorted.length === 1 ? '' : 's'}
        </span>
        <div className="flex items-center gap-1">
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
    </div>
  )
}
