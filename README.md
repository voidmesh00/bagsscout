# BagsScout 🔍

AI-powered intelligence for the Bags.fm ecosystem. Analyze tokens, monitor the live feed, and get Claude-generated insights — all in one clean interface.

## Features

- **Token Analyzer** — Paste any Bags token mint address, get a full AI analysis: creator background, holder distribution, trading patterns, fee activity, and an overall Scout Score (0–100)
- **Live Feed** — Real-time stream of ecosystem activity with Claude insights
- **Top Tokens** — Browse recently launched Bags tokens sorted by volume

## Stack

- Next.js 14 (App Router)
- Claude API (claude-sonnet-4-20250514) — AI analysis engine
- Bags SDK — Token data and fee sharing
- Bitquery API — Onchain trades, volumes, holders
- Tailwind CSS
- Vercel (deploy)

---

## Setup

### 1. Clone and install

```bash
git clone https://github.com/yourusername/bagsscout
cd bagsscout
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env.local` and fill in your keys:

```bash
cp .env.example .env.local
```

| Variable | Where to get it |
|---|---|
| `BAGS_API_KEY` | [dev.bags.fm](https://dev.bags.fm) |
| `BAGS_PARTNER_KEY` | [dev.bags.fm](https://dev.bags.fm) → Partner Keys |
| `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com) |
| `SOLANA_RPC_URL` | [helius.dev](https://helius.dev) (free tier) |
| `BITQUERY_API_KEY` | [bitquery.io](https://bitquery.io) (free tier) |

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deploy to Vercel

### Option A — Vercel CLI (recommended)

```bash
npm install -g vercel
vercel login
vercel --prod
```

Add env vars when prompted, or add them in the Vercel dashboard under **Settings → Environment Variables**.

### Option B — GitHub integration

1. Push to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import repo
3. Add all environment variables in the Vercel dashboard
4. Deploy

---

## Run on VPS (with Vercel output)

If you want to self-host on your VPS instead of using Vercel's edge network:

```bash
# Build
npm run build

# Start production server
npm run start
# Runs on port 3000 by default

# Or with custom port
PORT=8080 npm run start
```

### Nginx reverse proxy config

```nginx
server {
    listen 80;
    server_name bagsscout.xyz;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### PM2 process manager

```bash
npm install -g pm2
pm2 start npm --name "bagsscout" -- start
pm2 save
pm2 startup
```

---

## API Routes

| Route | Method | Description |
|---|---|---|
| `/api/analyze` | POST | Analyze a token by mint address |
| `/api/feed` | GET | Get live feed items + Claude insights |
| `/api/tokens` | GET | List recent Bags tokens by volume |

### Analyze endpoint

```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"mintAddress": "your_token_mint_address"}'
```

Response:
```json
{
  "token": { "name": "...", "symbol": "...", ... },
  "analysis": {
    "verdict": "STRONG",
    "score": 78,
    "summary": "...",
    "creatorScore": { "score": 32, "label": "Active Builder", "details": "..." },
    "holderScore": { "score": 22, "label": "Healthy", "details": "..." },
    "momentumScore": { "score": 24, "label": "Growing", "details": "..." },
    "flags": [...],
    "insights": [...]
  },
  "holders": [...],
  "recentTrades": [...]
}
```

---

## Bags Integration

BagsScout uses Bags deeply:

1. **Partner Key** — All tokens analyzed via BagsScout are tracked under your partner key. You earn 25% of fees from tokens launched through your platform.

2. **Fee Sharing Data** — The analyzer surfaces unclaimed fees, fee history, and creator claim activity — giving holders and creators actionable intelligence.

3. **Token Discovery** — The feed and token list are powered by the Bags token update authority onchain, so you only see genuine Bags tokens.

---

## Hackathon Notes

Built for the Bags Hackathon Q1 2026. Categories: **Bags API** + **AI Agents**.

Key differentiators:
- Claude synthesizes raw onchain data into human-readable intelligence
- Surfaces unclaimed fees — useful for both creators and speculators
- Zero-cost data sources (Bitquery free tier, GitHub API, Bags SDK)
