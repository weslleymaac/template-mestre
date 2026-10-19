import type { Metadata } from 'next'
import { AnaliseWizard } from '@/components/analise/analise-wizard'

export const metadata: Metadata = {
  title: { absolute: 'Calculadora de Escala 5x2' },
  description: 'Preencha os dados da loja para a análise da escala 5x2.',
}

export default function AnaliseDeEscalaPage() {
  return <AnaliseWizard />
}
