# 🎮 Bull vs Bear - Financial Trading Game

A real-time multiplayer trading simulation game that teaches financial literacy through engaging gameplay. Players trade stocks, crypto, bonds, and ETFs while reacting to dynamic news events in a competitive environment.

![Game Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Game Logic](#game-logic)
- [Installation](#installation)
- [Configuration](#configuration)
- [How to Play](#how-to-play)
- [AI Analysis System](#ai-analysis-system)
- [Price Manipulation Formula](#price-manipulation-formula)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

Bull vs Bear is an educational trading game that simulates real market dynamics. Players compete to achieve the highest risk-adjusted returns by trading various assets while responding to breaking news events. The game features realistic price movements, AI-powered performance analysis, and multiplayer competition.

### 🎓 Educational Goals

- Teach news-driven trading strategies
- Demonstrate sector correlations and diversification
- Illustrate time decay of news impact
- Show risk vs. reward trade-offs
- Introduce different asset classes (stocks, crypto, bonds, ETFs)

## ✨ Key Features

### 🎮 Core Gameplay

- **Real-time Multiplayer**: Compete with other players in live trading sessions
- **5 Trading Rounds**: Each round lasts 35 seconds with dynamic price movements
- **News-Driven Markets**: Breaking news appears for 5 seconds at the start of each round
- **30-Second Trading Window**: Make buy/sell decisions after news is revealed
- **Multiple Asset Classes**: Trade stocks, cryptocurrencies, bonds, and ETFs
- **Risk Management**: Monitor your portfolio risk score in real-time
- **Power-Ups**: Use strategic power-ups (Risk Shield, Bailout)

### 📰 News System

- **Dynamic News Cards**: 30+ unique news events affecting different sectors
- **5-Second News Display**: News appears at the start of each round
- **Sector-Specific Impact**: News affects technology, finance, energy, crypto, bonds, and gold
- **Sentiment Analysis**: Very positive, positive, neutral, negative, very negative
- **Time Decay**: News impact fades over the 30-second trading window
  - 0-10 seconds: 100% impact
  - 10-20 seconds: 60% impact
  - 20-30 seconds: 30% impact

### 💹 Realistic Price Movement

Prices follow a realistic financial formula:

```
P_new = P_old × (1 + r_base + α × S + ε)
```

Where:
- **r_base**: Market drift (natural growth/decay)
- **α**: Volatility factor (impact weight)
- **S**: Sentiment score (from news)
- **ε**: Random noise (Gaussian distribution)

### 🤖 AI-Powered Analysis

- **Personalized Feedback**: Google Gemini AI analyzes your trading performance
- **Specific Examples**: References your actual trades and timing
- **Pattern Detection**: Identifies your trading style automatically
- **Learning Cards**: Educational content based on your performance
- **Intelligent Fallback**: Works without AI using heuristic analysis

### 🎨 Pre-Match Experience

1. **Intro Screen** (3 seconds): Welcome message
2. **Avatar Selection** (15 seconds): Choose your trading persona
3. **Strategy Selection** (15 seconds): Pick your trading strategy
4. **Scenario + Tutorial** (8 seconds): Market forecast and trading tips displayed side-by-side

### 🏆 Competitive Features

- **Risk-Adjusted Scoring**: ROI minus risk penalty
- **Real-time Leaderboard**: See rankings as the game progresses
- **Strategy Bonuses**: Diversifier gets 5% bonus for 4+ assets
- **Transaction History**: Complete log of all trades
- **Performance Insights**: Detailed post-game analysis

## 🛠️ Tech Stack

### Frontend

| Technology | Purpose | Version |
|------------|---------|---------|
| **React** | UI framework | 18.3.1 |
| **TypeScript** | Type safety | 5.6.2 |
| **Vite** | Build tool & dev server | 5.4.21 |
| **Tailwind CSS** | Styling | 3.4.17 |
| **Zustand** | State management | 5.0.2 |
| **Socket.IO Client** | Real-time communication | 4.8.1 |
| **Recharts** | Price charts | 2.15.0 |

### Backend

| Technology | Purpose | Version |
|------------|---------|---------|
| **Node.js** | Runtime environment | ≥18.0.0 |
| **TypeScript** | Type safety | 5.7.3 |
| **Express** | Web framework | 4.21.2 |
| **Socket.IO** | WebSocket server | 4.8.1 |
| **Google Gemini AI** | Performance analysis | Latest |
| **dotenv** | Environment variables | 17.2.3 |

### Development Tools

- **ts-node**: TypeScript execution
- **nodemon**: Auto-restart on changes
- **PostCSS**: CSS processing
- **ESLint**: Code linting

## 🎲 Game Logic

### Round Structure (35 seconds total)

```
┌─────────────────────────────────────────────────────────────┐
│  ROUND TIMELINE (35 seconds)                                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  [0-5s]  NEWS PHASE                                         │
│  ┌────────────────────────────────────────────────┐        │
│  │  📰 Breaking News Displayed                     │        │
│  │  "Tech Giant Reports Record Profits"            │        │
│  │  Sentiment: Positive                            │        │
│  │  Affected: Technology sector                    │        │
│  └────────────────────────────────────────────────┘        │
│                                                              │
│  [5-35s] TRADING PHASE (30 seconds)                        │
│  ┌────────────────────────────────────────────────┐        │
│  │  💹 Prices Update Every Second                  │        │
│  │  🛒 Players Buy/Sell Assets                     │        │
│  │  📊 Risk Scores Calculated                      │        │
│  │  ⏱️  News Impact Decays Over Time               │        │
│  └────────────────────────────────────────────────┘        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### News Phase (First 5 Seconds)

1. **News Card Appears**: Full-screen news display
2. **Information Shown**:
   - News title and description
   - Sentiment indicator (emoji + color)
   - Affected sectors
   - Market hint
3. **Player Actions**: Read and strategize (no trading yet)
4. **Price Impact**: Sentiment scores updated immediately

### Trading Phase (Next 30 Seconds)

1. **Prices Update**: Every second based on the formula
2. **Time Decay Active**: News impact fades gradually
   - Seconds 5-15: 100% impact
   - Seconds 15-25: 60% impact
   - Seconds 25-35: 30% impact
3. **Player Actions**: Buy and sell assets
4. **Risk Calculation**: Updated after each trade
5. **Slippage**: Large orders (>$1000) incur price slippage

### Price Update Mechanism

Every second during trading phase:

```typescript
// 1. Calculate sentiment score based on news
S = baseSentiment × sectorWeight × timeDecay

// 2. Apply realistic formula
priceChange = marketDrift + (volatilityFactor × S) + randomNoise

// 3. Update price
newPrice = currentPrice × (1 + priceChange)

// 4. Apply safety rails (±25% max per round)
finalPrice = clamp(newPrice, minPrice, maxPrice)
```

### Sector Correlations

News affects related sectors:

| Primary Sector | Correlated Sectors | Correlation |
|----------------|-------------------|-------------|
| Technology | Finance | +0.3 |
| Technology | Crypto | +0.2 |
| Finance | Bonds | +0.4 |
| Finance | Energy | +0.2 |
| Bonds | Gold | -0.3 (inverse) |
| Gold | Finance | -0.2 (inverse) |

### Asset Types & Characteristics

| Asset Type | Volatility | Market Drift | Noise Range | Example Assets |
|------------|-----------|--------------|-------------|----------------|
| **STOCK** | 4% | +0.15%/sec | ±0.8% | TCS, HDFC, Reliance |
| **CRYPTO** | 8% | +0.05%/sec | ±1.5% | SOL, LTC, DOGE |
| **BOND** | 2% | +0.02%/sec | ±0.3% | US Treasury, Corp Bonds |
| **ETF** | 3% | +0.12%/sec | ±0.6% | Nifty 50, Gold ETF |

### Risk Calculation

```typescript
riskScore = Σ(assetValue × volatilityFactor) / totalPortfolioValue × 100

// Strategy modifiers:
if (strategy === 'SAFETY_FIRST') {
    riskScore -= 10
}

// Capped at 0-100
finalRiskScore = clamp(riskScore, 0, 100)
```

### Scoring System

```typescript
// Final value calculation
finalValue = cash + Σ(holdings × currentPrice)

// Strategy bonuses
if (strategy === 'DIVERSIFIER' && uniqueAssets >= 4) {
    finalValue += finalValue × 0.05 // 5% bonus
}

// ROI calculation
ROI = ((finalValue - startingCash) / startingCash) × 100

// Risk-adjusted score (determines winner)
score = ROI - (riskScore × 0.5)
```

### Game Phases

```
PRE_MATCH
├── INTRO (3s)
├── AVATAR_SELECTION (15s)
├── STRATEGY_SELECTION (15s)
└── SCENARIO_TEASER (8s) ← Merged with tutorial

PLAYING
├── Round 1 (35s)
├── Round 2 (35s)
├── Round 3 (35s)
├── Round 4 (35s)
└── Round 5 (35s) ← Fear Zone active

FINISHED
└── Results & AI Analysis
```

## 🚀 Installation

### Prerequisites

- Node.js ≥18.0.0
- npm or yarn
- Git

### Clone Repository

```bash
git clone https://github.com/yourusername/bull-vs-bear.git
cd bull-vs-bear
```

### Install Dependencies

```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

## ⚙️ Configuration

### Server Configuration

Create `server/.env` file:

```env
# Server Port
PORT=3000

# Environment
NODE_ENV=development

# Google Gemini AI (Optional - for AI analysis)
GEMINI_API_KEY=your_gemini_api_key_here

# CORS Settings
CORS_ORIGIN=http://localhost:5173
```

### Client Configuration

Create `client/.env` file:

```env
# API URL
VITE_API_URL=http://localhost:3000

# WebSocket URL
VITE_WS_URL=http://localhost:3000
```

### Get Gemini API Key (Optional)

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add to `server/.env` as `GEMINI_API_KEY`

**Note**: The game works without Gemini AI using intelligent fallback analysis.

## 🎮 How to Play

### Start the Game

```bash
# Terminal 1 - Start server
cd server
npm run dev

# Terminal 2 - Start client
cd client
npm run dev
```

Open browser: http://localhost:5173/

### Gameplay Steps

1. **Join Game**
   - Enter your name
   - Wait for other players (or play solo)

2. **Pre-Match Setup**
   - Choose your avatar (trader persona)
   - Select trading strategy:
     - **Momentum Trader**: Ride the trends
     - **Diversifier**: Spread investments (5% bonus for 4+ assets)
     - **Safety First**: Lower risk (-10 risk score)
   - Read market forecast and tips

3. **Trading Rounds** (5 rounds × 35 seconds)
   
   **News Phase (0-5 seconds)**:
   - 📰 Read breaking news carefully
   - Note affected sectors
   - Plan your trades
   
   **Trading Phase (5-35 seconds)**:
   - 🛒 Buy assets you think will rise
   - 💰 Sell assets you think will fall
   - 📊 Monitor your risk score
   - ⏱️ Act fast - news impact fades!

4. **Trading Tips**
   - **React to news**: Buy affected sectors on positive news
   - **Time decay**: Trade early for maximum impact
   - **Diversify**: Don't put all money in one asset
   - **Sector correlations**: Tech news affects finance too
   - **Risk management**: High risk = lower final score
   - **Slippage**: Large orders (>$1000) cost more

5. **Game End**
   - View final rankings
   - Read AI analysis of your performance
   - See what you did well and mistakes made
   - Learn from educational cards
   - Play again to improve!

### Controls

| Action | Method |
|--------|--------|
| Buy Asset | Click asset card → Enter amount → Buy |
| Sell Asset | Click asset card → Enter amount → Sell |
| Use Power-Up | Click power-up icon |
| View Holdings | Check portfolio panel |
| Monitor Risk | Watch risk meter |

## 🤖 AI Analysis System

### How It Works

1. **Data Collection**: Tracks every trade, news event, and market condition
2. **Context Building**: Maps trades to news events and identifies patterns
3. **AI Analysis**: Gemini AI generates personalized feedback
4. **Fallback System**: Intelligent heuristics if AI unavailable

### Pattern Detection

The system automatically identifies:

- **News Reactivity**: How often you trade during news events
- **Diversification**: Number of different assets traded
- **Asset Preference**: Which asset types you favor
- **Trading Style**: Aggressive buyer vs profit taker
- **Timing**: Early mover vs late trader

### Example Feedback

```
✅ What You Did Well:
• You reacted quickly to positive tech news in Round 1 by buying TCS at $42
• You diversified across 6 different assets (stocks, crypto, bonds)
• You cut losses on SOL after crypto hack news in Round 2

❌ Mistakes & Opportunities:
• You missed the opportunity to buy bonds during rate cut news in Round 3
• You held crypto too long after negative news - sold at $170 vs bought at $185
• You ignored the finance sector rally in Round 4

💡 Suggestions:
• React to negative news by selling affected assets within 10 seconds
• Use sector correlations - tech news affects finance stocks too (0.3 correlation)
• Consider time decay - news impact fades after 20 seconds
```

## 📐 Price Manipulation Formula

### Core Formula

```
P_new = P_old × (1 + r_base + α × S + ε)
```

### Components

#### 1. Market Drift (r_base)
Natural growth/decay independent of news:
- STOCK: +0.15% per second (~8% annually)
- CRYPTO: +0.05% per second (~2.5% annually)
- BOND: +0.02% per second (~1% annually)
- ETF: +0.12% per second (~6% annually)

#### 2. Volatility Factor (α)
Impact weight of news:
- STOCK: 4%
- CRYPTO: 8%
- BOND: 2%
- ETF: 3%

#### 3. Sentiment Score (S)
Normalized score from -1 to +1:
- Very Positive: +1.0
- Positive: +0.5
- Neutral: 0.0
- Negative: -0.5
- Very Negative: -1.0

Modified by:
- Sector weight (1.0 for direct, 0.5× correlation for indirect)
- Time decay (100% → 60% → 30%)

#### 4. Random Noise (ε)
Gaussian distribution:
- STOCK: ±0.8%
- CRYPTO: ±1.5%
- BOND: ±0.3%
- ETF: ±0.6%

### Safety Rails

- Maximum movement: ±25% per round
- Minimum price: $0.01
- Slippage on large orders: 0.5-2%

## 📁 Project Structure

```
bull-vs-bear/
├── client/                      # Frontend React app
│   ├── src/
│   │   ├── components/
│   │   │   ├── PreMatch/       # Pre-game screens
│   │   │   │   ├── Intro.tsx
│   │   │   │   ├── AvatarSelection.tsx
│   │   │   │   ├── StrategySelection.tsx
│   │   │   │   └── ScenarioTeaser.tsx  # Merged with tutorial
│   │   │   ├── EventCard.tsx   # News display
│   │   │   ├── GameDashboard.tsx
│   │   │   ├── LandingPage.tsx
│   │   │   ├── Lobby.tsx
│   │   │   ├── PowerUpBar.tsx
│   │   │   └── RiskMeter.tsx
│   │   ├── data/
│   │   │   ├── financialTerms.ts
│   │   │   └── gameData.ts     # Avatars, strategies, scenarios
│   │   ├── store/
│   │   │   └── gameStore.ts    # Zustand state management
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
│
├── server/                      # Backend Node.js app
│   ├── src/
│   │   ├── data/
│   │   │   ├── assets.ts       # Asset definitions
│   │   │   ├── events.ts       # Market events
│   │   │   ├── gameData.ts     # Game configuration
│   │   │   └── newsCards.ts    # 30+ news cards
│   │   ├── GameManager.ts      # Core game logic
│   │   └── index.ts            # Server entry point
│   ├── package.json
│   └── tsconfig.json
│
├── shared/                      # Shared types
│   ├── index.ts                # TypeScript interfaces
│   └── package.json
│
├── docs/                        # Documentation
│   ├── AI_ANALYSIS.md          # AI system docs
│   ├── AI_BOT_FLOW.md          # Data flow diagrams
│   ├── AI_BOT_SUMMARY.md       # Implementation summary
│   ├── PRICE_FORMULA.md        # Price formula details
│   ├── PRICE_CHANGES_SUMMARY.md
│   ├── MERGED_PAGES.md         # UI merge documentation
│   ├── AI_SYSTEM.md
│   ├── HOW_TO_PLAY.md
│   ├── SETUP.md
│   └── TECH.md
│
├── README.md                    # This file
├── package.json                 # Root package
└── .gitignore
```

## 📡 API Documentation

### WebSocket Events

#### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `joinGame` | `{ name: string }` | Join game lobby |
| `selectAvatar` | `{ avatarId: string }` | Choose avatar |
| `selectStrategy` | `{ strategyId: string }` | Choose strategy |
| `buy` | `{ assetId: string, amount: number }` | Buy asset |
| `sell` | `{ assetId: string, amount: number }` | Sell asset |
| `usePowerUp` | `{ powerUpId: string }` | Activate power-up |
| `playAgain` | `{}` | Restart game |

#### Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `gameState` | `GameState` | Full game state update |
| `gameOver` | `Results[]` | Game end with rankings |
| `error` | `{ message: string }` | Error notification |

### Game State Interface

```typescript
interface GameState {
    id: string;
    players: PlayerState[];
    assets: Asset[];
    currentRound: number;
    maxRounds: number;
    activeEvent: MarketEvent | null;  // Current news
    phase: 'PRE_MATCH' | 'PLAYING' | 'FINISHED';
    subPhase: PreMatchSubPhase;
    timeRemaining: number;
    activeAssetType: AssetType | 'ALL';
    activeScenario: Scenario | null;
    fearZoneActive: boolean;
    sentiment: Record<AssetType, number>;
}
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write meaningful commit messages
- Add comments for complex logic
- Test thoroughly before submitting
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Google Gemini AI for intelligent analysis
- Socket.IO for real-time communication
- React and TypeScript communities
- All contributors and testers

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/bull-vs-bear/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/bull-vs-bear/discussions)
- **Email**: support@bullvsbear.com

## 🗺️ Roadmap

- [ ] Mobile responsive design
- [ ] Historical game tracking
- [ ] Tournament mode
- [ ] More asset types (commodities, forex)
- [ ] Real-time hints from AI
- [ ] Voice feedback
- [ ] Replay system with commentary
- [ ] Leaderboards across games
- [ ] Custom scenarios
- [ ] Educational mode with tutorials

---

**Made with ❤️ for financial education**

*Start trading, learn markets, beat the competition!*
