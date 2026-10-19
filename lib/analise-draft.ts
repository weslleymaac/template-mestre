export const STORAGE_KEY = 'escala5x2:analise:v1'

export const STEPS = [
  { id: 'loja', label: 'Sua loja' },
  { id: 'funcionamento', label: 'Funcionamento' },
  { id: 'movimento', label: 'Movimento' },
  { id: 'cobertura', label: 'Cobertura mínima' },
  { id: 'equipe', label: 'Equipe' },
  { id: 'regras', label: 'Regras de hoje' },
  { id: 'prioridades', label: 'Prioridades' },
] as const

export const DAY_IDS = ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'] as const
export type DayId = (typeof DAY_IDS)[number]

export const DAYS: { id: DayId; short: string; label: string }[] = [
  { id: 'seg', short: 'Seg', label: 'Segunda' },
  { id: 'ter', short: 'Ter', label: 'Terça' },
  { id: 'qua', short: 'Qua', label: 'Quarta' },
  { id: 'qui', short: 'Qui', label: 'Quinta' },
  { id: 'sex', short: 'Sex', label: 'Sexta' },
  { id: 'sab', short: 'Sáb', label: 'Sábado' },
  { id: 'dom', short: 'Dom', label: 'Domingo' },
]

export const HOURS = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20] as const

export const LEVELS = ['fraco', 'medio', 'forte', 'pico'] as const
export type MovementLevel = (typeof LEVELS)[number]

export const LEVEL_LABEL: Record<MovementLevel, string> = {
  fraco: 'fraco',
  medio: 'médio',
  forte: 'forte',
  pico: 'pico',
}

export const ANSWERS = ['sim', 'nao', 'nao-sei'] as const
export type YesNoUnknown = (typeof ANSWERS)[number]

export const SETORES = [
  { id: 'salao', label: 'Salão de vendas', cargo: 'Vendedor' },
  { id: 'caixa', label: 'Caixa', cargo: 'Caixa' },
  { id: 'crediario', label: 'Crediário ou financeiro', cargo: 'Crediário' },
  { id: 'estoque', label: 'Estoque e recebimento', cargo: 'Estoque' },
  { id: 'vitrine', label: 'Vitrine e visual', cargo: 'Vitrine' },
  { id: 'delivery', label: 'Delivery ou e-commerce', cargo: 'Delivery' },
  { id: 'limpeza', label: 'Limpeza', cargo: 'Limpeza' },
] as const

export const FATURAMENTOS = [
  { value: 'ate-50', label: 'Até 50 mil por mês' },
  { value: '50-100', label: 'Entre 50 e 100 mil' },
  { value: '100-150', label: 'Entre 100 e 150 mil' },
  { value: '150-200', label: 'Entre 150 e 200 mil' },
  { value: '200-300', label: 'Entre 200 e 300 mil' },
  { value: '300-400', label: 'Entre 300 e 400 mil' },
  { value: '400-500', label: 'Entre 400 e 500 mil' },
  { value: '500-800', label: 'Entre 500 e 800 mil' },
  { value: 'acima-800', label: 'Acima de 800 mil' },
]

export const LOCAIS = [
  { value: 'rua', label: 'Rua' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'galeria', label: 'Galeria' },
  { value: 'predio', label: 'Prédio comercial' },
  { value: 'outro', label: 'Outro' },
]

export const REGIMES = [
  { value: 'simples', label: 'Simples Nacional' },
  { value: 'presumido', label: 'Lucro Presumido' },
  { value: 'real', label: 'Lucro Real' },
  { value: 'mei', label: 'MEI' },
]

export const ALMOCOS = [
  { value: '30', label: '30 minutos' },
  { value: '60', label: '1 hora' },
  { value: '90', label: '1 hora e 30 minutos' },
  { value: '120', label: '2 horas' },
]

export const FERIADOS = [
  { value: 'nenhum', label: 'Não abro em feriados' },
  { value: 'alguns', label: 'Abro em alguns feriados' },
  { value: 'todos', label: 'Abro em todos os feriados' },
]

export const UFS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
].map((uf) => ({ value: uf, label: uf }))

