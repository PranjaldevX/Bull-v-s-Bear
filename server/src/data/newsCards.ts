import { MarketEvent } from '@bvb/shared';

// Market behavior configuration
export const MARKET_CONFIG = {
    roundDurationSeconds: 35,
    newsDisplaySeconds: 5,
    tradeWindowSeconds: 30,
    // Time decay: how much of the price impact happens in each time window
    timeDecay: {
        early: 0.6,   // 0-10 seconds: 60% of impact
        mid: 0.3,     // 10-20 seconds: 30% of impact
        late: 0.1     // 20-30 seconds: 10% of impact (stabilization)
    },
    baseVolatility: {
        STOCK: 0.03,
        CRYPTO: 0.08,
        BOND: 0.01,
        ETF: 0.015
    }
};

// Sentiment multipliers for price impact
export const SENTIMENT_MULTIPLIER: Record<string, number> = {
    'very_positive': 1.8,
    'positive': 1.2,
    'neutral': 0,
    'negative': -1.2,
    'very_negative': -2.0
};

// How sensitive each sector is to news
export const SECTOR_SENSITIVITY: Record<string, number> = {
    'technology': 1.4,
    'finance': 1.2,
    'energy': 1.3,
    'crypto': 2.0,
    'bonds': 0.6,
    'gold': -0.8  // Gold often moves opposite to risk assets
};

// Map sectors to asset types
export const SECTOR_TO_ASSET_TYPE: Record<string, string[]> = {
    'technology': ['STOCK'],
    'finance': ['STOCK', 'ETF', 'BOND'],
    'energy': ['STOCK', 'ETF'],
    'crypto': ['CRYPTO'],
    'bonds': ['BOND'],
    'gold': ['ETF']  // Gold ETF
};

// Map sectors to specific asset IDs for more targeted impact
export const SECTOR_TO_ASSETS: Record<string, string[]> = {
    'technology': ['tcs', 'infy', 'it-bees'],
    'finance': ['hdfc', 'icici', 'sbi', 'bank-bees', 'us-treasury', 'corp-bond-aaa'],
    'energy': ['reliance', 'infra-bees', 'green-bond'],
    'crypto': ['sol', 'ltc', 'icp', 'etc', 'qnt', 'egld', 'doge', 'xvs', 'ethfi'],
    'bonds': ['us-treasury', 'corp-bond-aaa', 'muni-bond', 'junk-bond', 'green-bond', 'tips-bond'],
    'gold': ['gold-bees', 'sov-gold-bond']
};

export interface NewsCard {
    id: number;
    title: string;
    sentiment: 'very_positive' | 'positive' | 'neutral' | 'negative' | 'very_negative';
    affectedSectors: string[];
    durationRounds: number;
    description: string;
}

