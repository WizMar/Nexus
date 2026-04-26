import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'
import type { Estimate, EstimateTotals } from '@/types/estimate'

export type PDFCompanyInfo = {
  name: string
  phone: string
  email: string
  address: string
  website: string
  logoUrl: string
  license: string
}

const AMBER = '#D97706'
const DARK = '#18181B'
const MUTED = '#71717A'
const LIGHT_MUTED = '#A1A1AA'
const BORDER = '#E4E4E7'
const ROW_ALT = '#F9F9F9'
const WHITE = '#FFFFFF'

const s = StyleSheet.create({
  page: {
    paddingTop: 40, paddingBottom: 56, paddingHorizontal: 44,
    fontFamily: 'Helvetica', fontSize: 9, color: DARK, backgroundColor: WHITE,
  },

  // ── Header ──────────────────────────────────────────────────────────────
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  logo: { width: 90, height: 36, objectFit: 'contain', marginBottom: 4 },
  companyName: { fontSize: 16, fontFamily: 'Helvetica-Bold', color: DARK, marginBottom: 3 },
  companyLine: { fontSize: 8, color: MUTED, marginBottom: 1.5 },
  estimateBadge: { fontSize: 22, fontFamily: 'Helvetica-Bold', color: AMBER, textAlign: 'right' },
  estimateNum: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: DARK, textAlign: 'right', marginTop: 3 },
  estimateMeta: { fontSize: 8, color: MUTED, textAlign: 'right', marginTop: 2 },

  // ── Dividers ─────────────────────────────────────────────────────────────
  rule: { borderBottomWidth: 1, borderBottomColor: BORDER, marginVertical: 14 },
  ruleAmber: { borderBottomWidth: 2, borderBottomColor: AMBER, marginBottom: 14 },

  // ── Two-column info ──────────────────────────────────────────────────────
  cols2: { flexDirection: 'row', marginBottom: 16 },
  col: { flex: 1 },
  colLabel: {
    fontSize: 7, fontFamily: 'Helvetica-Bold', color: AMBER,
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 5,
  },
  colPrimary: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: DARK, marginBottom: 2 },
  colLine: { fontSize: 8.5, color: DARK, marginBottom: 1.5 },
  colMuted: { fontSize: 8, color: MUTED, marginBottom: 1.5 },

  // ── Section heading ───────────────────────────────────────────────────────
  sectionHeading: {
    fontSize: 7, fontFamily: 'Helvetica-Bold', color: AMBER,
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 7,
  },

  // ── Scope ────────────────────────────────────────────────────────────────
  scopeText: { fontSize: 9, color: DARK, lineHeight: 1.55, marginBottom: 16 },

  // ── Breakdown table ───────────────────────────────────────────────────────
  tableWrap: { marginBottom: 4 },
  tHead: { flexDirection: 'row', backgroundColor: DARK, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 3 },
  tHeadText: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: WHITE },
  tRow: { flexDirection: 'row', paddingVertical: 6, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: BORDER },
  tRowAlt: { backgroundColor: ROW_ALT },
  tCell: { fontSize: 9, color: DARK },
  tCellMuted: { fontSize: 9, color: MUTED },

  // ── Totals ────────────────────────────────────────────────────────────────
  totalsBlock: { alignItems: 'flex-end', marginTop: 12, marginBottom: 16 },
  totalLine: { flexDirection: 'row', justifyContent: 'space-between', width: 210, marginBottom: 3 },
  totalLineLabel: { fontSize: 9, color: MUTED },
  totalLineValue: { fontSize: 9, color: DARK },
  grandBox: {
    flexDirection: 'row', justifyContent: 'space-between', width: 210,
    backgroundColor: AMBER, paddingVertical: 7, paddingHorizontal: 10,
    borderRadius: 3, marginTop: 5,
  },
  grandLabel: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: WHITE },
  grandValue: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: WHITE },

  // ── Footer ────────────────────────────────────────────────────────────────
  footer: {
    position: 'absolute', bottom: 22, left: 44, right: 44,
    flexDirection: 'row', justifyContent: 'space-between',
    borderTopWidth: 1, borderTopColor: BORDER, paddingTop: 7,
  },
  footerText: { fontSize: 7, color: LIGHT_MUTED },
})

