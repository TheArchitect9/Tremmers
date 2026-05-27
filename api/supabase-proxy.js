// Vercel Serverless Function to proxy requests to Supabase using the
// service_role key stored in server environment variables.
// This keeps the service_role key off the client.

export default async function handler(req, res) {
  const SUPABASE_URL = process.env.SUPABASE_URL
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    res.status(500).json({ error: 'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY on server' })
    return
  }

  // Expect client to call: /api/supabase-proxy?p=<path>
  const path = req.query.p || ''
  const targetUrl = `${SUPABASE_URL}/${path}`

  const headers = {
    'Content-Type': req.headers['content-type'] || 'application/json',
    apikey: SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
  }

  try {
    const fetchOptions = {
      method: req.method,
      headers,
      body: ['GET', 'HEAD'].includes(req.method) ? undefined : JSON.stringify(req.body),
    }

    const upstream = await fetch(targetUrl, fetchOptions)
    const text = await upstream.text()

    // forward status and content-type
    res.status(upstream.status)
    const ct = upstream.headers.get('content-type')
    if (ct) res.setHeader('Content-Type', ct)
    res.send(text)
  } catch (err) {
    res.status(502).json({ error: 'Proxy error', details: err.message })
  }
}