export const NEWS_CARDS: NewsCard[] = [
    {
        id: 1,
        title: "Central Bank Signals Rate Hike",
        sentiment: "very_negative",
        affectedSectors: ["finance", "technology"],
        durationRounds: 2,
        description: "Markets react sharply as central bank hints at aggressive tightening."
    },
    {
        id: 2,
        title: "Major Tech Firm Faces Data Lawsuit",
        sentiment: "negative",
        affectedSectors: ["technology"],
        durationRounds: 1,
        description: "Privacy concerns trigger sell-off in tech stocks."
    },
    {
        id: 3,
        title: "Geopolitical Tensions Escalate",
        sentiment: "negative",
        affectedSectors: ["energy", "finance"],
        durationRounds: 2,
        description: "Uncertainty fuels volatility across global markets."
    },
    {
        id: 4,
        title: "Crypto Exchange Freezes Withdrawals",
        sentiment: "very_negative",
        affectedSectors: ["crypto"],
        durationRounds: 2,
        description: "Panic selling hits digital assets."
    },
    {
        id: 5,
        title: "Banking Sector Liquidity Concerns",
        sentiment: "negative",
        affectedSectors: ["finance"],
        durationRounds: 2,
        description: "Rumors of liquidity stress unsettle investors."
    },
    {
        id: 6,
        title: "Central Bank Signals Rate Cuts",
        sentiment: "very_positive",
        affectedSectors: ["finance", "technology"],
        durationRounds: 2,
        description: "Markets rally as monetary easing looks likely."
    },
    {
        id: 7,
        title: "Tech Giant Reports Record Profits",
        sentiment: "positive",
        affectedSectors: ["technology"],
        durationRounds: 1,
        description: "Strong earnings boost investor confidence."
    },
    {
        id: 8,
        title: "AI Breakthrough Boosts Productivity",
        sentiment: "positive",
        affectedSectors: ["technology"],
        durationRounds: 2,
        description: "Optimism grows around AI-led growth."
    },
    {
        id: 9,
        title: "Government Announces Startup Tax Relief",
        sentiment: "positive",
        affectedSectors: ["technology", "finance"],
        durationRounds: 1,
        description: "Early-stage companies attract fresh capital."
    },
    {
        id: 10,
        title: "Institutional Investors Enter Crypto",
        sentiment: "very_positive",
        affectedSectors: ["crypto"],
        durationRounds: 2,
        description: "Crypto prices surge on strong inflows."
    },
    {
        id: 11,
        title: "Inflation Data Cools Down",
        sentiment: "positive",
        affectedSectors: ["finance"],
        durationRounds: 1,
        description: "Reduced inflation pressure supports equities."
    },
    {
        id: 12,
        title: "Trade Agreement Signed",
        sentiment: "positive",
        affectedSectors: ["energy", "finance"],
        durationRounds: 2,
        description: "Global trade outlook improves."
    },
    {
        id: 13,
        title: "Banking Stress Eases",
        sentiment: "positive",
        affectedSectors: ["finance"],
        durationRounds: 1,
        description: "Liquidity injections calm the markets."
    },
    {
        id: 14,
        title: "Energy Supply Stabilizes",
        sentiment: "neutral",
        affectedSectors: ["energy"],
        durationRounds: 1,
        description: "Oil prices remain range-bound."
    },
    {
        id: 15,
        title: "Manufacturing Data Beats Expectations",
        sentiment: "positive",
        affectedSectors: ["finance"],
        durationRounds: 1,
        description: "Economic optimism lifts market mood."
    },
    {
        id: 16,
        title: "Unexpected Market Volatility",
        sentiment: "negative",
        affectedSectors: ["technology", "finance"],
        durationRounds: 2,
        description: "Sharp swings shake investor confidence."
    },
    {
        id: 17,
        title: "Conflicting Economic Indicators",
        sentiment: "neutral",
        affectedSectors: ["finance"],
        durationRounds: 1,
        description: "Markets struggle to find direction."
    },
    {
        id: 18,
        title: "Sector Rotation Observed",
        sentiment: "neutral",
        affectedSectors: ["technology", "finance"],
        durationRounds: 1,
        description: "Capital shifts between sectors."
    },
    {
        id: 19,
        title: "Crypto Rallies Amid Stock Weakness",
        sentiment: "positive",
        affectedSectors: ["crypto"],
        durationRounds: 1,
        description: "Risk appetite shifts to digital assets."
    },
    {
        id: 20,
        title: "Earnings Season Creates Volatility",
        sentiment: "neutral",
        affectedSectors: ["technology", "finance"],
        durationRounds: 2,
        description: "Stock-specific moves dominate the market."
    },
    {
        id: 21,
        title: "Merger Rumors in Tech Sector",
        sentiment: "positive",
        affectedSectors: ["technology"],
        durationRounds: 1,
        description: "Speculation drives short-term rally."
    },
    {
        id: 22,
        title: "Hedge Funds Increase Short Positions",
        sentiment: "negative",
        affectedSectors: ["finance"],
        durationRounds: 2,
        description: "Bearish bets increase selling pressure."
    },
    {
        id: 23,
        title: "Whale Activity Detected in Crypto",
        sentiment: "neutral",
        affectedSectors: ["crypto"],
        durationRounds: 1,
        description: "Large transfers cause sharp intraday moves."
    },
    {
        id: 24,
        title: "New Policy Under Government Review",
        sentiment: "neutral",
        affectedSectors: ["finance"],
        durationRounds: 2,
        description: "Investors wait for clarity."
    },
    {
        id: 25,
        title: "AI Trading Volume Spikes",
        sentiment: "positive",
        affectedSectors: ["technology"],
        durationRounds: 1,
        description: "Algorithmic trading fuels momentum."
    },
    {
        id: 26,
        title: "Oil Supply Shock",
        sentiment: "very_negative",
        affectedSectors: ["energy"],
        durationRounds: 2,
        description: "Energy prices surge, markets react."
    },
    {
        id: 27,
        title: "Gold Attracts Safe-Haven Demand",
        sentiment: "positive",
        affectedSectors: ["gold"],
        durationRounds: 1,
        description: "Risk-off sentiment benefits gold."
    },
    {
        id: 28,
        title: "Bond Yields Rise Unexpectedly",
        sentiment: "negative",
        affectedSectors: ["bonds", "finance"],
        durationRounds: 2,
        description: "Equities face pressure from rising yields."
    },
    {
        id: 29,
        title: "Market Awaits Major Announcement",
        sentiment: "neutral",
        affectedSectors: ["finance"],
        durationRounds: 1,
        description: "Low volume, cautious trading."
    },
    {
        id: 30,
        title: "Speculative Bubble Concerns Grow",
        sentiment: "very_negative",
        affectedSectors: ["technology", "crypto"],
        durationRounds: 2,
        description: "Sharp corrections hit high-risk assets."
    }
];