export const MESES = [
  { id: 'jan', label: 'Jan' },
  { id: 'fev', label: 'Fev' },
  { id: 'mar', label: 'Mar' },
  { id: 'abr', label: 'Abr' },
  { id: 'mai', label: 'Mai' },
  { id: 'jun', label: 'Jun' },
  { id: 'jul', label: 'Jul' },
  { id: 'ago', label: 'Ago' },
  { id: 'set', label: 'Set' },
  { id: 'out', label: 'Out' },
  { id: 'nov', label: 'Nov' },
  { id: 'dez', label: 'Dez' },
] as const

export const PRIORIDADES = [
  { id: 'custo', label: 'Não aumentar o custo' },
  { id: 'horario', label: 'Manter o horário de funcionamento' },
  { id: 'contratacao', label: 'Não contratar' },
  { id: 'folgas', label: 'Folgas mais justas para a equipe' },
] as const

export const REGRAS = [
  {
    id: 'convencao',
    label: 'Tem convenção coletiva do sindicato?',
    why: 'A convenção pode limitar jornada, folga e banco de horas. Sem a regra, a análise trata como não autorizado.',
  },
  {
    id: 'bancoHoras',
    label: 'Autoriza banco de horas?',
    why: 'Define se a hora a mais pode ser compensada em folga em vez de pagamento.',
  },
  {
    id: 'jornadaAcima8h',
    label: 'Autoriza jornada acima de 8h por dia na transição?',
    why: 'Na troca de escala, alguém pode precisar passar de 8 horas em um dia.',
  },
  {
    id: 'almoco30',
    label: 'Autoriza intervalo de almoço de 30 minutos?',
    why: 'O intervalo muda quantas pessoas precisam estar na loja ao mesmo tempo.',
  },
  {
    id: 'feriados',
    label: 'Autoriza trabalho em feriados?',
    why: 'Se a loja abre no feriado, a escala só pode contar com quem pode trabalhar nesse dia.',
  },
  {
    id: 'mediaDuasFolgas',
    label: 'Permite média de 2 folgas por semana no mês?',
    why: 'Algumas escalas alternam a folga. A média do mês precisa caber na regra da loja.',
  },
  {
    id: 'pontoEletronico',
    label: 'Usa ponto eletrônico?',
    why: 'O ponto muda como a jornada e o intervalo são registrados.',
  },
] as const

export type RegraId = (typeof REGRAS)[number]['id']

export type DaySchedule = {
  aberto: boolean
  abre: string
  fecha: string
}

export type CargoDraft = {
  id: string
  cargo: string
  pessoas: string
  horasSemana: string
  salarioBase: string
  premioMedio: string
  abreFecha: boolean
}

export type PessoaDraft = {
  id: string
  nome: string
  cargo: string
  horasSemana: string
  salarioBase: string
  premioMedio: string
  abreFecha: boolean
}

export type CoberturaCargo = {
  obrigatorio: boolean
  minimo: string
}

export type AnaliseDraft = {
  version: 1
  step: number
  loja: {
    nome: string
    cidade: string
    uf: string
    faturamentoMensal: string
    unidades: string
    ondeFica: string
    regimeTributario: string
  }
  funcionamento: {
    descricaoLivre: string
    dias: Record<DayId, DaySchedule>
    minutosAntes: string
    minutosDepois: string
    almoco: string
    feriados: string
    setores: string[]
    datasEstendidas: string
  }
  movimento: {
    grade: Record<DayId, MovementLevel[]>
    chegadaMercadoria: string
    mesesFortes: string[]
  }
  cobertura: {
    fraco: string
    medio: string
    forte: string
    pico: string
    porCargo: Record<string, CoberturaCargo>
    conferido: boolean
  }
  equipe: {
    modo: 'cargo' | 'pessoa'
    cargos: CargoDraft[]
    pessoas: PessoaDraft[]
  }
  regras: Record<RegraId, YesNoUnknown> & { mediaHorasExtras: string }
  prioridades: {
    ordem: string[]
    aceitaMeioPeriodo: boolean
    aceitaReduzirHorario: boolean
    aceitaTreinar: boolean
  }
  contato: {
    nome: string
    telefone: string
    email: string
  }
  updatedAt: string | null
}

