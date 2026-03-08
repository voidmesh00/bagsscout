# BagsScout

AI-powered token intelligence platform for the [Bags.fm](https://bags.fm) ecosystem.

## Live Demo

**[bagsscout.vercel.app](https://bagsscout.vercel.app)**

## Features

### 🔍 Token Analyzer
Paste any Bags token mint address and get an AI-generated Scout Score (0-100) with **STRONG / NEUTRAL / RISKY** verdict.
- Creator identity & GitHub activity analysis
- Holder distribution (whale detection, concentration risk)
- Trading patterns & momentum
- Fee claiming behavior
- Red flags & green flags

### 🚨 AI Alerts
Claude automatically scans the ecosystem every 5 minutes and surfaces anomalies:
- **Volume Spike** — token with unusually high volume
- **High Unclaimed** — creator not claiming fees (abandonment or accumulation?)
- **New Activity** — recently created token gaining traction
- **Fee Anomaly** — unusual claiming patterns

### 📊 Top Tokens
Live leaderboard of top Bags tokens. Sort by:
- Lifetime Fees
- Unclaimed Fees
- Volume 24h
- Holders

### 📡 Live Feed
Real-time ecosystem activity monitored by Claude AI. Auto-refreshes every 2 minutes with AI insights.

## Tech Stack

- **Frontend**: Next.js 14, Tailwind CSS
- **AI**: Claude AI (claude-sonnet-4-20250514)
- **Data**: Bags SDK + Bags Public API v2
- **Onchain**: Bitquery Streaming API
- **Deploy**: Vercel

## Getting Started

### 1. Clone and install
```bash
git clone https://github.com/voidmesh00/bagsscout
cd bagsscout
npm install
```

### 2. Set environment variables
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```
BAGS_API_KEY=your_bags_api_key
BAGS_PARTNER_KEY=your_bags_partner_key
ANTHROPIC_API_KEY=your_anthropic_api_key
BITQUERY_API_KEY=your_bitquery_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Run locally
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

| Variable | Description |
|----------|-------------|
| `BAGS_API_KEY` | Bags.fm API key from [bags.fm/developers](https://bags.fm/developers) |
| `BAGS_PARTNER_KEY` | Bags.fm partner key |
| `ANTHROPIC_API_KEY` | Anthropic API key from [console.anthropic.com](https://console.anthropic.com) |
| `BITQUERY_API_KEY` | Bitquery API key from [account.bitquery.io](https://account.bitquery.io) |
| `NEXT_PUBLIC_APP_URL` | App URL (use https://bagsscout.vercel.app for production) |

## Built for

**Bags Hackathon Q1 2026** — Categories: Bags API + AI Agents

## Screenshots

| Token Analyzer | AI Alerts | Top Tokens |
|---|---|---|
| Scout Score with STRONG/NEUTRAL/RISKY verdict | Auto-detected anomalies | Live leaderboard with sorting |
