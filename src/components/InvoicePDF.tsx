import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'
import type { Invoice, Payment } from '@/types/financial'
import type { PDFCompanyInfo } from './EstimatePDF'

// ── Palette (matches EstimatePDF / app theme) ─────────────────────────────────
const STONE       = '#78716C'
const STONE_DARK  = '#44403C'
const DARK        = '#1C1917'
const STONE_LIGHT = '#F5F5F4'
const BORDER      = '#E7E5E4'
const MUTED       = '#A8A29E'
const WHITE       = '#FFFFFF'
const EMERALD     = '#059669'
const RED         = '#DC2626'

const s = StyleSheet.create({
  page: {
    paddingTop: 0, paddingBottom: 60, paddingHorizontal: 0,
    fontFamily: 'Helvetica', fontSize: 9, color: DARK, backgroundColor: WHITE,
  },

  // ── Header band ─────────────────────────────────────────────────────────────
  headerBand: {
    backgroundColor: DARK,
    paddingTop: 32, paddingBottom: 28, paddingHorizontal: 44,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
  },
  logo: { width: 100, height: 40, objectFit: 'contain' },
  companyName: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: WHITE, marginBottom: 4 },
  companyLine: { fontSize: 8, color: MUTED, marginBottom: 2 },
  invoiceLabel: { fontSize: 28, fontFamily: 'Helvetica-Bold', color: WHITE, textAlign: 'right', letterSpacing: 2 },
  invoiceNum: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: STONE, textAlign: 'right', marginTop: 4 },

  // ── Accent stripe ────────────────────────────────────────────────────────────
  accentStripe: { height: 4, backgroundColor: STONE },

  // ── Meta ribbon ─────────────────────────────────────────────────────────────
  metaRibbon: {
    backgroundColor: STONE_LIGHT,
    paddingVertical: 10, paddingHorizontal: 44,
    flexDirection: 'row', gap: 24,
    borderBottomWidth: 1, borderBottomColor: BORDER,
  },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaLabel: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: MUTED, textTransform: 'uppercase', letterSpacing: 0.6 },
  metaValue: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: STONE_DARK },
  statusPill: { backgroundColor: STONE, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 10 },
  statusPillText: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: WHITE, textTransform: 'uppercase', letterSpacing: 0.6 },

  // ── Body ─────────────────────────────────────────────────────────────────────
  body: { paddingHorizontal: 44, paddingTop: 24 },

  // ── Info columns ─────────────────────────────────────────────────────────────
  cols3: { flexDirection: 'row', marginBottom: 24, gap: 12 },
  infoCard: { flex: 1, borderLeftWidth: 2, borderLeftColor: STONE, paddingLeft: 10 },
  infoLabel: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: STONE, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 5 },
  infoPrimary: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: DARK, marginBottom: 2 },
  infoLine: { fontSize: 8.5, color: STONE_DARK, marginBottom: 1.5 },
  infoMuted: { fontSize: 8, color: MUTED, marginBottom: 1.5 },

  // ── Summary box ──────────────────────────────────────────────────────────────
  summaryWrap: { marginBottom: 24 },
  sectionHeading: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: STONE, textTransform: 'uppercase', letterSpacing: 0.9, marginBottom: 8 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: BORDER },
  summaryLabel: { fontSize: 9, color: MUTED },
  summaryValue: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: DARK },
  balanceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: DARK, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 4, marginTop: 4 },
  balanceLabel: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: WHITE, letterSpacing: 1 },
  balancePaid: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: EMERALD },
  balanceDue: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: RED },

  // ── Table ────────────────────────────────────────────────────────────────────
  tableWrap: { marginBottom: 20 },
  tHead: { flexDirection: 'row', backgroundColor: DARK, paddingVertical: 7, paddingHorizontal: 12, borderRadius: 3 },
  tHeadText: { fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: WHITE, letterSpacing: 0.3 },
  tRow: { flexDirection: 'row', paddingVertical: 7, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: BORDER },
  tRowAlt: { backgroundColor: STONE_LIGHT },
  tCell: { fontSize: 9, color: DARK },
  tCellMuted: { fontSize: 8.5, color: MUTED },

  // ── Notes ─────────────────────────────────────────────────────────────────────
  notesBox: { borderWidth: 1, borderColor: BORDER, borderRadius: 4, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 24 },
  notesText: { fontSize: 8.5, color: STONE_DARK, lineHeight: 1.55 },

  // ── Footer ────────────────────────────────────────────────────────────────────
  footer: { position: 'absolute', bottom: 20, left: 44, right: 44, flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: BORDER, paddingTop: 7 },
  footerText: { fontSize: 7, color: MUTED },
})

