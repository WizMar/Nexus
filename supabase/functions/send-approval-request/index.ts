import "@supabase/functions-js/edge-runtime.d.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const RESEND_FROM_EMAIL = Deno.env.get('RESEND_FROM_EMAIL') ?? 'onboarding@resend.dev'
const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID')
const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN')
const TWILIO_PHONE_NUMBER = Deno.env.get('TWILIO_PHONE_NUMBER')

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function toE164(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 10) return `+1${digits}`
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`
  return `+${digits}`
}

function approvalEmailHtml(clientName: string, orgName: string, jobTitle: string, approvalLink: string): string {
  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #18181b; color: #e4e4e7; border-radius: 12px;">
      <div style="margin-bottom: 32px;">
        <span style="font-size: 24px; font-weight: 700; color: #ffffff;">Nexus</span>
      </div>

      <h2 style="font-size: 20px; font-weight: 600; color: #ffffff; margin: 0 0 8px;">Job sign-off requested</h2>
      <p style="color: #a1a1aa; margin: 0 0 6px;">Hi ${clientName || 'there'},</p>
      <p style="color: #a1a1aa; margin: 0 0 24px;">
        <strong style="color: #d4d4d8;">${orgName}</strong> has completed work on
        <strong style="color: #d4d4d8;">${jobTitle}</strong> and is requesting your approval before closing out.
      </p>

      <a href="${approvalLink}" style="display: inline-block; background: #a8a29e; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 15px;">
        Review &amp; Approve
      </a>

      <p style="color: #71717a; font-size: 12px; margin-top: 32px;">
        If you have questions about this job, contact ${orgName} directly.
        This link will remain active until the job is closed out.
      </p>
    </div>
  `
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS })
  }

  try {
    const { clientEmail, clientPhone, clientName, jobTitle, approvalLink, orgName } = await req.json()

    if (!clientEmail && !clientPhone) {
      return new Response(
        JSON.stringify({ error: 'No contact info provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...CORS } }
      )
    }

    const results = { email: 'skipped', sms: 'skipped' }

    // Email via Resend
    if (clientEmail && RESEND_API_KEY) {
      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: `${orgName} via Nexus <${RESEND_FROM_EMAIL}>`,
            to: clientEmail,
            subject: `Please approve: ${jobTitle}`,
            html: approvalEmailHtml(clientName, orgName, jobTitle, approvalLink),
          }),
        })
        results.email = res.ok ? 'sent' : 'failed'
      } catch {
        results.email = 'failed'
      }
    }

    // SMS via Twilio
    if (clientPhone && TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_PHONE_NUMBER) {
      try {
        const smsBody = `Hi ${clientName || 'there'}, ${orgName} requests your sign-off on "${jobTitle}". Review here: ${approvalLink}`
        const form = new URLSearchParams({
          To: toE164(clientPhone),
          From: TWILIO_PHONE_NUMBER,
          Body: smsBody,
        })
        const res = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              Authorization: `Basic ${btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)}`,
            },
            body: form.toString(),
          }
        )
        results.sms = res.ok ? 'sent' : 'failed'
      } catch {
        results.sms = 'failed'
      }
    }

    return new Response(
      JSON.stringify({ success: true, ...results }),
      { headers: { 'Content-Type': 'application/json', ...CORS } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...CORS } }
    )
  }
})