const WEEKDAY: MovementLevel[] = [
  'fraco', 'fraco', 'medio', 'fraco', 'fraco', 'forte', 'forte', 'forte',
  'fraco', 'fraco', 'fraco', 'fraco', 'pico', 'medio', 'fraco',
]
const SATURDAY: MovementLevel[] = [
  'fraco', 'fraco', 'medio', 'medio', 'medio', 'forte', 'forte', 'forte',
  'medio', 'medio', 'medio', 'medio', 'pico', 'medio', 'medio',
]
const SUNDAY: MovementLevel[] = [
  'fraco', 'fraco', 'medio', 'medio', 'medio', 'medio', 'fraco', 'fraco',
  'fraco', 'fraco', 'fraco', 'fraco', 'fraco', 'fraco', 'fraco',
]

const DAY_WORD: Record<string, number> = {
  segunda: 0,
  seg: 0,
  terca: 1,
  ter: 1,
  quarta: 2,
  qua: 2,
  quinta: 3,
  qui: 3,
  sexta: 4,
  sex: 4,
  sabado: 5,
  sab: 5,
  domingo: 6,
  dom: 6,
}

const DAY_TOKEN =
  'segunda|terca|quarta|quinta|sexta|sabado|domingo|seg|ter|qua|qui|sex|sab|dom'

export function createId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function nextLevel(level: MovementLevel): MovementLevel {
  const index = LEVELS.indexOf(level)
  return LEVELS[(index + 1) % LEVELS.length]
}

export function cargoKey(name: string) {
  return name.trim().toLocaleLowerCase('pt-BR')
}

function text(value: unknown, max: number) {
  if (typeof value !== 'string') return ''
  return value.replace(/[\u0000-\u001F\u007F]/g, '').slice(0, max)
}

function digits(value: unknown, max: number) {
  if (typeof value !== 'string' && typeof value !== 'number') return ''
  return String(value).replace(/\D/g, '').slice(0, max)
}

function flag(value: unknown, fallback = false) {
  return typeof value === 'boolean' ? value : fallback
}

function oneOf<T extends string>(value: unknown, options: readonly T[], fallback: T): T {
  return options.includes(value as T) ? (value as T) : fallback
}

function timeValue(value: unknown, fallback: string) {
  if (typeof value !== 'string' || !/^\d{2}:\d{2}$/.test(value)) return fallback
  const [hour, minute] = value.split(':').map(Number)
  if (hour > 23 || minute > 59) return fallback
  return value
}

function defaultDays(): Record<DayId, DaySchedule> {
  return {
    seg: { aberto: true, abre: '06:00', fecha: '21:00' },
    ter: { aberto: true, abre: '06:00', fecha: '21:00' },
    qua: { aberto: true, abre: '06:00', fecha: '21:00' },
    qui: { aberto: true, abre: '06:00', fecha: '21:00' },
    sex: { aberto: true, abre: '06:00', fecha: '21:00' },
    sab: { aberto: true, abre: '06:00', fecha: '21:00' },
    dom: { aberto: true, abre: '06:00', fecha: '15:00' },
  }
}

function defaultGrade(): Record<DayId, MovementLevel[]> {
  return {
    seg: [...WEEKDAY],
    ter: [...WEEKDAY],
    qua: [...WEEKDAY],
    qui: [...WEEKDAY],
    sex: [...WEEKDAY],
    sab: [...SATURDAY],
    dom: [...SUNDAY],
  }
}

export function blankCargo(cargo = ''): CargoDraft {
  return {
    id: createId(),
    cargo,
    pessoas: '1',
    horasSemana: '44',
    salarioBase: '',
    premioMedio: '',
    abreFecha: false,
  }
}

