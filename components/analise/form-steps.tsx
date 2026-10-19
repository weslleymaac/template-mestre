'use client'

import { useState } from 'react'
import {
  ArrowDown,
  ArrowUp,
  BarChart3,
  CalendarDays,
  Clock,
  Flag,
  LayoutGrid,
  Plus,
  Scale,
  Shield,
  Sparkles,
  Store,
  Trash2,
  UserCheck,
  Users,
} from '@/components/ui/icons'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Combobox } from '@/components/ui/combobox'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ALMOCOS,
  applyScheduleText,
  blankCargo,
  cargoKey,
  cargoNames,
  DAYS,
  FATURAMENTOS,
  FERIADOS,
  formatRange,
  HOURS,
  isHourOpen,
  LEVEL_LABEL,
  LOCAIS,
  MESES,
  moveItem,
  nextLevel,
  PRIORIDADES,
  REGIMES,
  REGRAS,
  requirementLines,
  seedPessoas,
  SETORES,
  UFS,
  withSetor,
  type AnaliseDraft,
  type DayId,
  type DaySchedule,
  type MovementLevel,
  type YesNoUnknown,
} from '@/lib/analise-draft'
import { cn } from '@/lib/utils'
import { Chip, ChoiceGroup, Field, onlyDigits, SectionLabel, StepHeading, WhyAsk } from '@/components/analise/parts'

export type StepProps = {
  draft: AnaliseDraft
  update: (recipe: (draft: AnaliseDraft) => AnaliseDraft) => void
  notify: (title: string, description?: string) => void
}

const ANSWER_OPTIONS: { value: YesNoUnknown; label: string }[] = [
  { value: 'sim', label: 'Sim' },
  { value: 'nao', label: 'Não' },
  { value: 'nao-sei', label: 'Não sei' },
]

const LEVEL_CLASS: Record<MovementLevel, string> = {
  fraco: 'bg-sky-200 hover:bg-sky-300 dark:bg-sky-800',
  medio: 'bg-amber-300 hover:bg-amber-400 dark:bg-amber-700',
  forte: 'bg-orange-400 hover:bg-orange-500 dark:bg-orange-700',
  pico: 'bg-red-500 hover:bg-red-600 dark:bg-red-800',
}

export function StepLoja({ draft, update }: StepProps) {
  const loja = draft.loja
  const set = (patch: Partial<AnaliseDraft['loja']>) =>
    update((current) => ({ ...current, loja: { ...current.loja, ...patch } }))

  return (
    <div className="flex flex-col gap-5">
      <div>
        <StepHeading icon={Store} title="Sua loja" />
      </div>
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)_5.5rem]">
        <Field label="Nome da loja" htmlFor="loja-nome">
          <Input
            id="loja-nome"
            value={loja.nome}
            maxLength={80}
            autoComplete="organization"
            placeholder="Nome da loja"
            onChange={(event) => set({ nome: event.target.value.slice(0, 80) })}
          />
        </Field>
        <Field label="Cidade" htmlFor="loja-cidade">
          <Input
            id="loja-cidade"
            value={loja.cidade}
            maxLength={60}
            autoComplete="address-level2"
            placeholder="Cidade"
            onChange={(event) => set({ cidade: event.target.value.slice(0, 60) })}
          />
        </Field>
        <Field label="UF">
          <Combobox
            aria-label="UF"
            options={UFS}
            value={loja.uf}
            placeholder="UF"
            onChange={(uf) => set({ uf })}
          />
        </Field>
      </div>
      <WhyAsk>Cidade e UF identificam a loja. A regra de cálculo entra depois.</WhyAsk>

      <Field label="Faturamento médio mensal">
        <Combobox
          aria-label="Faturamento médio mensal"
          options={FATURAMENTOS}
          value={loja.faturamentoMensal}
          placeholder="Selecione a faixa"
          onChange={(faturamentoMensal) => set({ faturamentoMensal })}
        />
      </Field>
      <WhyAsk>A faixa de faturamento entra no cálculo da escala quando as regras forem aplicadas.</WhyAsk>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Unidades" htmlFor="loja-unidades" why="Cada unidade pode ter movimento e equipe próprios.">
          <Input
            id="loja-unidades"
            inputMode="numeric"
            value={loja.unidades}
            onChange={(event) => set({ unidades: onlyDigits(event.target.value, 4) })}
          />
        </Field>
        <Field label="Onde fica" why="O tipo de ponto muda o movimento ao longo do dia.">
          <Combobox
            aria-label="Onde fica"
            options={LOCAIS}
            value={loja.ondeFica}
            placeholder="Selecione"
            onChange={(ondeFica) => set({ ondeFica })}
          />
        </Field>
        <Field label="Regime tributário" why="O regime entra no custo da folha quando a regra de cálculo for aplicada.">
          <Combobox
            aria-label="Regime tributário"
            options={REGIMES}
            value={loja.regimeTributario}
            placeholder="Selecione"
            onChange={(regimeTributario) => set({ regimeTributario })}
          />
        </Field>
      </div>
    </div>
  )
}

