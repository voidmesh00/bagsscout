import type { BagsToken, TokenHolder } from '@/types'

const BAGS_BASE = 'https://public-api-v2.bags.fm/api/v1'

const bagsHeaders = () => ({
  'x-api-key': process.env.BAGS_API_KEY || '',
  'Content-Type': 'application/json',
})

const bitqueryHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${process.env.BITQUERY_API_KEY}`,
})

const lamportsToSol = (lamports: string | number) => parseFloat(String(lamports)) / 1e9

export async function fetchTokenMetadata(mintAddress: string): Promise<Partial<BagsToken>> {
  try {
    const [creatorRes, feeRes, claimRes] = await Promise.all([
      fetch(`${BAGS_BASE}/token-launch/creator/v3?tokenMint=${mintAddress}`, { headers: bagsHeaders() }),
      fetch(`${BAGS_BASE}/token-launch/lifetime-fees?tokenMint=${mintAddress}`, { headers: bagsHeaders() }),
      fetch(`${BAGS_BASE}/token-launch/claim-stats?tokenMint=${mintAddress}`, { headers: bagsHeaders() }),
    ])
    const creators: any[] = creatorRes.ok ? ((await creatorRes.json())?.response || []) : []
    const lifetimeFeesLamports = feeRes.ok ? ((await feeRes.json())?.response || '0') : '0'
    const claimStats: any[] = claimRes.ok ? ((await claimRes.json())?.response || []) : []
    const twitterClaimer = creators.find((c) => c.provider === 'twitter' && c.isCreator) || creators.find((c) => c.provider === 'twitter')
    const githubClaimer = creators.find((c) => c.provider === 'github')
    const totalClaimed = claimStats.reduce((sum, c) => sum + parseFloat(c.totalClaimed || '0'), 0)
    const lifetimeFeesSol = lamportsToSol(lifetimeFeesLamports)
    const claimedSol = lamportsToSol(totalClaimed)
    return {
      mintAddress,
      twitterHandle: twitterClaimer?.twitterUsername || twitterClaimer?.providerUsername,
      githubHandle: githubClaimer?.providerUsername,
      creator: twitterClaimer?.wallet,
      totalFees: lifetimeFeesSol,
      claimedFees: claimedSol,
      unclaimedFees: Math.max(0, lifetimeFeesSol - claimedSol),
    }
  } catch { return {} }
}

export async function fetchTokenMetadataFromTopTokens(mintAddress: string): Promise<Partial<BagsToken>> {
  try {
    const res = await fetch(`${BAGS_BASE}/token-launch/top-tokens/lifetime-fees`, { headers: bagsHeaders() })
    if (!res.ok) return {}
    const tokens: any[] = (await res.json())?.response || []
    const found = tokens.find((t) => t.token === mintAddress)
    if (!found) return {}
    const info = found.tokenInfo || {}
    const creators: any[] = found.creators || []
    const twitterClaimer = creators.find((c) => c.isCreator) || creators[0]
    return {
      mintAddress,
      name: info.name,
      symbol: info.symbol,
      imageUrl: info.icon,
      createdAt: info.createdAt,
      twitterHandle: twitterClaimer?.twitterUsername || twitterClaimer?.providerUsername,
      holders: info.holderCount,
      price: info.usdPrice,
      volume24h: (info.stats24h?.buyVolume || 0) + (info.stats24h?.sellVolume || 0),
    }
  } catch { return {} }
}

export async function fetchTokenHolders(mintAddress: string): Promise<TokenHolder[]> {
  const query = `query GetHolders($mint: String!) {
    Solana {
      BalanceUpdates(
        where: { BalanceUpdate: { Currency: { MintAddress: { is: $mint } } PostBalance: { gt: "0" } } }
        orderBy: { descending: BalanceUpdate_PostBalance }
        limit: { count: 50 }
      ) {
        BalanceUpdate {
          Account { Address }
          PostBalance
        }
      }
    }
  }`
  try {
    const res = await fetch('https://streaming.bitquery.io/graphql', { method: 'POST', headers: bitqueryHeaders(), body: JSON.stringify({ query, variables: { mint: mintAddress } }) })
    const updates = (await res.json())?.data?.Solana?.BalanceUpdates || []
    
    // Deduplicate: keep highest balance per wallet
    const walletMap = new Map<string, number>()
    for (const u of updates) {
      const addr = u.BalanceUpdate.Account.Address
      const bal = parseFloat(u.BalanceUpdate.PostBalance)
      if (!walletMap.has(addr) || walletMap.get(addr)! < bal) {
        walletMap.set(addr, bal)
      }
    }
    
    // Sort by balance descending, take top 20
    const sorted = Array.from(walletMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
    
    const total = sorted.reduce((s, [, bal]) => s + bal, 0)
    return sorted.map(([addr, bal]) => ({
      address: addr,
      amount: bal,
      percentage: total > 0 ? (bal / total) * 100 : 0
    }))
  } catch { return [] }
}

export async function fetchRecentTrades(mintAddress: string) {
  const query = `query GetTrades($mint: String!) { Solana { DEXTradeByTokens(where: { Trade: { Currency: { MintAddress: { is: $mint } } } } orderBy: { descending: Block_Time } limit: { count: 50 }) { Block { Time } Trade { Amount Price Side { Type } Buyer { Address } Seller { Address } } } } }`
  try {
    const res = await fetch('https://streaming.bitquery.io/graphql', { method: 'POST', headers: bitqueryHeaders(), body: JSON.stringify({ query, variables: { mint: mintAddress } }) })
    const trades = (await res.json())?.data?.Solana?.DEXTradeByTokens || []
    return trades.map((t: any) => ({ timestamp: t.Block.Time, price: t.Trade.Price, amount: parseFloat(t.Trade.Amount), type: t.Trade.Side?.Type === 'buy' ? 'buy' : 'sell', wallet: t.Trade.Buyer?.Address || t.Trade.Seller?.Address || 'unknown' }))
  } catch { return [] }
}

export async function fetchTokenStats(mintAddress: string) {
  const after = new Date(Date.now() - 86400000).toISOString()
  const query = `query GetStats($mint: String!) { Solana { DEXTradeByTokens(where: { Trade: { Currency: { MintAddress: { is: $mint } } } Block: { Time: { after: "${after}" } } }) { Trade { Price } volume: sum(of: Trade_Amount) count } } }`
  try {
    const res = await fetch('https://streaming.bitquery.io/graphql', { method: 'POST', headers: bitqueryHeaders(), body: JSON.stringify({ query, variables: { mint: mintAddress } }) })
    const stats = (await res.json())?.data?.Solana?.DEXTradeByTokens?.[0]
    return { price: stats?.Trade?.Price || 0, volume24h: parseFloat(stats?.volume || '0'), tradeCount: parseInt(stats?.count || '0') }
  } catch { return { price: 0, volume24h: 0, tradeCount: 0 } }
}

export async function fetchRecentBagsTokens(): Promise<Partial<BagsToken>[]> {
  try {
    const res = await fetch(`${BAGS_BASE}/token-launch/top-tokens/lifetime-fees`, { headers: bagsHeaders() })
    if (!res.ok) return []
    const tokens: any[] = (await res.json())?.response || []
    return tokens.slice(0, 20).map((t) => {
      const info = t.tokenInfo || {}
      const creator = (t.creators || []).find((c: any) => c.isCreator) || t.creators?.[0]
      return { mintAddress: t.token, name: info.name, symbol: info.symbol, imageUrl: info.icon, createdAt: info.createdAt, twitterHandle: creator?.twitterUsername, holders: info.holderCount, totalFees: lamportsToSol(t.lifetimeFees), volume24h: (info.stats24h?.buyVolume || 0) + (info.stats24h?.sellVolume || 0) }
    })
  } catch { return [] }
}

export async function fetchGithubActivity(username: string) {
  try {
    const res = await fetch(`https://api.github.com/users/${username}/events/public?per_page=30`, { headers: { 'Accept': 'application/vnd.github.v3+json' } })
    if (!res.ok) return null
    const events = await res.json()
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
    const recentEvents = events.filter((e: any) => new Date(e.created_at).getTime() > thirtyDaysAgo)
    return { totalEvents: events.length, recentEvents: recentEvents.length, isActive: recentEvents.length > 0, lastActivity: events[0]?.created_at || null }
  } catch { return null }
}