export function createDefaultDraft(): AnaliseDraft {
  return {
    version: 1,
    step: 0,
    loja: {
      nome: '',
      cidade: '',
      uf: '',
      faturamentoMensal: '',
      unidades: '1',
      ondeFica: '',
      regimeTributario: '',
    },
    funcionamento: {
      descricaoLivre: '',
      dias: defaultDays(),
      minutosAntes: '5',
      minutosDepois: '10',
      almoco: '60',
      feriados: '',
      setores: [],
      datasEstendidas: '',
    },
    movimento: {
      grade: defaultGrade(),
      chegadaMercadoria: '',
      mesesFortes: [],
    },
    cobertura: {
      fraco: '2',
      medio: '3',
      forte: '4',
      pico: '6',
      porCargo: {},
      conferido: false,
    },
    equipe: {
      modo: 'cargo',
      cargos: [
        {
          id: 'gerente',
          cargo: 'Gerente',
          pessoas: '1',
          horasSemana: '44',
          salarioBase: '',
          premioMedio: '',
          abreFecha: true,
        },
      ],
      pessoas: [],
    },
    regras: {
      convencao: 'nao-sei',
      bancoHoras: 'nao-sei',
      jornadaAcima8h: 'nao-sei',
      almoco30: 'nao-sei',
      feriados: 'nao-sei',
      mediaDuasFolgas: 'nao-sei',
      pontoEletronico: 'nao-sei',
      mediaHorasExtras: '0',
    },
    prioridades: {
      ordem: PRIORIDADES.map((item) => item.id),
      aceitaMeioPeriodo: false,
      aceitaReduzirHorario: false,
      aceitaTreinar: false,
    },
    contato: {
      nome: '',
      telefone: '',
      email: '',
    },
    updatedAt: null,
  }
}

function normalizeDays(value: unknown): Record<DayId, DaySchedule> {
  const base = defaultDays()
  if (!value || typeof value !== 'object') return base
  const record = value as Record<string, unknown>
  for (const day of DAY_IDS) {
    const item = record[day]
    if (!item || typeof item !== 'object') continue
    const row = item as Record<string, unknown>
    base[day] = {
      aberto: flag(row.aberto, true),
      abre: timeValue(row.abre, base[day].abre),
      fecha: timeValue(row.fecha, base[day].fecha),
    }
  }
  return base
}

function normalizeGrade(value: unknown): Record<DayId, MovementLevel[]> {
  const base = defaultGrade()
  if (!value || typeof value !== 'object') return base
  const record = value as Record<string, unknown>
  for (const day of DAY_IDS) {
    if (!Array.isArray(record[day])) continue
    base[day] = HOURS.map((_, index) => {
      const level = (record[day] as unknown[])[index]
      return LEVELS.includes(level as MovementLevel) ? (level as MovementLevel) : 'fraco'
    })
  }
  return base
}

function normalizeCargo(value: unknown): CargoDraft | null {
  if (!value || typeof value !== 'object') return null
  const row = value as Record<string, unknown>
  const id = text(row.id, 80)
  if (!id) return null
  return {
    id,
    cargo: text(row.cargo, 40),
    pessoas: digits(row.pessoas, 3),
    horasSemana: digits(row.horasSemana, 3),
    salarioBase: digits(row.salarioBase, 8),
    premioMedio: digits(row.premioMedio, 8),
    abreFecha: flag(row.abreFecha),
  }
}

function normalizePessoa(value: unknown): PessoaDraft | null {
  if (!value || typeof value !== 'object') return null
  const row = value as Record<string, unknown>
  const id = text(row.id, 80)
  if (!id) return null
  return {
    id,
    nome: text(row.nome, 60),
    cargo: text(row.cargo, 40),
    horasSemana: digits(row.horasSemana, 3),
    salarioBase: digits(row.salarioBase, 8),
    premioMedio: digits(row.premioMedio, 8),
    abreFecha: flag(row.abreFecha),
  }
}

