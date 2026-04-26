import "@supabase/functions-js/edge-runtime.d.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const RESEND_FROM_EMAIL = Deno.env.get('RESEND_FROM_EMAIL') ?? 'onboarding@resend.dev'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS })
  }

  try {
    const { email, inviteLink, role, orgName } = await req.json()

    if (!email || !inviteLink || !role || !orgName) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...CORS } }
      )
    }

    if (!RESEND_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'RESEND_API_KEY not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...CORS } }
      )
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: `${orgName} via Nexus <${RESEND_FROM_EMAIL}>`,
        to: email,
        subject: `You've been invited to join ${orgName} on Nexus`,
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #18181b; color: #e4e4e7; border-radius: 12px;">
            <div style="margin-bottom: 32px;">
              <span style="font-size: 24px; font-weight: 700; color: #ffffff;">Nexus</span>
            </div>

            <h2 style="font-size: 20px; font-weight: 600; color: #ffffff; margin: 0 0 8px;">You're invited to join ${orgName}</h2>
            <p style="color: #a1a1aa; margin: 0 0 24px;">You've been invited as a <strong style="color: #e7e5e4;">${role}</strong>. Click the button below to create your account and get started.</p>

            <a href="${inviteLink}" style="display: inline-block; background: #a8a29e; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 15px;">
              Accept Invitation
            </a>

            <p style="color: #71717a; font-size: 12px; margin-top: 32px;">This link expires in 7 days. If you weren't expecting this invite, you can ignore this email.</p>
          </div>
        `,
      }),
    })

    if (!res.ok) {
      const error = await res.text()
      return new Response(
        JSON.stringify({ error }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...CORS } }
      )
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { 'Content-Type': 'application/json', ...CORS } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...CORS } }
    )
  }
})
