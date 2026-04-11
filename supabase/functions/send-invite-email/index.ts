import "@supabase/functions-js/edge-runtime.d.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  try {
    const { email, inviteLink, role, orgName } = await req.json()

    if (!email || !inviteLink || !role || !orgName) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 })
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Ridgeline <onboarding@resend.dev>',
        to: email,
        subject: `You've been invited to join ${orgName} on Ridgeline`,
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #1c1917; color: #e7e5e4; border-radius: 12px;">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 32px;">
              <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <polyline points="2,32 20,10 38,32" stroke="#10b981" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                <polyline points="10,32 20,18 30,32" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0.5"/>
              </svg>
              <span style="font-size: 24px; font-weight: 700; color: #ffffff;">Ridgeline</span>
            </div>

            <h2 style="font-size: 20px; font-weight: 600; color: #ffffff; margin: 0 0 8px;">You're invited to join ${orgName}</h2>
            <p style="color: #a8a29e; margin: 0 0 24px;">You've been invited as a <strong style="color: #10b981;">${role}</strong>. Click the button below to create your account and get started.</p>

            <a href="${inviteLink}" style="display: inline-block; background: #10b981; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 15px;">
              Accept Invitation
            </a>

            <p style="color: #78716c; font-size: 12px; margin-top: 32px;">This link expires in 7 days. If you weren't expecting this invite, you can ignore this email.</p>
          </div>
        `,
      }),
    })

    if (!res.ok) {
      const error = await res.text()
      return new Response(JSON.stringify({ error }), { status: 500 })
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 })
  }
})
