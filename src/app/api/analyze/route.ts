import { NextRequest, NextResponse } from 'next/server'
import { fetchTokenMetadata, fetchTokenMetadataFromTopTokens, fetchTokenHolders, fetchRecentTrades, fetchTokenStats, fetchGithubActivity } from '@/lib/bags'
import { analyzeToken } from '@/lib/claude'

export async function POST(req: NextRequest) {
  try {
    const { mintAddress } = await req.json()
    if (!mintAddress || typeof mintAddress !== 'string') {
      return NextResponse.json({ error: 'Invalid mint address' }, { status: 400 })
    }
    const [baseMeta, topMeta, holders, trades, stats] = await Promise.all([
      fetchTokenMetadata(mintAddress),
      fetchTokenMetadataFromTopTokens(mintAddress),
      fetchTokenHolders(mintAddress),
      fetchRecentTrades(mintAddress),
      fetchTokenStats(mintAddress),
    ])
    const token = { ...topMeta, ...baseMeta, mintAddress, volume24h: topMeta.volume24h || stats.volume24h, price: topMeta.price || stats.price, holders: topMeta.holders }
    let githubActivity = null
    if (token.githubHandle) githubActivity = await fetchGithubActivity(token.githubHandle)
    const analysis = await analyzeToken(token, holders, trades, githubActivity)
    return NextResponse.json({ token, analysis, holders, recentTrades: trades.slice(0, 20) })
  } catch (error: any) {
    console.error('Analyze error:', error)
    return NextResponse.json({ error: error.message || 'Analysis failed' }, { status: 500 })
  }
}
