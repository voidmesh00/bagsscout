import { NextResponse } from 'next/server'

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://bagsscout.vercel.app'

async function detectAnomalies(tokens: any[]) {
  const prompt = `You are BagsScout anomaly detection for Bags.fm. Analyze these tokens and return ONLY a JSON array, no markdown, no explanation.

Tokens data:
${JSON.stringify(tokens.slice(0, 20).map(t => ({
  mint: t.mintAddress, name: t.name, symbol: t.symbol,
  volume24h: t.volume24h || 0, holders: t.holders || 0,
  totalFees: t.totalFees || 0, unclaimedFees: t.unclaimedFees || 0,
  claimedFees: t.claimedFees || 0, createdAt: t.createdAt,
})), null, 2)}

Identify the most interesting anomalies. Detect:
1. volume_spike - token with unusually high volume relative to others
2. unclaimed_high - token with large unclaimed fees (creator not claiming)
3. new_activity - recently created token gaining traction
4. fee_anomaly - token where claimed >> unclaimed (very active claiming)

Return exactly this JSON format, max 8 alerts, NO other text:
[{"type":"volume_spike","severity":"high","mint":"mint_address","name":"Token Name","symbol":"SYM","title":"Short title max 8 words","description":"1-2 sentence explanation","metric":"key metric value","action":"suggested action for trader"}]`

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }]
    })
  })
  const data = await res.json()
  if (!data.content) {
    console.error('Claude API error:', JSON.stringify(data))
    return []
  }
  const text = data.content[0]?.text || '[]'
  try {
    const cleaned = text.replace(/```json|```/g, '').trim()
    const start = cleaned.indexOf('[')
    const end = cleaned.lastIndexOf(']')
    if (start === -1 || end === -1) return []
    return JSON.parse(cleaned.slice(start, end + 1))
  } catch (e) {
    console.error('Parse error:', e, 'Raw:', text)
    return []
  }
}

export async function GET(req: Request) {
  try {
    // Reuse tokens data from /api/tokens to avoid extra Bags API calls
    const tokensRes = await fetch(`${APP_URL}/api/tokens`)
    if (!tokensRes.ok) return NextResponse.json({ alerts: [], error: 'tokens_failed' })
    const tokensData = await tokensRes.json()
    const tokens = tokensData.tokens || []

    if (tokens.length === 0) return NextResponse.json({ alerts: [], error: 'rate_limit' })

    const alerts = await detectAnomalies(tokens)
    return NextResponse.json({ alerts, generatedAt: new Date().toISOString() })
  } catch (error: any) {
    console.error('Alerts error:', error)
    return NextResponse.json({ error: error.message || 'Failed' }, { status: 500 })
  }
}