export function StepFuncionamento({ draft, update, notify }: StepProps) {
  const funcionamento = draft.funcionamento
  const [preview, setPreview] = useState<{
    dias: Record<DayId, DaySchedule>
    touched: DayId[]
  } | null>(null)

  const openPreview = () => {
    const result = applyScheduleText(funcionamento.descricaoLivre, funcionamento.dias)
    if (!result.applied) {
      notify(
        'Não consegui ler esse horário',
        'Tente no formato: seg a sex das 9 às 20, ou abro de 9 às 19 de segunda a sábado.',
      )
      return
    }
    setPreview({ dias: result.dias, touched: result.touched })
  }

  const confirmPreview = () => {
    if (!preview) return
    const next = preview.dias
    setPreview(null)
    update((current) => ({
      ...current,
      funcionamento: { ...current.funcionamento, dias: next },
    }))
  }

  return (
    <div className="flex flex-col gap-5">
      <StepHeading icon={Clock} title="Funcionamento" />

      <div className="rounded-2xl border border-border bg-muted/40 p-4">
        <SectionLabel icon={Sparkles} className="mb-2">
          Escreva do seu jeito e a IA preenche
        </SectionLabel>
        <div className="flex gap-2">
          <Input
            aria-label="Descrição livre do horário"
            value={funcionamento.descricaoLivre}
            maxLength={400}
            placeholder="Ex.: abro de 9 às 19 de segunda a sábado e domingo de 9 às 13"
            onChange={(event) =>
              update((current) => ({
                ...current,
                funcionamento: {
                  ...current.funcionamento,
                  descricaoLivre: event.target.value.slice(0, 400),
                },
              }))
            }
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                openPreview()
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="icon-lg"
            aria-label="Ler horário com IA"
            onClick={openPreview}
          >
            <Sparkles />
          </Button>
        </div>
      </div>

      <Dialog
        open={preview !== null}
        onClose={() => setPreview(null)}
        title="Confirmar horários"
        description="Confira os dias lidos do texto. O formulário só muda depois da confirmação."
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setPreview(null)}>
              Cancelar
            </Button>
            <Button type="button" onClick={confirmPreview}>
              Preencher
            </Button>
          </>
        }
      >
        <ul className="flex flex-col gap-2">
          {DAYS.filter((day) => preview?.touched.includes(day.id)).map((day) => (
            <li
              key={day.id}
              className="flex items-center justify-between gap-4 rounded-xl border border-border px-3 py-2"
            >
              <span className="text-sm font-medium">{day.label}</span>
              <span className="text-sm tabular-nums text-muted-foreground">
                {preview ? formatRange(preview.dias[day.id]) : ''}
              </span>
            </li>
          ))}
        </ul>
      </Dialog>

      <div className="flex flex-col gap-2">
        {DAYS.map((day) => {
          const schedule = funcionamento.dias[day.id]
          return (
            <div
              key={day.id}
              className="flex flex-col gap-2 border-b border-border py-2 sm:grid sm:grid-cols-[7.5rem_5.5rem_minmax(0,1fr)_minmax(0,1fr)] sm:items-center sm:gap-2 sm:border-0 sm:py-0"
            >
              <span className="text-sm font-medium">{day.label}</span>
              <label className="inline-flex items-center gap-2 text-sm text-muted-foreground sm:justify-start">
                <Checkbox
                  checked={schedule.aberto}
                  aria-label={`${day.label} aberto`}
                  onCheckedChange={(aberto) =>
                    update((current) => ({
                      ...current,
                      funcionamento: {
                        ...current.funcionamento,
                        dias: {
                          ...current.funcionamento.dias,
                          [day.id]: { ...current.funcionamento.dias[day.id], aberto },
                        },
                      },
                    }))
                  }
                />
                aberto
              </label>
              <div className="grid grid-cols-2 gap-2 sm:contents">
                <Input
                  type="time"
                  aria-label={`${day.label} abre`}
                  value={schedule.abre}
                  disabled={!schedule.aberto}
                  onChange={(event) =>
                    update((current) => ({
                      ...current,
                      funcionamento: {
                        ...current.funcionamento,
                        dias: {
                          ...current.funcionamento.dias,
                          [day.id]: {
                            ...current.funcionamento.dias[day.id],
                            abre: event.target.value,
                          },
                        },
                      },
                    }))
                  }
                />
                <Input
                  type="time"
                  aria-label={`${day.label} fecha`}
                  value={schedule.fecha}
                  disabled={!schedule.aberto}
                  onChange={(event) =>
                    update((current) => ({
                      ...current,
                      funcionamento: {
                        ...current.funcionamento,
                        dias: {
                          ...current.funcionamento.dias,
                          [day.id]: {
                            ...current.funcionamento.dias[day.id],
                            fecha: event.target.value,
                          },
                        },
                      },
                    }))
                  }
                />
              </div>
            </div>
          )
        })}
      </div>

      <p className="text-sm text-muted-foreground">
        Se fecha depois da meia-noite (ex.: 18:00 às 02:00), o turno conta no dia em que começou. Loja 24 horas: abre 00:00 e fecha 00:00.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Quantos minutos a equipe chega antes de abrir?"
          htmlFor="minutos-antes"
          why="Esse tempo entra na jornada de quem abre a loja."
        >
          <Input
            id="minutos-antes"
            inputMode="numeric"
            value={funcionamento.minutosAntes}
            onChange={(event) =>
              update((current) => ({
                ...current,
                funcionamento: {
                  ...current.funcionamento,
                  minutosAntes: onlyDigits(event.target.value, 3),
                },
              }))
            }
          />
        </Field>
        <Field
          label="Quantos minutos fica depois de fechar?"
          htmlFor="minutos-depois"
          why="Esse tempo entra na jornada de quem fecha a loja."
        >
          <Input
            id="minutos-depois"
            inputMode="numeric"
            value={funcionamento.minutosDepois}
            onChange={(event) =>
              update((current) => ({
                ...current,
                funcionamento: {
                  ...current.funcionamento,
                  minutosDepois: onlyDigits(event.target.value, 3),
                },
              }))
            }
          />
        </Field>
      </div>

      <Field label="Quanto tempo de almoço cada pessoa tem?" why="Quem está no almoço não conta na cobertura da loja.">
        <Combobox
          aria-label="Tempo de almoço"
          options={ALMOCOS}
          value={funcionamento.almoco}
          onChange={(almoco) =>
            update((current) => ({
              ...current,
              funcionamento: { ...current.funcionamento, almoco },
            }))
          }
        />
      </Field>

      <Field label="Abre em feriados?" why="O feriado só entra na escala se a loja abrir e a equipe puder trabalhar.">
        <Combobox
          aria-label="Abre em feriados"
          options={FERIADOS}
          value={funcionamento.feriados}
          placeholder="Selecione"
          onChange={(feriados) =>
            update((current) => ({
              ...current,
              funcionamento: { ...current.funcionamento, feriados },
            }))
          }
        />
      </Field>

      <div className="flex flex-col gap-2">
        <SectionLabel icon={LayoutGrid}>Setores da loja</SectionLabel>
        <div className="flex flex-wrap gap-2">
          {SETORES.map((setor) => (
            <Chip
              key={setor.id}
              selected={funcionamento.setores.includes(setor.id)}
              onClick={() =>
                update((current) =>
                  withSetor(current, setor.id, !current.funcionamento.setores.includes(setor.id)),
                )
              }
            >
              {setor.label}
            </Chip>
          ))}
        </div>
        <WhyAsk>Os setores viram cargos na equipe e na cobertura mínima.</WhyAsk>
      </div>

      <Field label="Datas com horário estendido (opcional)" htmlFor="datas-estendidas">
        <Input
          id="datas-estendidas"
          value={funcionamento.datasEstendidas}
          maxLength={200}
          placeholder="Black Friday, Natal, Dia das Mães..."
          onChange={(event) =>
            update((current) => ({
              ...current,
              funcionamento: {
                ...current.funcionamento,
                datasEstendidas: event.target.value.slice(0, 200),
              },
            }))
          }
        />
      </Field>
    </div>
  )
}

