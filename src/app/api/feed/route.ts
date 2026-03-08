import { NextResponse } from 'next/server'
import { fetchRecentBagsTokens, fetchTokenStats } from '@/lib/bags'
import { generateFeedInsights } from '@/lib/claude'
import type { FeedItem } from '@/types'

export async function GET() {
  try {
    // Fetch recent tokens from Bags ecosystem
    const recentTokens = await fetchRecentBagsTokens()

    // Fetch stats for each token (limit to 10 for performance)
    const tokensWithStats = await Promise.all(
      recentTokens.slice(0, 10).map(async (token) => {
        const stats = await fetchTokenStats(token.mintAddress!)
        return { ...token, ...stats }
      })
    )

    // Build feed items from token data
    const items: FeedItem[] = tokensWithStats.map((token, i) => {
      // Determine event type based on data
      let type: FeedItem['type'] = 'new_token'
      let insight = `${token.name} ($${token.symbol}) launched on Bags.`
      let severity: FeedItem['severity'] = 'low'

      if (token.volume24h > 100) {
        type = 'volume_spike'
        insight = `$${token.symbol} hit ${token.volume24h.toFixed(0)} SOL volume in 24h — significant trading activity detected.`
        severity = 'high'
      } else if (token.volume24h > 10) {
        type = 'volume_spike'
        insight = `$${token.symbol} showing ${token.volume24h.toFixed(1)} SOL in volume over 24h.`
        severity = 'medium'
      }

      return {
        id: `${token.mintAddress}-${i}`,
        type,
        token: token as any,
        insight,
        timestamp: token.createdAt || new Date().toISOString(),
        severity,
      }
    })

    // Generate Claude insights about the overall ecosystem
    const insights = await generateFeedInsights(tokensWithStats)

    return NextResponse.json({
      items,
      insights,
      generatedAt: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('Feed error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to load feed' },
      { status: 500 }
    )
  }
}