// Helper to convert NewsCard to MarketEvent format
export function newsCardToMarketEvent(card: NewsCard): MarketEvent {
    const sentimentMap: Record<string, 'positive' | 'negative' | 'neutral'> = {
        'very_positive': 'positive',
        'positive': 'positive',
        'neutral': 'neutral',
        'negative': 'negative',
        'very_negative': 'negative'
    };

    const intensityMap: Record<string, 'low' | 'medium' | 'high'> = {
        'very_positive': 'high',
        'positive': 'medium',
        'neutral': 'low',
        'negative': 'medium',
        'very_negative': 'high'
    };

    const emojiMap: Record<string, string> = {
        'very_positive': '🚀📈',
        'positive': '📈💹',
        'neutral': '📊',
        'negative': '📉⚠️',
        'very_negative': '🔴📉'
    };

    return {
        id: `news-${card.id}`,
        title: card.title,
        description: card.description,
        affectedAssets: card.affectedSectors,
        sentiment: sentimentMap[card.sentiment],
        intensity: intensityMap[card.sentiment],
        tags: card.affectedSectors,
        impact: {}, // Will be calculated dynamically
        duration: card.durationRounds,
        hint: getHintForSentiment(card.sentiment),
        emoji: emojiMap[card.sentiment],
        emotion: card.sentiment,
        sectors: card.affectedSectors,
        momentum_rounds: card.durationRounds,
        volatility_multiplier: card.sentiment.includes('very') ? 1.5 : 1.2
    };
}

function getHintForSentiment(sentiment: string): string {
    switch (sentiment) {
        case 'very_positive': return '🔥 Strong momentum! Consider riding the wave.';
        case 'positive': return '💡 Positive outlook. Good entry opportunity.';
        case 'neutral': return '⚖️ Mixed signals. Trade with caution.';
        case 'negative': return '⚠️ Bearish pressure. Consider hedging.';
        case 'very_negative': return '🚨 High risk! Protect your portfolio.';
        default: return 'Stay alert to market movements.';
    }
}

// Get a random news card
export function getRandomNewsCard(): NewsCard {
    return NEWS_CARDS[Math.floor(Math.random() * NEWS_CARDS.length)];
}
