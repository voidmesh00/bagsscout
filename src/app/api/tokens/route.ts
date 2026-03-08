import { NextResponse } from 'next/server'
import { fetchRecentBagsTokens, fetchTokenMetadata } from '@/lib/bags'

export async function GET() {
  try {
    const recentTokens = await fetchRecentBagsTokens()

    if (recentTokens.length === 0) {
      return NextResponse.json({ tokens: [], error: 'rate_limit' })
    }

    const tokensWithFees = await Promise.all(
      recentTokens.slice(0, 20).map(async (token) => {
        const meta = await fetchTokenMetadata(token.mintAddress!)
        return {
          ...token,
          totalFees: meta.totalFees ?? token.totalFees,
          claimedFees: meta.claimedFees ?? 0,
          unclaimedFees: meta.unclaimedFees ?? 0,
        }
      })
    )

    const sorted = tokensWithFees.sort((a, b) => (b.totalFees || 0) - (a.totalFees || 0))
    return NextResponse.json({ tokens: sorted })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed' }, { status: 500 })
  }
}