export function StepMovimento({ draft, update }: StepProps) {
  const setLevel = (day: DayId, index: number) =>
    update((current) => {
      const row = [...current.movimento.grade[day]]
      row[index] = nextLevel(row[index])
      return {
        ...current,
        movimento: {
          ...current.movimento,
          grade: { ...current.movimento.grade, [day]: row },
        },
      }
    })

  return (
    <div className="flex flex-col gap-5">
      <div>
        <StepHeading icon={BarChart3} title="Movimento" />
        <p className="mt-1 text-sm text-muted-foreground">
          Grade sugerida: confirma o movimento real da sua loja, inclusive sábado, domingo e horários de almoço.
        </p>
      </div>

      <div>
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            update((current) => ({
              ...current,
              movimento: {
                ...current.movimento,
                grade: {
                  seg: HOURS.map(() => 'fraco'),
                  ter: HOURS.map(() => 'fraco'),
                  qua: HOURS.map(() => 'fraco'),
                  qui: HOURS.map(() => 'fraco'),
                  sex: HOURS.map(() => 'fraco'),
                  sab: HOURS.map(() => 'fraco'),
                  dom: HOURS.map(() => 'fraco'),
                },
              },
            }))
          }
        >
          Começar com movimento fraco
        </Button>
      </div>

      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        {(['fraco', 'medio', 'forte', 'pico'] as MovementLevel[]).map((level) => (
          <span key={level} className="inline-flex items-center gap-1.5">
            <span className={cn('size-3 rounded-sm', LEVEL_CLASS[level])} />
            {LEVEL_LABEL[level]}
          </span>
        ))}
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[640px]">
          <div className="mb-1 grid grid-cols-[3rem_repeat(15,minmax(0,1fr))] gap-1 pl-0 text-center text-[11px] text-muted-foreground">
            <span />
            {HOURS.map((hour) => (
              <span key={hour}>{hour}h</span>
            ))}
          </div>
          <div className="flex flex-col gap-1">
            {DAYS.map((day) => (
              <div key={day.id} className="grid grid-cols-[3rem_repeat(15,minmax(0,1fr))] gap-1">
                <span className="self-center text-sm font-medium">{day.short}</span>
                {HOURS.map((hour, index) => {
                  const open = isHourOpen(draft.funcionamento.dias[day.id], hour)
                  const level = draft.movimento.grade[day.id][index]
                  return (
                    <button
                      key={hour}
                      type="button"
                      disabled={!open}
                      aria-label={`${day.label} ${hour}h, ${open ? LEVEL_LABEL[level] : 'fechado'}`}
                      onClick={() => setLevel(day.id, index)}
                      className={cn(
                        'h-7 rounded-md transition-colors',
                        open ? LEVEL_CLASS[level] : 'cursor-not-allowed bg-muted',
                      )}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <Field
        label="Em que dias e horários chega mercadoria?"
        htmlFor="mercadoria"
        why="A entrega pede gente no estoque sem tirar a cobertura do atendimento."
      >
        <Input
          id="mercadoria"
          value={draft.movimento.chegadaMercadoria}
          maxLength={200}
          placeholder="toda segunda às 15"
          onChange={(event) =>
            update((current) => ({
              ...current,
              movimento: {
                ...current.movimento,
                chegadaMercadoria: event.target.value.slice(0, 200),
              },
            }))
          }
        />
      </Field>

      <div className="flex flex-col gap-2">
        <SectionLabel icon={CalendarDays}>Meses mais fortes</SectionLabel>
        <div className="flex flex-wrap gap-2">
          {MESES.map((mes) => (
            <Chip
              key={mes.id}
              selected={draft.movimento.mesesFortes.includes(mes.id)}
              onClick={() =>
                update((current) => {
                  const selected = current.movimento.mesesFortes.includes(mes.id)
                  return {
                    ...current,
                    movimento: {
                      ...current.movimento,
                      mesesFortes: selected
                        ? current.movimento.mesesFortes.filter((id) => id !== mes.id)
                        : [...current.movimento.mesesFortes, mes.id],
                    },
                  }
                })
              }
            >
              {mes.label}
            </Chip>
          ))}
        </div>
      </div>
    </div>
  )
}

export function StepCobertura({ draft, update }: StepProps) {
  const names = cargoNames(draft)
  const lines = requirementLines(draft)
  const setMinimo = (key: 'fraco' | 'medio' | 'forte' | 'pico', value: string) =>
    update((current) => ({
      ...current,
      cobertura: { ...current.cobertura, [key]: onlyDigits(value, 3), conferido: false },
    }))

  return (
    <div className="flex flex-col gap-5">
      <div>
        <StepHeading icon={Shield} title="Cobertura mínima" />
        <SectionLabel icon={Users} className="mt-3">
          Mínimo total de pessoas trabalhando ao mesmo tempo
        </SectionLabel>
        <p className="mt-1 text-sm text-muted-foreground">
          Inclua vendedores, caixas e gerente neste total. Quem está no almoço não conta. Os mínimos por cargo abaixo fazem parte desse total; não são pessoas extras.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(
          [
            ['fraco', 'Fraco'],
            ['medio', 'Médio'],
            ['forte', 'Forte'],
            ['pico', 'Pico'],
          ] as const
        ).map(([key, label]) => (
          <Field key={key} label={label} htmlFor={`minimo-${key}`}>
            <Input
              id={`minimo-${key}`}
              inputMode="numeric"
              value={draft.cobertura[key]}
              onChange={(event) => setMinimo(key, event.target.value)}
            />
          </Field>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <SectionLabel icon={UserCheck}>
          Cargos que precisam estar presentes durante todo o atendimento
        </SectionLabel>
        {names.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Os cargos aparecem aqui conforme os setores e a equipe.
          </p>
        ) : (
          names.map((name) => {
            const key = cargoKey(name)
            const rule = draft.cobertura.porCargo[key] ?? { obrigatorio: false, minimo: '1' }
            return (
              <div key={key} className="flex flex-wrap items-center gap-3 border-b border-border py-3">
                <label className="inline-flex min-w-40 flex-1 items-center gap-2 text-sm">
                  <Checkbox
                    checked={rule.obrigatorio}
                    aria-label={`${name} presente durante todo o atendimento`}
                    onCheckedChange={(obrigatorio) =>
                      update((current) => ({
                        ...current,
                        cobertura: {
                          ...current.cobertura,
                          conferido: false,
                          porCargo: {
                            ...current.cobertura.porCargo,
                            [key]: { ...rule, obrigatorio },
                          },
                        },
                      }))
                    }
                  />
                  {name}
                </label>
                {rule.obrigatorio ? (
                  <label className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
                    Mínimo simultâneo
                    <Input
                      aria-label={`Mínimo simultâneo de ${name}`}
                      inputMode="numeric"
                      value={rule.minimo}
                      className="w-16"
                      onChange={(event) =>
                        update((current) => ({
                          ...current,
                          cobertura: {
                            ...current.cobertura,
                            conferido: false,
                            porCargo: {
                              ...current.cobertura.porCargo,
                              [key]: { ...rule, minimo: onlyDigits(event.target.value, 3) },
                            },
                          },
                        }))
                      }
                    />
                  </label>
                ) : null}
              </div>
            )
          })
        )}
        <p className="text-sm text-muted-foreground">
          Quem tem a chave é informado separadamente na etapa Equipe. Ter a chave não obriga essa pessoa a ficar presente durante todo o atendimento.
        </p>
      </div>

      <div className="rounded-2xl bg-muted/70 p-4 text-sm leading-relaxed">
        <p className="mb-2 font-medium">Exigência que será usada na escala</p>
        {lines.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>

      <label className="flex items-start gap-2 rounded-2xl border border-border p-3 text-sm">
        <Checkbox
          className="mt-0.5"
          checked={draft.cobertura.conferido}
          aria-label="Confirmar movimento e mínimos"
          onCheckedChange={(conferido) =>
            update((current) => ({
              ...current,
              cobertura: { ...current.cobertura, conferido },
            }))
          }
        />
        Conferi o movimento, os mínimos totais e os mínimos por cargo. Eles representam minha loja.
      </label>
    </div>
  )
}

function MoneyFields({
  horas,
  salario,
  premio,
  onHoras,
  onSalario,
  onPremio,
}: {
  horas: string
  salario: string
  premio: string
  onHoras: (value: string) => void
  onSalario: (value: string) => void
  onPremio: (value: string) => void
}) {
  return (
    <>
      <Field label="Horas de trabalho/semana" htmlFor={undefined}>
        <Input inputMode="numeric" aria-label="Horas de trabalho por semana" value={horas} onChange={(event) => onHoras(onlyDigits(event.target.value, 3))} />
      </Field>
      <Field label="Salário base R$">
        <Input inputMode="numeric" aria-label="Salário base" value={salario} onChange={(event) => onSalario(onlyDigits(event.target.value, 8))} />
      </Field>
      <Field label="Prêmio médio R$">
        <Input inputMode="numeric" aria-label="Prêmio médio" value={premio} onChange={(event) => onPremio(onlyDigits(event.target.value, 8))} />
      </Field>
    </>
  )
}

export function StepEquipe({ draft, update, notify }: StepProps) {
  const equipe = draft.equipe

  const changeMode = (modo: string) => {
    if (modo !== 'cargo' && modo !== 'pessoa') return
    if (modo === equipe.modo) return
    update((current) => ({
      ...current,
      cobertura: { ...current.cobertura, conferido: false },
      equipe: {
        ...current.equipe,
        modo,
        pessoas:
          modo === 'pessoa' && current.equipe.pessoas.length === 0
            ? seedPessoas(current.equipe.cargos)
            : current.equipe.pessoas,
      },
    }))
    notify('Confirme a cobertura mínima', 'A troca de modo pede uma nova conferência dos mínimos.')
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <StepHeading icon={Users} title="Equipe" />
        <p className="mt-1 text-sm text-muted-foreground">
          Informe as horas contratuais de trabalho, sem incluir o almoço não remunerado. Ao mudar de modo, confirma novamente a cobertura mínima.
        </p>
      </div>

      <Tabs value={equipe.modo} defaultValue={equipe.modo} onValueChange={changeMode}>
        <TabsList>
          <TabsTrigger value="cargo">Rápido, por cargo</TabsTrigger>
          <TabsTrigger value="pessoa">Completo, por pessoa</TabsTrigger>
        </TabsList>
      </Tabs>

      {equipe.modo === 'cargo' ? (
        <div className="flex flex-col gap-3">
          {equipe.cargos.map((cargo) => (
            <div key={cargo.id} className="rounded-2xl border border-border p-4">
              <div className="grid items-end gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.15fr)_minmax(4.5rem,0.65fr)_minmax(12rem,1.05fr)_minmax(9rem,0.9fr)_minmax(9rem,0.9fr)]">
                <Field label="Cargo">
                  <Input
                    aria-label="Cargo"
                    value={cargo.cargo}
                    maxLength={40}
                    onChange={(event) =>
                      update((current) => ({
                        ...current,
                        equipe: {
                          ...current.equipe,
                          cargos: current.equipe.cargos.map((item) =>
                            item.id === cargo.id ? { ...item, cargo: event.target.value.slice(0, 40) } : item,
                          ),
                        },
                      }))
                    }
                  />
                </Field>
                <Field label="Pessoas">
                  <Input
                    inputMode="numeric"
                    aria-label="Pessoas"
                    value={cargo.pessoas}
                    onChange={(event) =>
                      update((current) => ({
                        ...current,
                        equipe: {
                          ...current.equipe,
                          cargos: current.equipe.cargos.map((item) =>
                            item.id === cargo.id
                              ? { ...item, pessoas: onlyDigits(event.target.value, 3) }
                              : item,
                          ),
                        },
                      }))
                    }
                  />
                </Field>
                <MoneyFields
                  horas={cargo.horasSemana}
                  salario={cargo.salarioBase}
                  premio={cargo.premioMedio}
                  onHoras={(horasSemana) => patchCargo(update, cargo.id, { horasSemana })}
                  onSalario={(salarioBase) => patchCargo(update, cargo.id, { salarioBase })}
                  onPremio={(premioMedio) => patchCargo(update, cargo.id, { premioMedio })}
                />
              </div>
              <div className="mt-3 flex items-center justify-end gap-3">
                <label className="inline-flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={cargo.abreFecha}
                    aria-label={`${cargo.cargo || 'Cargo'} abre e fecha`}
                    onCheckedChange={(abreFecha) => patchCargo(update, cargo.id, { abreFecha })}
                  />
                  abre/fecha
                </label>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Remover ${cargo.cargo || 'cargo'}`}
                  onClick={() =>
                    update((current) => ({
                      ...current,
                      equipe: {
                        ...current.equipe,
                        cargos: current.equipe.cargos.filter((item) => item.id !== cargo.id),
                      },
                    }))
                  }
                >
                  <Trash2 className="text-destructive" />
                </Button>
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            className="self-start"
            onClick={() =>
              update((current) => ({
                ...current,
                equipe: { ...current.equipe, cargos: [...current.equipe.cargos, blankCargo()] },
              }))
            }
          >
            <Plus />
            Adicionar cargo
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {equipe.pessoas.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma pessoa ainda. Adicione quem trabalha na loja.</p>
          ) : null}
          {equipe.pessoas.map((pessoa) => (
            <div key={pessoa.id} className="rounded-2xl border border-border p-4">
              <div className="grid items-end gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(12rem,1.05fr)_minmax(9rem,0.9fr)_minmax(9rem,0.9fr)]">
                <Field label="Nome">
                  <Input
                    aria-label="Nome"
                    value={pessoa.nome}
                    maxLength={60}
                    onChange={(event) => patchPessoa(update, pessoa.id, { nome: event.target.value.slice(0, 60) })}
                  />
                </Field>
                <Field label="Cargo">
                  <Input
                    aria-label="Cargo da pessoa"
                    value={pessoa.cargo}
                    maxLength={40}
                    onChange={(event) => patchPessoa(update, pessoa.id, { cargo: event.target.value.slice(0, 40) })}
                  />
                </Field>
                <MoneyFields
                  horas={pessoa.horasSemana}
                  salario={pessoa.salarioBase}
                  premio={pessoa.premioMedio}
                  onHoras={(horasSemana) => patchPessoa(update, pessoa.id, { horasSemana })}
                  onSalario={(salarioBase) => patchPessoa(update, pessoa.id, { salarioBase })}
                  onPremio={(premioMedio) => patchPessoa(update, pessoa.id, { premioMedio })}
                />
              </div>
              <div className="mt-3 flex items-center justify-end gap-3">
                <label className="inline-flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={pessoa.abreFecha}
                    aria-label={`${pessoa.nome || 'Pessoa'} abre e fecha`}
                    onCheckedChange={(abreFecha) => patchPessoa(update, pessoa.id, { abreFecha })}
                  />
                  abre/fecha
                </label>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Remover ${pessoa.nome || 'pessoa'}`}
                  onClick={() =>
                    update((current) => ({
                      ...current,
                      equipe: {
                        ...current.equipe,
                        pessoas: current.equipe.pessoas.filter((item) => item.id !== pessoa.id),
                      },
                    }))
                  }
                >
                  <Trash2 className="text-destructive" />
                </Button>
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            className="self-start"
            onClick={() =>
              update((current) => ({
                ...current,
                equipe: {
                  ...current.equipe,
                  pessoas: [
                    ...current.equipe.pessoas,
                    {
                      id: blankCargo().id,
                      nome: '',
                      cargo: '',
                      horasSemana: '44',
                      salarioBase: '',
                      premioMedio: '',
                      abreFecha: false,
                    },
                  ],
                },
              }))
            }
          >
            <Plus />
            Adicionar pessoa
          </Button>
        </div>
      )}
    </div>
  )
}

function patchCargo(
  update: StepProps['update'],
  id: string,
  patch: Partial<AnaliseDraft['equipe']['cargos'][number]>,
) {
  update((current) => ({
    ...current,
    equipe: {
      ...current.equipe,
      cargos: current.equipe.cargos.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    },
  }))
}

function patchPessoa(
  update: StepProps['update'],
  id: string,
  patch: Partial<AnaliseDraft['equipe']['pessoas'][number]>,
) {
  update((current) => ({
    ...current,
    equipe: {
      ...current.equipe,
      pessoas: current.equipe.pessoas.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    },
  }))
}

export function StepRegras({ draft, update }: StepProps) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <StepHeading icon={Scale} title="Regras de hoje" />
        <p className="mt-1 text-sm text-muted-foreground">
          “Não sei” é tratado como não, por segurança, e vira uma pendência no seu plano de ação.
        </p>
      </div>
      {REGRAS.map((regra) => (
        <div key={regra.id} className="flex flex-col gap-2 border-b border-border pb-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-medium">{regra.label}</p>
            <WhyAsk>{regra.why}</WhyAsk>
          </div>
          <ChoiceGroup
            label={regra.label}
            value={draft.regras[regra.id]}
            options={ANSWER_OPTIONS}
            onChange={(value) =>
              update((current) => ({
                ...current,
                regras: { ...current.regras, [regra.id]: value as YesNoUnknown },
              }))
            }
          />
        </div>
      ))}
      <Field label="Média de horas extras por mês da equipe" htmlFor="horas-extras">
        <Input
          id="horas-extras"
          inputMode="numeric"
          value={draft.regras.mediaHorasExtras}
          onChange={(event) =>
            update((current) => ({
              ...current,
              regras: {
                ...current.regras,
                mediaHorasExtras: onlyDigits(event.target.value, 4),
              },
            }))
          }
        />
      </Field>
    </div>
  )
}

export function StepPrioridades({ draft, update }: StepProps) {
  const ordem = draft.prioridades.ordem
  return (
    <div className="flex flex-col gap-5">
      <div>
        <StepHeading icon={Flag} title="Prioridades" />
        <p className="mt-1 text-sm text-muted-foreground">
          Coloque em ordem do mais importante para o menos importante.
        </p>
      </div>
      <ol className="flex flex-col gap-2">
        {ordem.map((id, index) => {
          const item = PRIORIDADES.find((prioridade) => prioridade.id === id)
          if (!item) return null
          return (
            <li key={id} className="flex items-center gap-3 rounded-2xl border border-border px-3 py-2">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                {index + 1}
              </span>
              <span className="min-w-0 flex-1 text-sm">{item.label}</span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label={`Subir ${item.label}`}
                disabled={index === 0}
                onClick={() =>
                  update((current) => ({
                    ...current,
                    prioridades: {
                      ...current.prioridades,
                      ordem: moveItem(current.prioridades.ordem, index, -1),
                    },
                  }))
                }
              >
                <ArrowUp />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label={`Descer ${item.label}`}
                disabled={index === ordem.length - 1}
                onClick={() =>
                  update((current) => ({
                    ...current,
                    prioridades: {
                      ...current.prioridades,
                      ordem: moveItem(current.prioridades.ordem, index, 1),
                    },
                  }))
                }
              >
                <ArrowDown />
              </Button>
            </li>
          )
        })}
      </ol>
      <div className="flex flex-col gap-3">
        <CheckLine
          checked={draft.prioridades.aceitaMeioPeriodo}
          label="Aceito contratar meio período"
          onChange={(aceitaMeioPeriodo) =>
            update((current) => ({
              ...current,
              prioridades: { ...current.prioridades, aceitaMeioPeriodo },
            }))
          }
        />
        <CheckLine
          checked={draft.prioridades.aceitaReduzirHorario}
          label="Aceito reduzir o horário em dias fracos"
          onChange={(aceitaReduzirHorario) =>
            update((current) => ({
              ...current,
              prioridades: { ...current.prioridades, aceitaReduzirHorario },
            }))
          }
        />
        <CheckLine
          checked={draft.prioridades.aceitaTreinar}
          label="Aceito treinar pessoas para atuar em mais de um setor"
          onChange={(aceitaTreinar) =>
            update((current) => ({
              ...current,
              prioridades: { ...current.prioridades, aceitaTreinar },
            }))
          }
        />
      </div>
    </div>
  )
}

function CheckLine({
  checked,
  label,
  onChange,
}: {
  checked: boolean
  label: string
  onChange: (checked: boolean) => void
}) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <Checkbox checked={checked} aria-label={label} onCheckedChange={onChange} />
      {label}
    </label>
  )
}