export function normalizeDraft(value: unknown): AnaliseDraft {
  const base = createDefaultDraft()
  if (!value || typeof value !== 'object') return base
  const raw = value as Record<string, unknown>
  const loja = (raw.loja ?? {}) as Record<string, unknown>
  const funcionamento = (raw.funcionamento ?? {}) as Record<string, unknown>
  const movimento = (raw.movimento ?? {}) as Record<string, unknown>
  const cobertura = (raw.cobertura ?? {}) as Record<string, unknown>
  const equipe = (raw.equipe ?? {}) as Record<string, unknown>
  const regras = (raw.regras ?? {}) as Record<string, unknown>
  const prioridades = (raw.prioridades ?? {}) as Record<string, unknown>
  const contato = (raw.contato ?? {}) as Record<string, unknown>

  const setorIds = new Set(SETORES.map((item) => item.id))
  const mesIds = new Set(MESES.map((item) => item.id))
  const prioridadeIds = new Set(PRIORIDADES.map((item) => item.id))

  const porCargoRaw =
    cobertura.porCargo && typeof cobertura.porCargo === 'object'
      ? (cobertura.porCargo as Record<string, unknown>)
      : {}
  const porCargo: Record<string, CoberturaCargo> = {}
  for (const [key, item] of Object.entries(porCargoRaw).slice(0, 40)) {
    if (!item || typeof item !== 'object') continue
    const row = item as Record<string, unknown>
    porCargo[text(key, 40)] = {
      obrigatorio: flag(row.obrigatorio),
      minimo: digits(row.minimo, 3) || '1',
    }
  }

  const ordem = Array.isArray(prioridades.ordem)
    ? prioridades.ordem.filter((id): id is string => prioridadeIds.has(id as never))
    : []
  for (const item of PRIORIDADES) {
    if (!ordem.includes(item.id)) ordem.push(item.id)
  }

  return {
    version: 1,
    step: Math.min(STEPS.length - 1, Math.max(0, Number(raw.step) || 0)),
    loja: {
      nome: text(loja.nome, 80),
      cidade: text(loja.cidade, 60),
      uf: oneOf(text(loja.uf, 2).toUpperCase(), UFS.map((item) => item.value), ''),
      faturamentoMensal: oneOf(
        loja.faturamentoMensal,
        FATURAMENTOS.map((item) => item.value),
        '',
      ),
      unidades: digits(loja.unidades, 4) || '1',
      ondeFica: oneOf(loja.ondeFica, LOCAIS.map((item) => item.value), ''),
      regimeTributario: oneOf(loja.regimeTributario, REGIMES.map((item) => item.value), ''),
    },
    funcionamento: {
      descricaoLivre: text(funcionamento.descricaoLivre, 400),
      dias: normalizeDays(funcionamento.dias),
      minutosAntes: digits(funcionamento.minutosAntes, 3),
      minutosDepois: digits(funcionamento.minutosDepois, 3),
      almoco: oneOf(String(funcionamento.almoco ?? ''), ALMOCOS.map((item) => item.value), '60'),
      feriados: oneOf(funcionamento.feriados, FERIADOS.map((item) => item.value), ''),
      setores: Array.isArray(funcionamento.setores)
        ? funcionamento.setores.filter((id): id is string => setorIds.has(id as never)).slice(0, SETORES.length)
        : [],
      datasEstendidas: text(funcionamento.datasEstendidas, 200),
    },
    movimento: {
      grade: normalizeGrade(movimento.grade),
      chegadaMercadoria: text(movimento.chegadaMercadoria, 200),
      mesesFortes: Array.isArray(movimento.mesesFortes)
        ? movimento.mesesFortes.filter((id): id is string => mesIds.has(id as never))
        : [],
    },
    cobertura: {
      fraco: digits(cobertura.fraco, 3),
      medio: digits(cobertura.medio, 3),
      forte: digits(cobertura.forte, 3),
      pico: digits(cobertura.pico, 3),
      porCargo,
      conferido: flag(cobertura.conferido),
    },
    equipe: {
      modo: equipe.modo === 'pessoa' ? 'pessoa' : 'cargo',
      cargos: Array.isArray(equipe.cargos)
        ? equipe.cargos.map(normalizeCargo).filter((item): item is CargoDraft => item !== null).slice(0, 30)
        : base.equipe.cargos,
      pessoas: Array.isArray(equipe.pessoas)
        ? equipe.pessoas.map(normalizePessoa).filter((item): item is PessoaDraft => item !== null).slice(0, 40)
        : [],
    },
    regras: {
      convencao: oneOf(regras.convencao, ANSWERS, 'nao-sei'),
      bancoHoras: oneOf(regras.bancoHoras, ANSWERS, 'nao-sei'),
      jornadaAcima8h: oneOf(regras.jornadaAcima8h, ANSWERS, 'nao-sei'),
      almoco30: oneOf(regras.almoco30, ANSWERS, 'nao-sei'),
      feriados: oneOf(regras.feriados, ANSWERS, 'nao-sei'),
      mediaDuasFolgas: oneOf(regras.mediaDuasFolgas, ANSWERS, 'nao-sei'),
      pontoEletronico: oneOf(regras.pontoEletronico, ANSWERS, 'nao-sei'),
      mediaHorasExtras: digits(regras.mediaHorasExtras, 4) || '0',
    },
    prioridades: {
      ordem,
      aceitaMeioPeriodo: flag(prioridades.aceitaMeioPeriodo),
      aceitaReduzirHorario: flag(prioridades.aceitaReduzirHorario),
      aceitaTreinar: flag(prioridades.aceitaTreinar),
    },
    contato: {
      nome: text(contato.nome, 80).trim(),
      telefone: digits(contato.telefone, 11),
      email: text(contato.email, 120).trim().toLowerCase(),
    },
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt.slice(0, 40) : null,
  }
}

