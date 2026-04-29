import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

interface DiagnosticCardProps {
  summary: string
}

export function DiagnosticCard({ summary }: DiagnosticCardProps) {
  if (!summary) return null
  return (
    <Card className="border-l-2 border-l-(--c-success) ring-(--c-outline)">
      <CardHeader className="pb-2">
        <CardTitle className="ks-section text-(--c-success)">Diagnostic</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-relaxed text-(--c-on-surface)">{summary}</p>
      </CardContent>
    </Card>
  )
}
