'use client'

import {
  BarChart3,
  Calculator,
  ChevronLeft,
  ChevronRight,
  Clock,
  Flag,
  Scale,
  Shield,
  Store,
  Users,
  type IconProps,
} from '@/components/ui/icons'
import { useEffect, useState, type ComponentType } from 'react'
import {
  StepCobertura,
  StepEquipe,
  StepFuncionamento,
  StepLoja,
  StepMovimento,
  StepPrioridades,
  StepRegras,
} from '@/components/analise/form-steps'
import { Field } from '@/components/analise/parts'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/toast'
import {
  DAYS,
  PRIORIDADES,
  FATURAMENTOS,
  STEPS,
  cargoNames,
  contatoErrors,
  loadDraft,
  saveDraft,
  type AnaliseDraft,
} from '@/lib/analise-draft'
import { cn } from '@/lib/utils'

const STEP_VIEWS = [
  StepLoja,
  StepFuncionamento,
  StepMovimento,
  StepCobertura,
  StepEquipe,
  StepRegras,
  StepPrioridades,
]

const STEP_ICONS: Record<(typeof STEPS)[number]['id'], ComponentType<IconProps>> = {
  loja: Store,
  funcionamento: Clock,
  movimento: BarChart3,
  cobertura: Shield,
  equipe: Users,
  regras: Scale,
  prioridades: Flag,
}

function PageTitle() {
  return (
    <h1 className="flex items-center gap-2.5 font-heading text-2xl font-bold tracking-tight">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
        <Calculator className="size-5" aria-hidden />
      </span>
      <span>
        <span className="text-primary">Calculadora</span> de Escala 5x2
      </span>
    </h1>
  )
}

