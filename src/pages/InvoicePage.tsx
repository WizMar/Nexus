import { useEffect, useState, lazy, Suspense } from 'react'
import { useParams } from 'react-router-dom'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { FileText, Building2, MapPin, Calendar, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { InvoicePDF } from '@/components/InvoicePDF'
import type { PDFCompanyInfo } from '@/components/EstimatePDF'
import type { Invoice, Payment } from '@/types/financial'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string

type InvoiceData = {
  invoice: Record<string, unknown>
  payments: Record<string, unknown>[]
  job: { title: string; address: string; client_name: string; client_phone: string; client_email: string } | null
  company: Partial<PDFCompanyInfo>
}

function toInvoice(row: Record<string, unknown>): Invoice {
  return {
    id: row.id as string,
    orgId: row.org_id as string,
    jobId: row.job_id as string,
    invoiceNumber: (row.invoice_number as string) ?? '',
    amount: Number(row.amount ?? 0),
    issuedDate: (row.issued_date as string) ?? '',
    dueDate: (row.due_date as string) ?? null,
    status: (row.status as Invoice['status']) ?? 'draft',
    notes: (row.notes as string) ?? '',
    createdAt: (row.created_at as string) ?? '',
    updatedAt: (row.updated_at as string) ?? '',
  }
}

function toPayment(row: Record<string, unknown>): Payment {
  return {
    id: row.id as string,
    orgId: row.org_id as string,
    jobId: row.job_id as string,
    invoiceId: (row.invoice_id as string) ?? null,
    amount: Number(row.amount ?? 0),
    paymentDate: (row.payment_date as string) ?? '',
    method: (row.method as Payment['method']) ?? 'check',
    reference: (row.reference as string) ?? '',
    notes: (row.notes as string) ?? '',
    createdAt: (row.created_at as string) ?? '',
  }
}

function usd(n: number) {
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function fmtDate(iso: string) {
  if (!iso) return '—'
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

const STATUS_LABEL: Record<string, string> = {
  draft: 'Draft', sent: 'Sent', paid: 'Paid in Full', partial: 'Partial Payment', overdue: 'Overdue',
}

const STATUS_STYLE: Record<string, string> = {
  draft:   'bg-zinc-800 text-zinc-300',
  sent:    'bg-blue-900/60 text-blue-300',
  paid:    'bg-emerald-900/60 text-emerald-300',
  partial: 'bg-amber-900/60 text-amber-300',
  overdue: 'bg-red-900/60 text-red-300',
}

const METHOD_LABEL: Record<string, string> = {
  check: 'Check', cash: 'Cash', card: 'Card', zelle: 'Zelle', ach: 'ACH / Wire', other: 'Other',
}

export default function InvoicePage() {
  const { id } = useParams<{ id: string }>()
  const [data, setData] = useState<InvoiceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    fetch(`${SUPABASE_URL}/functions/v1/get-invoice?id=${id}`)
      .then(r => r.json())
      .then((json: InvoiceData & { error?: string }) => {
        if (json.error) { setError(json.error); return }
        setData(json)
      })
      .catch(() => setError('Failed to load invoice'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <div className="text-stone-400 text-sm">Loading invoice…</div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-3 text-red-400" size={40} />
          <p className="text-stone-300 font-medium">Invoice not found</p>
          <p className="text-stone-500 text-sm mt-1">{error}</p>
        </div>
      </div>
    )
  }

  const invoice  = toInvoice(data.invoice)
  const payments = data.payments.map(toPayment)
  const job      = data.job
  const company  = data.company as PDFCompanyInfo

  const totalPaid = payments.reduce((s, p) => s + p.amount, 0)
  const balance   = invoice.amount - totalPaid
  const isPaid    = balance <= 0

  const clientInfo = {
    name:  job?.client_name  ?? '',
    phone: job?.client_phone ?? '',
    email: job?.client_email ?? '',
  }
  const jobInfo = {
    title:   job?.title   ?? '',
    address: job?.address ?? '',
  }

  return (
    <div className="min-h-screen bg-stone-950 py-8 px-4">
      <div className="max-w-2xl mx-auto">

        {/* ── Header band ── */}
        <div className="bg-stone-900 rounded-t-xl overflow-hidden">
          <div className="bg-stone-950 px-8 py-7 flex justify-between items-start border-b border-stone-800">
            <div>
              {company.logoUrl
                ? <img src={company.logoUrl} alt={company.name} className="h-10 object-contain mb-1" />
                : <div className="text-xl font-bold text-white">{company.name || 'Invoice'}</div>
              }
              {company.logoUrl && company.name && <div className="text-base font-bold text-white mt-1">{company.name}</div>}
              {company.address && <div className="text-xs text-stone-400 mt-1">{company.address}</div>}
              {company.phone   && <div className="text-xs text-stone-400">{company.phone}</div>}
              {company.email   && <div className="text-xs text-stone-400">{company.email}</div>}
              {company.license && <div className="text-xs text-stone-400">Lic #{company.license}</div>}
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-white tracking-widest">INVOICE</div>
              <div className="text-sm font-semibold text-stone-400 mt-1">{invoice.invoiceNumber}</div>
            </div>
          </div>

          {/* Stone accent stripe */}
          <div className="h-1 bg-stone-500" />

          {/* Meta strip */}
          <div className="bg-stone-900 px-8 py-3 flex flex-wrap gap-6 border-b border-stone-800 text-xs">
            {invoice.issuedDate && (
              <div>
                <span className="text-stone-500 uppercase tracking-wide font-semibold">Issued</span>
                <div className="text-stone-300 font-semibold mt-0.5">{fmtDate(invoice.issuedDate)}</div>
              </div>
            )}
            {invoice.dueDate && (
              <div>
                <span className="text-stone-500 uppercase tracking-wide font-semibold">Due</span>
                <div className="text-stone-300 font-semibold mt-0.5">{fmtDate(invoice.dueDate)}</div>
              </div>
            )}
            <div>
              <span className="text-stone-500 uppercase tracking-wide font-semibold">Status</span>
              <div className="mt-0.5">
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${STATUS_STYLE[invoice.status] ?? 'bg-zinc-800 text-zinc-300'}`}>
                  {STATUS_LABEL[invoice.status] ?? invoice.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="bg-stone-900 px-8 py-6 space-y-6 rounded-b-xl border border-stone-800 border-t-0">

          {/* Bill To / Job / From */}
          <div className="grid grid-cols-3 gap-4">
            <div className="border-l-2 border-stone-500 pl-3">
              <div className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-2">Bill To</div>
              <div className="font-semibold text-white text-sm">{clientInfo.name || '—'}</div>
              {clientInfo.phone && <div className="text-stone-400 text-xs mt-0.5">{clientInfo.phone}</div>}
              {clientInfo.email && <div className="text-stone-400 text-xs">{clientInfo.email}</div>}
            </div>
            <div className="border-l-2 border-stone-500 pl-3">
              <div className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-2">Job / Property</div>
              <div className="font-semibold text-white text-sm">{jobInfo.title || '—'}</div>
              {jobInfo.address && <div className="text-stone-400 text-xs mt-0.5">{jobInfo.address}</div>}
            </div>
            <div className="border-l-2 border-stone-500 pl-3">
              <div className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-2">From</div>
              <div className="font-semibold text-white text-sm">{company.name || '—'}</div>
              {company.phone   && <div className="text-stone-400 text-xs mt-0.5">{company.phone}</div>}
              {company.email   && <div className="text-stone-400 text-xs">{company.email}</div>}
              {company.website && <div className="text-stone-400 text-xs">{company.website}</div>}
            </div>
          </div>

          {/* Summary */}
          <div>
            <div className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-3">Summary</div>
            <div className="rounded-lg overflow-hidden border border-stone-700">
              <div className="flex justify-between items-center px-4 py-3 border-b border-stone-700">
                <span className="text-sm text-stone-400">Invoice Amount</span>
                <span className="text-sm font-semibold text-stone-200">{usd(invoice.amount)}</span>
              </div>
              {totalPaid > 0 && (
                <div className="flex justify-between items-center px-4 py-3 border-b border-stone-700">
                  <span className="text-sm text-stone-400">Total Paid</span>
                  <span className="text-sm font-semibold text-emerald-400">− {usd(totalPaid)}</span>
                </div>
              )}
              <div className="flex justify-between items-center px-4 py-4 bg-stone-950">
                <span className="text-sm font-bold text-white tracking-wide">{isPaid ? 'PAID IN FULL' : 'BALANCE DUE'}</span>
                <span className={`text-xl font-bold ${isPaid ? 'text-emerald-400' : 'text-red-400'}`}>
                  {isPaid ? usd(0) : usd(balance)}
                </span>
              </div>
            </div>
          </div>

          {/* Payments received */}
          {payments.length > 0 && (
            <div>
              <div className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-3">Payments Received</div>
              <div className="rounded-lg overflow-hidden border border-stone-700">
                {payments.map((p, i) => (
                  <div key={p.id} className={`flex items-center justify-between px-4 py-3 text-sm ${i > 0 ? 'border-t border-stone-700' : ''}`}>
                    <div>
                      <div className="text-stone-200">{fmtDate(p.paymentDate)}</div>
                      <div className="text-xs text-stone-500">{METHOD_LABEL[p.method] ?? p.method}{p.reference ? ` · ${p.reference}` : ''}</div>
                    </div>
                    <div className="font-semibold text-emerald-400">{usd(p.amount)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {invoice.notes && (
            <div>
              <div className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-3">Notes</div>
              <div className="rounded-lg border border-stone-700 px-4 py-3 text-sm text-stone-300 leading-relaxed">
                {invoice.notes}
              </div>
            </div>
          )}

          {/* Download PDF button */}
          <div className="pt-2 flex justify-center">
            <PDFDownloadLink
              document={<InvoicePDF invoice={invoice} payments={payments} client={clientInfo} job={jobInfo} company={company} />}
              fileName={`${invoice.invoiceNumber}.pdf`}
            >
              {({ loading: pdfLoading }) => (
                <Button className="bg-stone-600 hover:bg-stone-500 text-white gap-2 px-6">
                  <FileText size={15} />
                  {pdfLoading ? 'Building PDF…' : 'Download PDF'}
                </Button>
              )}
            </PDFDownloadLink>
          </div>
        </div>

        <div className="text-center text-stone-600 text-xs mt-6">
          Sent via Nexus · {company.name ?? ''}
        </div>

      </div>
    </div>
  )
}