export function contatoErrors(contato: { nome: string; telefone: string; email: string }) {
  const errors: Partial<Record<'nome' | 'telefone' | 'email', string>> = {}
  const nome = contato.nome.trim()
  const telefone = contato.telefone.replace(/\D/g, '')
  const email = contato.email.trim().toLowerCase()
  if (nome.length < 2 || nome.length > 80) errors.nome = 'Informe o nome completo.'
  if (telefone.length < 10 || telefone.length > 11) errors.telefone = 'Informe o telefone com DDD.'
  if (email.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    errors.email = 'Informe um e-mail válido.'
  }
  return errors
}

export function loadDraft(): AnaliseDraft {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw || raw.length > 200_000) return createDefaultDraft()
    return normalizeDraft(JSON.parse(raw) as unknown)
  } catch {
    return createDefaultDraft()
  }
}

export function saveDraft(draft: AnaliseDraft) {
  const safe = normalizeDraft({ ...draft, updatedAt: new Date().toISOString() })
  localStorage.setItem(STORAGE_KEY, JSON.stringify(safe))
  return safe.updatedAt
}

export function minutesOf(value: string) {
  const [hour, minute] = value.split(':').map(Number)
  if (Number.isNaN(hour) || Number.isNaN(minute)) return 0
  return hour * 60 + minute
}

export function isHourOpen(day: DaySchedule, hour: number) {
  if (!day.aberto) return false
  const open = minutesOf(day.abre)
  const close = minutesOf(day.fecha)
  const start = hour * 60
  if (open === 0 && close === 0) return true
  if (close > open) return start >= open && start < close
  return start >= open || start < close
}

export function formatRange(day: DaySchedule) {
  if (!day.aberto) return 'fechado'
  if (day.abre === '00:00' && day.fecha === '00:00') return '24 horas'
  return `${day.abre}–${day.fecha}`
}

function stripAccents(value: string) {
  return value.normalize('NFD').replace(/\p{M}/gu, '')
}

