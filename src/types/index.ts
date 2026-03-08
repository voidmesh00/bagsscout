// Token types
export interface BagsToken {
  mintAddress: string
  name: string
  symbol: string
  creator: string
  twitterHandle?: string
  githubHandle?: string
  imageUrl?: string
  createdAt: string
  marketCap?: number
  volume24h?: number
  price?: number
  priceChange24h?: number
  holders?: number
  totalFees?: number
  claimedFees?: number
  unclaimedFees?: number
}

export interface TokenHolder {
  address: string
  amount: number
  percentage: number
}

export interface TradeData {
  timestamp: string
  price: number
  amount: number
  type: 'buy' | 'sell'
  wallet: string
}

// AI Analysis types
export interface ScoutAnalysis {
  verdict: 'STRONG' | 'NEUTRAL' | 'RISKY'
  score: number // 0-100
  summary: string
  creatorScore: {
    score: number
    label: string
    details: string
  }
  holderScore: {
    score: number
    label: string
    details: string
  }
  momentumScore: {
    score: number
    label: string
    details: string
  }
  flags: ScoutFlag[]
  insights: string[]
  generatedAt: string
}

export interface ScoutFlag {
  type: 'warning' | 'positive' | 'neutral'
  message: string
}

// Feed types
export interface FeedItem {
  id: string
  type: 'new_token' | 'volume_spike' | 'fee_claimed' | 'whale_entry' | 'creator_alert'
  token: BagsToken
  insight: string
  timestamp: string
  severity: 'high' | 'medium' | 'low'
}

// API response types
export interface AnalyzeResponse {
  token: BagsToken
  analysis: ScoutAnalysis
  holders: TokenHolder[]
  recentTrades: TradeData[]
}

export interface FeedResponse {
  items: FeedItem[]
  generatedAt: string
}