function usd(n: number) {
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function fmtDate(iso: string) {
  if (!iso) return '—'
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

const STATUS_LABEL: Record<string, string> = {
  draft: 'Draft', sent: 'Sent', paid: 'Paid', partial: 'Partial', overdue: 'Overdue',
}

const METHOD_LABEL: Record<string, string> = {
  check: 'Check', cash: 'Cash', card: 'Card', zelle: 'Zelle', ach: 'ACH / Wire', other: 'Other',
}

export type InvoiceClientInfo = { name: string; phone: string; email: string }
export type InvoiceJobInfo = { title: string; address: string }

type Props = {
  invoice: Invoice
  payments: Payment[]
  client: InvoiceClientInfo
  job: InvoiceJobInfo
  company: PDFCompanyInfo
}

export function InvoicePDF({ invoice, payments, client, job, company }: Props) {
  const totalPaid = payments.reduce((s, p) => s + p.amount, 0)
  const balance = invoice.amount - totalPaid
  const isPaid = balance <= 0

  return (
    <Document>
      <Page size="LETTER" style={s.page}>

        {/* ── Header band ────────────────────────────────────────────────── */}
        <View style={s.headerBand}>
          <View>
            {company.logoUrl
              ? <Image src={company.logoUrl} style={s.logo} />
              : <Text style={s.companyName}>{company.name || 'Your Company'}</Text>
            }
            {company.logoUrl && company.name
              ? <Text style={[s.companyName, { marginTop: 4 }]}>{company.name}</Text>
              : null
            }
            {company.address ? <Text style={s.companyLine}>{company.address}</Text> : null}
            {company.phone   ? <Text style={s.companyLine}>{company.phone}</Text>   : null}
            {company.email   ? <Text style={s.companyLine}>{company.email}</Text>   : null}
            {company.license ? <Text style={s.companyLine}>Lic #{company.license}</Text> : null}
          </View>
          <View>
            <Text style={s.invoiceLabel}>INVOICE</Text>
            <Text style={s.invoiceNum}>{invoice.invoiceNumber}</Text>
          </View>
        </View>

        {/* ── Accent stripe ────────────────────────────────────────────────── */}
        <View style={s.accentStripe} />

        {/* ── Meta ribbon ──────────────────────────────────────────────────── */}
        <View style={s.metaRibbon}>
          {invoice.issuedDate ? (
            <View style={s.metaItem}>
              <Text style={s.metaLabel}>Issued</Text>
              <Text style={s.metaValue}>{fmtDate(invoice.issuedDate)}</Text>
            </View>
          ) : null}
          {invoice.dueDate ? (
            <View style={s.metaItem}>
              <Text style={s.metaLabel}>Due</Text>
              <Text style={s.metaValue}>{fmtDate(invoice.dueDate)}</Text>
            </View>
          ) : null}
          <View style={s.metaItem}>
            <Text style={s.metaLabel}>Status</Text>
            <View style={s.statusPill}>
              <Text style={s.statusPillText}>{STATUS_LABEL[invoice.status] ?? invoice.status}</Text>
            </View>
          </View>
        </View>

        <View style={s.body}>

          {/* ── Bill To / Job / Company ───────────────────────────────────── */}
          <View style={s.cols3}>
            <View style={s.infoCard}>
              <Text style={s.infoLabel}>Bill To</Text>
              <Text style={s.infoPrimary}>{client.name || '—'}</Text>
              {client.phone ? <Text style={s.infoMuted}>{client.phone}</Text> : null}
              {client.email ? <Text style={s.infoMuted}>{client.email}</Text> : null}
            </View>
            <View style={s.infoCard}>
              <Text style={s.infoLabel}>Job / Property</Text>
              <Text style={s.infoPrimary}>{job.title || '—'}</Text>
              {job.address
                ? job.address.split(',').map((part, i) => (
                    <Text key={i} style={i === 0 ? s.infoLine : s.infoMuted}>{part.trim()}</Text>
                  ))
                : null
              }
            </View>
            <View style={s.infoCard}>
              <Text style={s.infoLabel}>From</Text>
              <Text style={s.infoPrimary}>{company.name || '—'}</Text>
              {company.phone   ? <Text style={s.infoMuted}>{company.phone}</Text>   : null}
              {company.email   ? <Text style={s.infoMuted}>{company.email}</Text>   : null}
              {company.website ? <Text style={s.infoMuted}>{company.website}</Text> : null}
            </View>
          </View>

          {/* ── Invoice Summary ───────────────────────────────────────────── */}
          <View style={s.summaryWrap}>
            <Text style={s.sectionHeading}>Summary</Text>
            <View style={s.summaryRow}>
              <Text style={s.summaryLabel}>Invoice Amount</Text>
              <Text style={s.summaryValue}>{usd(invoice.amount)}</Text>
            </View>
            {totalPaid > 0 && (
              <View style={s.summaryRow}>
                <Text style={s.summaryLabel}>Total Paid</Text>
                <Text style={[s.summaryValue, { color: EMERALD }]}>− {usd(totalPaid)}</Text>
              </View>
            )}
            <View style={s.balanceRow}>
              <Text style={s.balanceLabel}>{isPaid ? 'PAID IN FULL' : 'BALANCE DUE'}</Text>
              <Text style={isPaid ? s.balancePaid : s.balanceDue}>
                {isPaid ? usd(0) : usd(balance)}
              </Text>
            </View>
          </View>

          {/* ── Payments Received ─────────────────────────────────────────── */}
          {payments.length > 0 && (
            <View style={s.tableWrap}>
              <Text style={s.sectionHeading}>Payments Received</Text>
              <View style={s.tHead}>
                <Text style={[s.tHeadText, { flex: 1 }]}>Date</Text>
                <Text style={[s.tHeadText, { width: 80 }]}>Method</Text>
                <Text style={[s.tHeadText, { width: 100 }]}>Reference</Text>
                <Text style={[s.tHeadText, { width: 80, textAlign: 'right' }]}>Amount</Text>
              </View>
              {payments.map((p, i) => (
                <View key={p.id} style={[s.tRow, i % 2 === 1 ? s.tRowAlt : {}]}>
                  <Text style={[s.tCell, { flex: 1 }]}>{fmtDate(p.paymentDate)}</Text>
                  <Text style={[s.tCellMuted, { width: 80 }]}>{METHOD_LABEL[p.method] ?? p.method}</Text>
                  <Text style={[s.tCellMuted, { width: 100 }]}>{p.reference || '—'}</Text>
                  <Text style={[s.tCell, { width: 80, textAlign: 'right' }]}>{usd(p.amount)}</Text>
                </View>
              ))}
            </View>
          )}

          {/* ── Notes ─────────────────────────────────────────────────────── */}
          {invoice.notes ? (
            <View style={{ marginBottom: 24 }}>
              <Text style={s.sectionHeading}>Notes</Text>
              <View style={s.notesBox}>
                <Text style={s.notesText}>{invoice.notes}</Text>
              </View>
            </View>
          ) : null}

        </View>

        {/* ── Footer ────────────────────────────────────────────────────────── */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>{company.name || 'Nexus'} · {invoice.invoiceNumber}</Text>
          <Text style={s.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>

      </Page>
    </Document>
  )
}
