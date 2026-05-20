const SUPABASE_URL      = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

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
      Prefer: 'return=representation',
    },
  })
  return res.ok ? res.json() : null
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  try {
    const url = new URL(req.url)
    const invoiceId = url.searchParams.get('id')
    if (!invoiceId) {
      return new Response(JSON.stringify({ error: 'Missing invoice id' }), { status: 400, headers: { 'Content-Type': 'application/json', ...CORS } })
    }

    const invoices = await dbGet(`invoices?id=eq.${invoiceId}&select=*&limit=1`)
    if (!invoices || invoices.length === 0) {
      return new Response(JSON.stringify({ error: 'Invoice not found' }), { status: 404, headers: { 'Content-Type': 'application/json', ...CORS } })
    }
    const invoice = invoices[0]

    const [payments, jobs, settings] = await Promise.all([
      dbGet(`payments?job_id=eq.${invoice.job_id}&select=*&order=payment_date.desc`),
      dbGet(`jobs?id=eq.${invoice.job_id}&select=id,title,address,client_name,client_phone,client_email&limit=1`),
      dbGet(`settings?org_id=eq.${invoice.org_id}&select=company&limit=1`),
    ])

    return new Response(JSON.stringify({
      invoice,
      payments: payments ?? [],
      job: jobs?.[0] ?? null,
      company: settings?.[0]?.company ?? {},
    }), { headers: { 'Content-Type': 'application/json', ...CORS } })

  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { 'Content-Type': 'application/json', ...CORS } })
  }
})