function usd(n: number) {
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

type Props = {
  estimate: Estimate
  totals: EstimateTotals
  company: PDFCompanyInfo
}

export function EstimatePDF({ estimate, totals, company }: Props) {
  const date = fmtDate(estimate.createdAt)
  const hasLineItems = estimate.lineItems.length > 0
  // Separate trade-calc rows from line-item rows in the breakdown
  // Line items were pushed last in finish(), so we can identify them by matching descriptions
  const liDescriptions = new Set(estimate.lineItems.map(li => li.description || 'Line Item'))
  const tradeRows = totals.breakdown.filter(b => !liDescriptions.has(b.label))
  const lineRows = totals.breakdown.filter(b => liDescriptions.has(b.label))

  return (
    <Document>
      <Page size="LETTER" style={s.page}>

        {/* ── Header ────────────────────────────────────────────────────── */}
        <View style={s.header}>
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
            {company.license ? <Text style={s.companyLine}>Lic: {company.license}</Text> : null}
          </View>
          <View>
            <Text style={s.estimateBadge}>ESTIMATE</Text>
            <Text style={s.estimateNum}>{estimate.estimateNumber}</Text>
            <Text style={s.estimateMeta}>{date}</Text>
            <Text style={[s.estimateMeta, { marginTop: 4 }]}>{estimate.jobType}</Text>
            <Text style={[s.estimateMeta, { color: AMBER, marginTop: 2 }]}>{estimate.status}</Text>
          </View>
        </View>

        <View style={s.ruleAmber} />

        {/* ── Client + Prepared By ───────────────────────────────────────── */}
        <View style={s.cols2}>
          <View style={s.col}>
            <Text style={s.colLabel}>Bill To</Text>
            <Text style={s.colPrimary}>{estimate.client.name}</Text>
            {estimate.client.phone ? <Text style={s.colMuted}>{estimate.client.phone}</Text> : null}
            {estimate.client.email ? <Text style={s.colMuted}>{estimate.client.email}</Text> : null}
            {estimate.address      ? <Text style={s.colMuted}>{estimate.address}</Text>      : null}
          </View>
          <View style={s.col}>
            <Text style={s.colLabel}>Prepared By</Text>
            <Text style={s.colPrimary}>{company.name || '—'}</Text>
            {company.phone   ? <Text style={s.colMuted}>{company.phone}</Text>   : null}
            {company.email   ? <Text style={s.colMuted}>{company.email}</Text>   : null}
            {company.website ? <Text style={s.colMuted}>{company.website}</Text> : null}
          </View>
        </View>

        {/* ── Scope of Work ─────────────────────────────────────────────── */}
        {estimate.scope ? (
          <View style={{ marginBottom: 16 }}>
            <Text style={s.sectionHeading}>Scope of Work</Text>
            <Text style={s.scopeText}>{estimate.scope}</Text>
          </View>
        ) : null}

        {/* ── Trade Cost Summary ─────────────────────────────────────────── */}
        {tradeRows.length > 0 && (
          <View style={[s.tableWrap, { marginBottom: 12 }]}>
            <Text style={s.sectionHeading}>Cost Summary</Text>
            <View style={s.tHead}>
              <Text style={[s.tHeadText, { flex: 1 }]}>Description</Text>
              <Text style={[s.tHeadText, { width: 90, textAlign: 'right' }]}>Amount</Text>
            </View>
            {tradeRows.map((row, i) => (
              <View key={i} style={[s.tRow, i % 2 === 1 ? s.tRowAlt : {}]}>
                <Text style={[s.tCell, { flex: 1 }]}>{row.label}</Text>
                <Text style={[s.tCell, { width: 90, textAlign: 'right' }]}>{usd(row.amount)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* ── Line Items ────────────────────────────────────────────────── */}
        {hasLineItems && (
          <View style={[s.tableWrap, { marginBottom: 12 }]}>
            <Text style={s.sectionHeading}>Materials & Items</Text>
            <View style={s.tHead}>
              <Text style={[s.tHeadText, { flex: 1 }]}>Item</Text>
              <Text style={[s.tHeadText, { width: 36, textAlign: 'right' }]}>Qty</Text>
              <Text style={[s.tHeadText, { width: 36, textAlign: 'right' }]}>Unit</Text>
              <Text style={[s.tHeadText, { width: 72, textAlign: 'right' }]}>Unit Price</Text>
              <Text style={[s.tHeadText, { width: 72, textAlign: 'right' }]}>Total</Text>
            </View>
            {estimate.lineItems.map((li, i) => (
              <View key={i} style={[s.tRow, i % 2 === 1 ? s.tRowAlt : {}]}>
                <Text style={[s.tCell, { flex: 1 }]}>{li.description}</Text>
                <Text style={[s.tCellMuted, { width: 36, textAlign: 'right' }]}>{li.qty}</Text>
                <Text style={[s.tCellMuted, { width: 36, textAlign: 'right' }]}>{li.unit}</Text>
                <Text style={[s.tCellMuted, { width: 72, textAlign: 'right' }]}>{usd(li.unitPrice)}</Text>
                <Text style={[s.tCell, { width: 72, textAlign: 'right' }]}>{usd(li.qty * li.unitPrice)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* ── Totals ────────────────────────────────────────────────────── */}
        <View style={s.totalsBlock}>
          {(tradeRows.length > 0 || lineRows.length > 0) && (
            <View style={s.totalLine}>
              <Text style={s.totalLineLabel}>Subtotal</Text>
              <Text style={s.totalLineValue}>{usd(totals.subtotal)}</Text>
            </View>
          )}
          {totals.markup > 0 && (
            <View style={s.totalLine}>
              <Text style={s.totalLineLabel}>Markup ({totals.markupPct}%)</Text>
              <Text style={s.totalLineValue}>{usd(totals.markup)}</Text>
            </View>
          )}
          <View style={s.grandBox}>
            <Text style={s.grandLabel}>TOTAL</Text>
            <Text style={s.grandValue}>{usd(totals.total)}</Text>
          </View>
        </View>

        <View style={s.rule} />

        {/* ── Notes (scope only — internal notes not shown) ─────────────── */}
        {estimate.notes ? (
          <View>
            <Text style={s.sectionHeading}>Notes</Text>
            <Text style={[s.scopeText, { color: MUTED }]}>{estimate.notes}</Text>
          </View>
        ) : null}

        {/* ── Footer ────────────────────────────────────────────────────── */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>{company.name || 'Nexus'} · {estimate.estimateNumber}</Text>
          <Text style={s.footerText}>Generated {date}</Text>
        </View>

      </Page>
    </Document>
  )
}