export function AnaliseWizard() {
  const { toast } = useToast()
  const [draft, setDraft] = useState<AnaliseDraft | null>(null)
  const [ready, setReady] = useState(false)
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [receipt, setReceipt] = useState(false)
  const [leadOpen, setLeadOpen] = useState(false)
  const [lead, setLead] = useState({ nome: '', telefone: '', email: '' })
  const [leadErrors, setLeadErrors] = useState<Partial<Record<'nome' | 'telefone' | 'email', string>>>({})

  useEffect(() => {
    setDraft(loadDraft())
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready || !draft) return
    setSaveState('saving')
    const timer = window.setTimeout(() => {
      try {
        saveDraft(draft)
        setSaveState('saved')
      } catch {
        setSaveState('error')
      }
    }, 250)
    return () => window.clearTimeout(timer)
  }, [draft, ready])

  const update = (recipe: (current: AnaliseDraft) => AnaliseDraft) => {
    setDraft((current) => (current ? recipe(current) : current))
  }

  const notify = (title: string, description?: string) => {
    toast({ title, description, variant: description ? 'info' : 'success' })
  }

  if (!draft) {
    return (
      <div className="mx-auto w-full max-w-[calc(48rem+190px+18rem)] px-4 py-6 sm:px-6">
        <PageTitle />
        <div className="mt-6 grid gap-8 md:grid-cols-[15rem_minmax(0,1fr)]">
        <div className="flex flex-col gap-3">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-2 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
        <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      </div>
    )
  }

  const step = draft.step
  const Step = STEP_VIEWS[step] ?? StepLoja
  const openDays = DAYS.filter((day) => draft.funcionamento.dias[day.id].aberto).length
  const faturamento = FATURAMENTOS.find((item) => item.value === draft.loja.faturamentoMensal)?.label

  const goTo = (index: number) => {
    setReceipt(false)
    update((current) => ({ ...current, step: index }))
  }

  const validateForward = () => {
    if (step === 0 && !draft.loja.nome.trim()) {
      toast({ title: 'Informe o nome da loja', variant: 'warning' })
      return false
    }
    if (step === 3 && !draft.cobertura.conferido) {
      toast({
        title: 'Confirme a cobertura',
        description: 'Marque que o movimento e os mínimos representam a loja.',
        variant: 'warning',
      })
      return false
    }
    return true
  }

  const finish = () => {
    if (!draft.loja.nome.trim()) {
      toast({ title: 'Informe o nome da loja', variant: 'warning' })
      goTo(0)
      return
    }
    if (!draft.cobertura.conferido) {
      toast({
        title: 'Confirme a cobertura mínima',
        description: 'A análise usa os mínimos que você conferir.',
        variant: 'warning',
      })
      goTo(3)
      return
    }
    setLead({
      nome: draft.contato?.nome ?? '',
      telefone: formatPhone(draft.contato?.telefone ?? ''),
      email: draft.contato?.email ?? '',
    })
    setLeadErrors({})
    setLeadOpen(true)
  }

  const confirmLead = () => {
    const next = {
      nome: lead.nome.trim().slice(0, 80),
      telefone: lead.telefone.replace(/\D/g, '').slice(0, 11),
      email: lead.email.trim().toLowerCase().slice(0, 120),
    }
    const errors = contatoErrors(next)
    setLeadErrors(errors)
    if (errors.nome || errors.telefone || errors.email) return
    update((current) => ({ ...current, contato: next }))
    setLeadOpen(false)
    setReceipt(true)
  }

  return (
    <div className="mx-auto w-full max-w-[calc(48rem+190px+18rem)] px-4 py-6 sm:px-6">
    <PageTitle />
    <div className="mt-6 grid gap-8 md:grid-cols-[15rem_minmax(0,1fr)] md:items-start">
      <aside className="md:sticky md:top-6">
        <p className="text-sm font-semibold">
          {receipt
            ? 'Dados guardados neste navegador'
            : `Etapa ${step + 1} de ${STEPS.length}: ${STEPS[step].label}`}
        </p>
        <p
          className={cn(
            'mt-1 text-sm text-muted-foreground',
            saveState === 'error' && 'text-destructive',
          )}
          aria-live="polite"
        >
          {saveState === 'error'
            ? 'Não foi possível salvar neste navegador'
            : saveState === 'saving'
              ? 'Salvando...'
              : 'Salvo automaticamente'}
        </p>
        <Progress value={((step + 1) / STEPS.length) * 100} className="mt-3 h-1.5" />

        <nav className="mt-4 flex flex-col items-start gap-1">
          {STEPS.map((item, index) => {
            const Icon = STEP_ICONS[item.id]
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => goTo(index)}
                aria-current={index === step && !receipt ? 'step' : undefined}
                className={cn(
                  'inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-left text-sm transition-colors',
                  index === step && !receipt
                    ? 'bg-primary font-semibold text-primary-foreground'
                    : 'font-medium text-muted-foreground hover:text-foreground',
                )}
              >
                <Icon className="size-4 shrink-0" aria-hidden />
                {index + 1}. {item.label}
              </button>
            )
          })}
        </nav>
      </aside>

      <div className="min-w-0">
      {receipt ? (
        <Card>
          <CardContent className="flex flex-col gap-3 py-6">
            <h2 className="font-heading text-xl font-semibold tracking-tight">Dados guardados</h2>
            <p className="text-sm text-muted-foreground">
              As respostas de {draft.loja.nome} ficaram neste navegador. A análise da escala entra quando as regras forem aplicadas.
            </p>
            <dl className="grid gap-2 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">Loja</dt>
                <dd>{draft.loja.nome}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Cidade</dt>
                <dd>{[draft.loja.cidade, draft.loja.uf].filter(Boolean).join(' / ') || '—'}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Faturamento médio</dt>
                <dd>{faturamento || '—'}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Dias abertos</dt>
                <dd>{openDays}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Cargos</dt>
                <dd>{cargoNames(draft).join(', ') || '—'}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Prioridade principal</dt>
                <dd>
                  {PRIORIDADES.find((item) => item.id === draft.prioridades.ordem[0])?.label ?? '—'}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Contato</dt>
                <dd>{draft.contato?.nome || '—'}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-6">
            <Step draft={draft} update={update} notify={notify} />
          </CardContent>
        </Card>
      )}

      <div className="mt-4 flex items-center justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="rounded-xl"
          disabled={!receipt && step === 0}
          onClick={() => {
            if (receipt) {
              setReceipt(false)
              return
            }
            goTo(step - 1)
          }}
        >
          <ChevronLeft />
          {receipt ? 'Revisar dados' : 'Voltar'}
        </Button>
        {receipt ? null : step < STEPS.length - 1 ? (
          <Button type="button" size="lg" className="rounded-xl" onClick={() => validateForward() && goTo(step + 1)}>
            Próximo
            <ChevronRight />
          </Button>
        ) : (
          <Button type="button" size="lg" className="rounded-xl" onClick={finish}>
            Gerar meu resultado
            <ChevronRight />
          </Button>
        )}
      </div>
      </div>
    </div>
    <Dialog
      open={leadOpen}
      onClose={() => setLeadOpen(false)}
      title="Para ver o resultado"
      description="Informe nome, telefone e e-mail. Esses dados ficam só neste navegador."
      footer={
        <>
          <Button type="button" variant="outline" onClick={() => setLeadOpen(false)}>
            Cancelar
          </Button>
          <Button type="submit" form="contato-resultado">
            Ver resultado
          </Button>
        </>
      }
    >
      <form
        id="contato-resultado"
        className="flex flex-col gap-4"
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          confirmLead()
        }}
      >
        <Field label="Nome" htmlFor="contato-nome">
          <Input
            id="contato-nome"
            name="name"
            autoComplete="name"
            maxLength={80}
            value={lead.nome}
            aria-invalid={Boolean(leadErrors.nome)}
            onChange={(event) => setLead((current) => ({ ...current, nome: event.target.value.slice(0, 80) }))}
          />
          {leadErrors.nome ? <p className="text-sm text-destructive">{leadErrors.nome}</p> : null}
        </Field>
        <Field label="Telefone" htmlFor="contato-telefone">
          <Input
            id="contato-telefone"
            name="tel"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            maxLength={15}
            placeholder="(11) 99999-9999"
            value={lead.telefone}
            aria-invalid={Boolean(leadErrors.telefone)}
            onChange={(event) =>
              setLead((current) => ({ ...current, telefone: formatPhone(event.target.value) }))
            }
          />
          {leadErrors.telefone ? <p className="text-sm text-destructive">{leadErrors.telefone}</p> : null}
        </Field>
        <Field label="E-mail" htmlFor="contato-email">
          <Input
            id="contato-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            maxLength={120}
            value={lead.email}
            aria-invalid={Boolean(leadErrors.email)}
            onChange={(event) => setLead((current) => ({ ...current, email: event.target.value.slice(0, 120) }))}
          />
          {leadErrors.email ? <p className="text-sm text-destructive">{leadErrors.email}</p> : null}
        </Field>
      </form>
    </Dialog>
    </div>
  )
}

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 2) return digits
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}
