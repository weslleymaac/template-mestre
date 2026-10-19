import type { Metadata } from 'next'
import { PageHeader } from '@/components/showcase'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Admin',
  description: 'Área reservada às informações do banco de dados.',
  robots: { index: false, follow: false },
}

export default function AdminPage() {
  return (
    <div className="mx-auto w-full min-w-0 max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="Admin"
        description="Informações do banco de dados. Esta área fica separada da análise."
      />

      <Card>
        <CardHeader>
          <CardTitle>Banco de dados</CardTitle>
          <CardDescription>
            Nada é lido nem gravado aqui ainda.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            A listagem e a edição dos registros entram quando o banco for ligado.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
