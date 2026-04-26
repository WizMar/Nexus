import { Suspense, lazy } from 'react'
import { Button } from '@/components/ui/button'
import { FileText } from 'lucide-react'
import type { Estimate, EstimateTotals } from '@/types/estimate'
import type { PDFCompanyInfo } from '@/components/EstimatePDF'

const LazyButton = lazy(() => import('./LazyPDFButton'))

type Props = {
  estimate: Estimate
  totals: EstimateTotals
  company: PDFCompanyInfo
}

export function PDFDownloadButton({ estimate, totals, company }: Props) {
  return (
    <Suspense
      fallback={
        <Button variant="outline" disabled className="border-zinc-600 text-zinc-500 gap-1.5">
          <FileText size={14} /> PDF
        </Button>
      }
    >
      <LazyButton estimate={estimate} totals={totals} company={company} />
    </Suspense>
  )
}
