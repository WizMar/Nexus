const SUPABASE_URL     = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const RESEND_API_KEY   = Deno.env.get('RESEND_API_KEY')
const RESEND_FROM      = Deno.env.get('RESEND_FROM_EMAIL') ?? 'invoices@resend.dev'
const APP_URL          = Deno.env.get('APP_URL') ?? 'https://nexus-app.vercel.app'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function dbGet(path: string) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  })
  return res.ok ? res.json() : null
}

async function dbPatch(table: string, id: string, body: Record<string, unknown>) {
  await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
    method: 'PATCH',
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(body),
  })
}

function usd(n: number) {
  return `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function fmtDate(iso: string) {
  if (!iso) return '—'
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  try {
    const { invoiceId, toEmail } = await req.json()
    if (!invoiceId) {
      return new Response(JSON.stringify({ error: 'Missing invoiceId' }), { status: 400, headers: { 'Content-Type': 'application/json', ...CORS } })
    }
    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: 'RESEND_API_KEY not configured' }), { status: 500, headers: { 'Content-Type': 'application/json', ...CORS } })
    }

    const invoices = await dbGet(`invoices?id=eq.${invoiceId}&select=*&limit=1`)
    if (!invoices || invoices.length === 0) {
      return new Response(JSON.stringify({ error: 'Invoice not found' }), { status: 404, headers: { 'Content-Type': 'application/json', ...CORS } })
    }
    const invoice = invoices[0]

    const [payments, jobs, settings] = await Promise.all([
      dbGet(`payments?job_id=eq.${invoice.job_id}&select=*&order=payment_date.desc`),
      dbGet(`jobs?id=eq.${invoice.job_id}&select=title,address,client_name,client_phone,client_email&limit=1`),
      dbGet(`settings?org_id=eq.${invoice.org_id}&select=company&limit=1`),
    ])

    const job      = jobs?.[0] ?? {}
    const company  = settings?.[0]?.company ?? {}
    const clientEmail = toEmail || job.client_email
    if (!clientEmail) {
      return new Response(JSON.stringify({ error: 'No client email found' }), { status: 400, headers: { 'Content-Type': 'application/json', ...CORS } })
    }

    const clientName = job.client_name || 'Valued Customer'
    const totalPaid  = (payments ?? []).reduce((s: number, p: { amount: number }) => s + Number(p.amount), 0)
    const balance    = Number(invoice.amount) - totalPaid
    const isPaid     = balance <= 0
    const invoiceUrl = `${APP_URL}/invoice/${invoiceId}`

    const paymentsRows = (payments ?? []).map((p: { payment_date: string; method: string; amount: number }, i: number) =>
      `<tr style="background:${i % 2 === 1 ? '#fafaf9' : '#fff'};"><td style="padding:6px 10px;font-size:12px;">${fmtDate(p.payment_date)}</td><td style="padding:6px 10px;font-size:12px;color:#78716c;">${p.method}</td><td style="text-align:right;padding:6px 10px;font-size:12px;">${usd(p.amount)}</td></tr>`
    ).join('')

    const paymentsSection = (payments ?? []).length > 0
      ? `<p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#78716c;text-transform:uppercase;letter-spacing:.8px;">Payments Received</p>
         <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
           <thead><tr style="background:#f5f5f4;"><th style="text-align:left;padding:6px 10px;font-size:11px;color:#78716c;">Date</th><th style="text-align:left;padding:6px 10px;font-size:11px;color:#78716c;">Method</th><th style="text-align:right;padding:6px 10px;font-size:11px;color:#78716c;">Amount</th></tr></thead>
           <tbody>${paymentsRows}</tbody>
         </table>`
      : ''

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Helvetica,Arial,sans-serif;">
<div style="max-width:580px;margin:32px auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 1px 6px rgba(0,0,0,.08);">
  <div style="background:#1c1917;padding:28px 36px;display:flex;justify-content:space-between;align-items:flex-start;">
    <div>
      <div style="font-size:20px;font-weight:700;color:#fff;">${company.name ?? 'Invoice'}</div>
      ${company.phone  ? `<div style="font-size:12px;color:#a8a29e;margin-top:4px;">${company.phone}</div>` : ''}
      ${company.email  ? `<div style="font-size:12px;color:#a8a29e;">${company.email}</div>` : ''}
      ${company.license ? `<div style="font-size:12px;color:#a8a29e;">Lic #${company.license}</div>` : ''}
    </div>
    <div style="text-align:right;">
      <div style="font-size:22px;font-weight:700;color:#fff;letter-spacing:2px;">INVOICE</div>
      <div style="font-size:13px;font-weight:600;color:#78716c;margin-top:4px;">${invoice.invoice_number}</div>
    </div>
  </div>
  <div style="height:4px;background:#78716c;"></div>
  <div style="background:#f5f5f4;padding:12px 36px;border-bottom:1px solid #e7e5e4;">
    ${invoice.issued_date ? `<span style="margin-right:24px;"><span style="font-size:10px;font-weight:700;color:#a8a29e;text-transform:uppercase;">Issued</span> <span style="font-size:12px;font-weight:600;color:#44403c;">${fmtDate(invoice.issued_date)}</span></span>` : ''}
    ${invoice.due_date   ? `<span><span style="font-size:10px;font-weight:700;color:#a8a29e;text-transform:uppercase;">Due</span> <span style="font-size:12px;font-weight:600;color:#44403c;">${fmtDate(invoice.due_date)}</span></span>` : ''}
  </div>
  <div style="padding:28px 36px;">
    <p style="margin:0 0 20px;font-size:14px;color:#44403c;">Hi ${clientName},</p>
    <p style="margin:0 0 24px;font-size:14px;color:#78716c;">Please find your invoice below. Click the button at the bottom to view or download a PDF copy.</p>
    <div style="border:1px solid #e7e5e4;border-radius:6px;overflow:hidden;margin-bottom:24px;">
      <div style="padding:10px 16px;border-bottom:1px solid #e7e5e4;display:flex;justify-content:space-between;">
        <span style="font-size:13px;color:#a8a29e;">Invoice Amount</span>
        <span style="font-size:13px;font-weight:600;color:#1c1917;">${usd(invoice.amount)}</span>
      </div>
      ${totalPaid > 0 ? `<div style="padding:10px 16px;border-bottom:1px solid #e7e5e4;display:flex;justify-content:space-between;"><span style="font-size:13px;color:#a8a29e;">Total Paid</span><span style="font-size:13px;font-weight:600;color:#059669;">− ${usd(totalPaid)}</span></div>` : ''}
      <div style="padding:12px 16px;background:#1c1917;display:flex;justify-content:space-between;align-items:center;">
        <span style="font-size:14px;font-weight:700;color:#fff;letter-spacing:1px;">${isPaid ? 'PAID IN FULL' : 'BALANCE DUE'}</span>
        <span style="font-size:18px;font-weight:700;color:${isPaid ? '#059669' : '#dc2626'};">${isPaid ? usd(0) : usd(balance)}</span>
      </div>
    </div>
    ${paymentsSection}
    ${invoice.notes ? `<p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#78716c;text-transform:uppercase;letter-spacing:.8px;">Notes</p><div style="border:1px solid #e7e5e4;border-radius:4px;padding:12px 14px;font-size:13px;color:#44403c;line-height:1.6;margin-bottom:24px;">${invoice.notes}</div>` : ''}
    <div style="text-align:center;margin-top:8px;">
      <a href="${invoiceUrl}" style="display:inline-block;background:#78716c;color:#fff;text-decoration:none;padding:13px 32px;border-radius:7px;font-size:15px;font-weight:600;">View Invoice</a>
    </div>
  </div>
  <div style="padding:16px 36px;border-top:1px solid #e7e5e4;text-align:center;">
    <p style="margin:0;font-size:11px;color:#a8a29e;">${company.name ?? ''} · Sent via Nexus</p>
  </div>
</div>
</body></html>`

    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${RESEND_API_KEY}` },
      body: JSON.stringify({
        from: `${company.name ?? 'Invoice'} <${RESEND_FROM}>`,
        to: clientEmail,
        subject: `Invoice ${invoice.invoice_number}${invoice.due_date ? ` · Due ${fmtDate(invoice.due_date)}` : ''} — ${company.name ?? ''}`,
        html,
      }),
    })

    if (!emailRes.ok) {
      const errText = await emailRes.text()
      return new Response(JSON.stringify({ error: errText }), { status: 500, headers: { 'Content-Type': 'application/json', ...CORS } })
    }

    if (invoice.status === 'draft') {
      await dbPatch('invoices', invoiceId, { status: 'sent', updated_at: new Date().toISOString() })
    }

    return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json', ...CORS } })

  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { 'Content-Type': 'application/json', ...CORS } })
  }
})
