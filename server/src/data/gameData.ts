import { Avatar, Strategy, Scenario } from '@bvb/shared';

export const AVATARS: Avatar[] = [
    {
        id: 'ANALYST',
        name: 'The Analyst',
        description: 'Smart, calm, and calculated.',
        effectDescription: 'Minor boost to info visibility (Future Glimpse costs less)'
    },
    {
        id: 'DEGEN',
        name: 'The DeGen',
        description: 'YOLO trader looking for moonshots.',
        effectDescription: 'Higher upside volatility, but higher risk.'
    },
    {
        id: 'STRATEGIST',
        name: 'The Strategist',
        description: 'Long-term thinker, playing the long game.',
        effectDescription: 'Lower risk penalties on holding.'
    },
    {
        id: 'MEME_LORD',
        name: 'The Meme Lord',
        description: 'Chaotic, funny, and unpredictable.',
        effectDescription: 'Random bonus effects during events.'
    }
];

export const STRATEGIES: Strategy[] = [
    {
        id: 'HIGH_ROLLER',
        name: 'High Roller',
        bonusDescription: '+8% upside on growth assets',
        tooltip: 'Diamond hands or disaster — your choice.'
    },
    {
        id: 'SAFETY_FIRST',
        name: 'Safety First',
        bonusDescription: '–10% risk penalty',
        tooltip: 'Slow and steady can still win the race.'
    },
    {
        id: 'DIVERSIFIER',
        name: 'Diversifier',
        bonusDescription: '+5% return per unique asset',
        tooltip: 'Put eggs in 4 baskets, not 1.'
    },
    {
        id: 'SWING_TRADER',
        name: 'Swing Trader',
        bonusDescription: 'Faster cooldowns between actions',
        tooltip: 'Buy the dip, sell the rip.'
    }
];

export const SCENARIOS: Scenario[] = [
    {
        id: 'TECH_MOONSHOT',
        title: 'Tech Moonshot',
        description: 'Ultra bullish on Tech.',
        effectDescription: 'Tech stocks soar early. Only the patient will survive.'
    },
    {
        id: 'CRYPTO_WINTER',
        title: 'Crypto Winter',
        description: 'Scary & bearish for Crypto.',
        effectDescription: 'Crypto dumps at start. Fortunes reverse as fast as they rise.'
    },
    {
        id: 'RATE_SHOCKWAVE',
        title: 'Rate Shockwave',
        description: 'Fear in the market.',
        effectDescription: 'Bonds rise, stocks stumble. Diversify — or die trying.'
    },
    {
        id: 'GREEN_ENERGY_SURGE',
        title: 'Green Energy Surge',
        description: 'Optimistic for ETFs.',
        effectDescription: 'ETFs outperform. Follow the trend.'
    }
];
