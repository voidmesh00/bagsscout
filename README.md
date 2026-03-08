# BagsScout

AI-powered token intelligence platform for the [Bags.fm](https://bags.fm) ecosystem.

## Features

- **Token Analyzer** — Paste any Bags token mint address and get an AI-generated Scout Score (0-100) with STRONG / NEUTRAL / RISKY verdict
- **Live Feed** — Real-time ecosystem activity monitored by Claude AI, auto-refreshes every 2 minutes
- **Top Tokens** — Leaderboard of top Bags tokens by lifetime fees, volume, and holders

## Live Demo

[bagsscout.vercel.app](https://bagsscout.vercel.app)

## Tech Stack

- Next.js 14
- Claude AI (claude-sonnet-4-20250514)
- Bags SDK + Bags Public API v2
- Bitquery Streaming API
- Tailwind CSS
- Vercel

## Getting Started

### 1. Clone and install
```bash

cat > /root/bagsscout/.env.example << 'ENDFILE'
BAGS_API_KEY=
BAGS_PARTNER_KEY=
ANTHROPIC_API_KEY=
BITQUERY_API_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
