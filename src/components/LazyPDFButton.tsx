import { PDFDownloadLink } from '@react-pdf/renderer'
import { Button } from '@/components/ui/button'
import { FileText } from 'lucide-react'
import { EstimatePDF } from '@/components/EstimatePDF'
import type { Estimate, EstimateTotals } from '@/types/estimate'
import type { PDFCompanyInfo } from '@/components/EstimatePDF'

type Props = {
  estimate: Estimate
  totals: EstimateTotals
  company: PDFCompanyInfo
}

export default function LazyPDFButton({ estimate, totals, company }: Props) {
  return (
    <PDFDownloadLink
      document={<EstimatePDF estimate={estimate} totals={totals} company={company} />}
      fileName={`${estimate.estimateNumber}.pdf`}
    >
      {({ loading }) => (
        <Button variant="outline" className="border-zinc-600 text-zinc-300 hover:bg-zinc-800 gap-1.5">
          <FileText size={14} />
          {loading ? 'Building...' : 'Download PDF'}
        </Button>
      )}
    </PDFDownloadLink>
  )
}
