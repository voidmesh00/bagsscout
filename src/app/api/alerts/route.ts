import { NextResponse } from 'next/server'
import { fetchRecentBagsTokens, fetchTokenMetadata } from '@/lib/bags'

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY

async function detectAnomalies(tokens: any[]) {
  const prompt = `You are BagsScout anomaly detection for Bags.fm. Analyze tokens and return ONLY a JSON array, no markdown.

Tokens:
${JSON.stringify(tokens.slice(0, 20).map(t => ({
  mint: t.mintAddress, name: t.name, symbol: t.symbol,
  volume24h: t.volume24h || 0, holders: t.holders || 0,
  totalFees: t.totalFees || 0, unclaimedFees: t.unclaimedFees || 0,
  claimedFees: t.claimedFees || 0, createdAt: t.createdAt,
})), null, 2)}

Detect: volume_spike, unclaimed_high, new_activity, fee_anomaly. Return max 8 alerts:
[{"type":"volume_spike|unclaimed_high|new_activity|fee_anomaly","severity":"high|medium|low","mint":"...","name":"...","symbol":"...","title":"max 8 words","description":"1-2 sentences","metric":"key value string","action":"suggested action"}]`

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': ANTHROPIC_API_KEY!, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 1000, messages: [{ role: 'user', content: prompt }] })
  })
  const data = await res.json()
  const text = data.content?.[0]?.text || '[]'
  try { return JSON.parse(text.replace(/\`\`\`json|\`\`\`/g, '').trim()) }
  catch { return [] }
}

export async function GET() {
  try {
    const tokens = await fetchRecentBagsTokens()
    if (tokens.length === 0) return NextResponse.json({ alerts: [], error: 'rate_limit' })
    const tokensWithFees = await Promise.all(
      tokens.slice(0, 20).map(async (token) => {
        const meta = await fetchTokenMetadata(token.mintAddress!)
        return { ...token, totalFees: meta.totalFees ?? token.totalFees, claimedFees: meta.claimedFees ?? 0, unclaimedFees: meta.unclaimedFees ?? 0 }
      })
    )
    const alerts = await detectAnomalies(tokensWithFees)
    return NextResponse.json({ alerts, generatedAt: new Date().toISOString() })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed' }, { status: 500 })
  }
}