function padTime(hourText: string, minuteText?: string) {
  const hour = Number(hourText)
  const minute = Number(minuteText ?? '0')
  if (hour > 23 || minute > 59) return null
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

function daysInClause(clause: string): DayId[] {
  if (/\b(todos os dias|todo dia|todos)\b/.test(clause)) return [...DAY_IDS]
  const found = new Set<DayId>()
  const range = new RegExp(`\\b(${DAY_TOKEN})\\s+a\\s+(${DAY_TOKEN})\\b`).exec(clause)
  if (range) {
    const start = DAY_WORD[range[1]]
    const end = DAY_WORD[range[2]]
    if (start <= end) {
      for (let index = start; index <= end; index += 1) found.add(DAY_IDS[index])
    }
  }
  const word = new RegExp(`\\b(${DAY_TOKEN})\\b`, 'g')
  for (const match of clause.matchAll(word)) {
    found.add(DAY_IDS[DAY_WORD[match[1]]])
  }
  return [...found]
}

export function applyScheduleText(
  source: string,
  dias: Record<DayId, DaySchedule>,
): { dias: Record<DayId, DaySchedule>; applied: boolean; touched: DayId[] } {
  const normalized = stripAccents(source.toLowerCase())
  if (!normalized.trim()) return { dias, applied: false }
  const next: Record<DayId, DaySchedule> = {
    seg: { ...dias.seg },
    ter: { ...dias.ter },
    qua: { ...dias.qua },
    qui: { ...dias.qui },
    sex: { ...dias.sex },
    sab: { ...dias.sab },
    dom: { ...dias.dom },
  }
  let applied = false
  const touched = new Set<DayId>()
  for (const clause of normalized.split(/\s+e\s+/)) {
    const targets = daysInClause(clause)
    const closed = /fechad|nao abre/.test(clause)
    if (closed && targets.length > 0) {
      for (const day of targets) {
        next[day] = { ...next[day], aberto: false }
        touched.add(day)
      }
      applied = true
      continue
    }
    const match =
      /(\d{1,2})(?::(\d{2}))?\s*h?\s*(?:as|a)\s*(\d{1,2})(?::(\d{2}))?\s*h?/.exec(clause)
    if (!match) continue
    const abre = padTime(match[1], match[2])
    const fecha = padTime(match[3], match[4])
    if (!abre || !fecha) continue
    const days = targets.length > 0 ? targets : DAY_IDS
    for (const day of days) {
      next[day] = { aberto: true, abre, fecha }
      touched.add(day)
    }
    applied = true
  }
  return { dias: next, applied, touched: DAY_IDS.filter((id) => touched.has(id)) }
}

export function withSetor(draft: AnaliseDraft, setorId: string, selected: boolean): AnaliseDraft {
  const setores = selected
    ? [...draft.funcionamento.setores, setorId]
    : draft.funcionamento.setores.filter((id) => id !== setorId)
  const setor = SETORES.find((item) => item.id === setorId)
  let cargos = draft.equipe.cargos
  if (selected && setor && !cargos.some((item) => cargoKey(item.cargo) === cargoKey(setor.cargo))) {
    cargos = [...cargos, blankCargo(setor.cargo)]
  }
  return {
    ...draft,
    funcionamento: { ...draft.funcionamento, setores },
    equipe: { ...draft.equipe, cargos },
  }
}

export function cargoNames(draft: AnaliseDraft) {
  const source = draft.equipe.modo === 'pessoa' ? draft.equipe.pessoas : draft.equipe.cargos
  const names: string[] = []
  for (const item of source) {
    const name = item.cargo.trim()
    if (!name) continue
    if (names.some((current) => cargoKey(current) === cargoKey(name))) continue
    names.push(name)
  }
  return names
}

export function seedPessoas(cargos: CargoDraft[]): PessoaDraft[] {
  const people: PessoaDraft[] = []
  for (const cargo of cargos) {
    const count = Math.min(30, Math.max(0, Number(cargo.pessoas) || 0))
    if (!cargo.cargo.trim() || count === 0) continue
    for (let index = 0; index < count; index += 1) {
      people.push({
        id: createId(),
        nome: count > 1 ? `${cargo.cargo} ${index + 1}` : cargo.cargo,
        cargo: cargo.cargo,
        horasSemana: cargo.horasSemana,
        salarioBase: cargo.salarioBase,
        premioMedio: cargo.premioMedio,
        abreFecha: cargo.abreFecha,
      })
    }
    if (people.length >= 40) break
  }
  return people.slice(0, 40)
}

export function requirementLines(draft: AnaliseDraft) {
  const lines = DAY_IDS.flatMap((dayId) => {
    const day = draft.funcionamento.dias[dayId]
    if (!day.aberto) return []
    const label = DAYS.find((item) => item.id === dayId)?.label ?? dayId
    const low = draft.cobertura.fraco
    const high = draft.cobertura.pico
    const range = low && high ? `, ${low} a ${high} pessoas simultâneas` : ''
    return [`${label}: ${formatRange(day)}${range}.`]
  })
  for (const name of cargoNames(draft)) {
    const rule = draft.cobertura.porCargo[cargoKey(name)]
    if (!rule?.obrigatorio) continue
    const minimo = rule.minimo || '1'
    lines.push(`${minimo} ${name} durante todo o atendimento.`)
  }
  if (lines.length === 0) lines.push('Nenhum dia aberto informado.')
  return lines
}

export function moveItem<T>(items: T[], index: number, direction: -1 | 1) {
  const target = index + direction
  if (target < 0 || target >= items.length) return items
  const next = [...items]
  const [item] = next.splice(index, 1)
  next.splice(target, 0, item)
  return next
}
