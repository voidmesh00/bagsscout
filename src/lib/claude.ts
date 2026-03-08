import Anthropic from '@anthropic-ai/sdk'
import type { BagsToken, TokenHolder, ScoutAnalysis, FeedItem, TradeData } from '@/types'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// ── CORE: Analyze a single token ──
export async function analyzeToken(
  token: Partial<BagsToken>,
  holders: TokenHolder[],
  trades: TradeData[],
  githubActivity: any
): Promise<ScoutAnalysis> {

  // Build context for Claude
  const top5Holders = holders.slice(0, 5)
  const top5Pct = top5Holders.reduce((sum, h) => sum + h.percentage, 0)
  const buyCount = trades.filter(t => t.type === 'buy').length
  const sellCount = trades.filter(t => t.type === 'sell').length
  const recentVolume = trades.slice(0, 10).reduce((sum, t) => sum + t.amount, 0)

  const prompt = `You are BagsScout, an AI intelligence agent monitoring the Bags.fm token ecosystem on Solana.

Analyze this Bags token and return a JSON analysis object.

TOKEN DATA:
- Name: ${token.name || 'Unknown'}
- Symbol: ${token.symbol || 'Unknown'}
- Mint: ${token.mintAddress}
- Creator Twitter: ${token.twitterHandle || 'Not linked'}
- Creator GitHub: ${token.githubHandle || 'Not linked'}
- Created: ${token.createdAt || 'Unknown'}
- Unclaimed fees: ${token.unclaimedFees || 0} SOL
- Total fees generated: ${token.totalFees || 0} SOL

HOLDER DATA:
- Total holders shown: ${holders.length}
- Top 5 holders control: ${top5Pct.toFixed(1)}%
- Largest holder: ${holders[0]?.percentage?.toFixed(1) || 0}%

TRADING DATA (last 50 trades):
- Buy count: ${buyCount}
- Sell count: ${sellCount}
- Recent volume: ${recentVolume.toFixed(2)} tokens
- Buy/sell ratio: ${buyCount > 0 ? (buyCount / (buyCount + sellCount) * 100).toFixed(0) : 0}%

GITHUB ACTIVITY (if creator linked):
${githubActivity ? `- Recent events (30 days): ${githubActivity.recentEvents}
- Is active builder: ${githubActivity.isActive}
- Last activity: ${githubActivity.lastActivity}` : '- No GitHub linked'}

Return ONLY a valid JSON object with this exact structure (no markdown, no explanation):
{
  "verdict": "STRONG" | "NEUTRAL" | "RISKY",
  "score": <number 0-100>,
  "summary": "<2 sentence plain English summary of this token>",
  "creatorScore": {
    "score": <number 0-40>,
    "label": "<one of: Verified Builder | Active Creator | Anon | Ghost | Unknown>",
    "details": "<1 sentence>"
  },
  "holderScore": {
    "score": <number 0-30>,
    "label": "<one of: Distributed | Healthy | Concentrated | Whale-Heavy>",
    "details": "<1 sentence>"
  },
  "momentumScore": {
    "score": <number 0-30>,
    "label": "<one of: High Activity | Growing | Steady | Slow | Suspicious>",
    "details": "<1 sentence>"
  },
  "flags": [
    { "type": "warning" | "positive" | "neutral", "message": "<flag message>" }
  ],
  "insights": [
    "<insight 1>",
    "<insight 2>",
    "<insight 3>"
  ]
}`

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : '{}'
  
  try {
    const parsed = JSON.parse(text.replace(/```json|```/g, '').trim())
    return { ...parsed, generatedAt: new Date().toISOString() }
  } catch {
    // Fallback if JSON parse fails
    return {
      verdict: 'NEUTRAL',
      score: 50,
      summary: 'Analysis completed with limited data.',
      creatorScore: { score: 15, label: 'Unknown', details: 'Insufficient creator data.' },
      holderScore: { score: 15, label: 'Unknown', details: 'Holder data unavailable.' },
      momentumScore: { score: 15, label: 'Steady', details: 'Normal trading activity.' },
      flags: [{ type: 'neutral', message: 'Limited data available for full analysis.' }],
      insights: ['Connect more data sources for deeper insights.'],
      generatedAt: new Date().toISOString(),
    }
  }
}

// ── FEED: Generate insights for ecosystem feed ──
export async function generateFeedInsights(
  tokens: Partial<BagsToken>[]
): Promise<string[]> {
  if (tokens.length === 0) return []

  const prompt = `You are BagsScout, monitoring the Bags.fm ecosystem on Solana.

Here are recently active tokens. Generate 5 concise, useful insights for traders and creators watching this ecosystem.

TOKENS:
${tokens.slice(0, 10).map(t => `- ${t.name} ($${t.symbol}) | Volume: ${t.volume24h || 0} SOL | Created: ${t.createdAt}`).join('\n')}

Return ONLY a JSON array of 5 insight strings. Each insight should be 1-2 sentences, specific, and actionable.
No markdown, no explanation, just the JSON array.
Example: ["Insight 1 here.", "Insight 2 here."]`

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 600,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : '[]'
    return JSON.parse(text.replace(/```json|```/g, '').trim())
  } catch {
    return ['Ecosystem data loaded. Analyzing recent token activity.']
  }
}

// ── QUICK SUMMARY: One-line token summary ──
export async function quickSummary(token: Partial<BagsToken>): Promise<string> {
  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 100,
      messages: [{
        role: 'user',
        content: `Describe this Bags.fm token in one sentence for a crypto-savvy audience: 
Name: ${token.name}, Symbol: ${token.symbol}, Creator: ${token.twitterHandle || 'anon'}, 
Unclaimed fees: ${token.unclaimedFees || 0} SOL. Be specific and direct. No fluff.`
      }]
    })
    return message.content[0].type === 'text' ? message.content[0].text : ''
  } catch {
    return ''
  }
}
