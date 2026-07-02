// ═══════════════════════════════════════════════════════════════════════
//  Edge Function: r2-upload-url
//
//  Returns a short-lived presigned PUT url so the browser can upload a file
//  straight to Cloudflare R2 — without ever seeing the R2 secret keys.
//
//  Because verify_jwt defaults to ON, only logged-in family can call this.
//
//  Set these secrets (NOT in the frontend .env):
//    supabase secrets set R2_ACCOUNT_ID=... R2_ACCESS_KEY_ID=... \
//      R2_SECRET_ACCESS_KEY=... R2_BUCKET=... R2_PUBLIC_URL=https://media.example.com
//
//  Deploy:  supabase functions deploy r2-upload-url
// ═══════════════════════════════════════════════════════════════════════
import { AwsClient } from 'https://esm.sh/aws4fetch@1.0.20'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const ACCOUNT_ID = Deno.env.get('R2_ACCOUNT_ID')!
const BUCKET = Deno.env.get('R2_BUCKET')!
const PUBLIC_URL = (Deno.env.get('R2_PUBLIC_URL') || '').replace(/\/$/, '')

const client = new AwsClient({
  accessKeyId: Deno.env.get('R2_ACCESS_KEY_ID')!,
  secretAccessKey: Deno.env.get('R2_SECRET_ACCESS_KEY')!,
  region: 'auto',
  service: 's3',
})

// Deterministic-ish unique key without Math.random (works fine in Deno).
function makeKey(folder: string, ext: string) {
  const safe = folder.replace(/[^a-z0-9-_]/gi, '').toLowerCase() || 'misc'
  const id = crypto.randomUUID()
  return `${safe}/${id}.${ext.replace(/[^a-z0-9]/gi, '') || 'bin'}`
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  try {
    const { folder = 'misc', contentType = 'application/octet-stream', ext = 'bin' } =
      await req.json()

    const key = makeKey(folder, ext)
    const endpoint = `https://${ACCOUNT_ID}.r2.cloudflarestorage.com/${BUCKET}/${key}`

    // Presign a PUT valid for 5 minutes.
    const signed = await client.sign(
      new Request(endpoint, { method: 'PUT', headers: { 'content-type': contentType } }),
      { aws: { signQuery: true }, expires: 300 },
    )

    const publicUrl = PUBLIC_URL
      ? `${PUBLIC_URL}/${key}`
      : `${endpoint}` // fallback (works only if bucket is public via r2.dev)

    return new Response(
      JSON.stringify({ uploadUrl: signed.url, publicUrl, key }),
      { headers: { ...cors, 'Content-Type': 'application/json' } },
    )
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...cors, 'Content-Type': 'application/json' },
    })
  }
})
