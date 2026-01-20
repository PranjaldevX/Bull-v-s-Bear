import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

import { Server } from 'socket.io';
import { GameState, PlayerState, ClientToServerEvents, ServerToClientEvents, AvatarId, StrategyId, GamePhase, PreMatchSubPhase, Scenario, AssetType } from '@bvb/shared';
import { INITIAL_ASSETS } from './data/assets';
import { AVATARS, STRATEGIES, SCENARIOS } from './data/gameData';
import { NEWS_CARDS, NewsCard, newsCardToMarketEvent, getRandomNewsCard, SECTOR_TO_ASSETS } from './data/newsCards';

const GAME_ROUNDS = 5;
const ROUND_DURATION_MS = 35000;
const TOTAL_FRAMES = 35;
const STARTING_CASH = 10000;
const NEWS_PHASE_SECONDS = 5;
const SHOCK_WINDOW_SECONDS = 7; // First 7 seconds of trading = shock window

// ==================== REALISTIC PRICE FORMULA PARAMETERS ====================
// Formula: P_new = P_old × (1 + r_base + α × S + ε)
// Where:
//   r_base = Market Drift (natural growth/decay)
//   S = Sentiment Score (from news)
//   α = Volatility Factor (impact weight of news)
//   ε = Random Noise (market unpredictability)

const MARKET_DRIFT: Record<string, number> = {
    'STOCK': 0.0015,    // +0.15% per second natural growth
    'CRYPTO': 0.0005,   // +0.05% per second (more volatile, less predictable trend)
    'BOND': 0.0002,     // +0.02% per second (stable)
    'ETF': 0.0012       // +0.12% per second
};

const VOLATILITY_FACTOR: Record<string, number> = {
    'STOCK': 0.04,      // 4% impact weight
    'CRYPTO': 0.08,     // 8% impact weight (more sensitive to news)
    'BOND': 0.02,       // 2% impact weight (less sensitive)
    'ETF': 0.03         // 3% impact weight
};

const RANDOM_NOISE_RANGE: Record<string, number> = {
    'STOCK': 0.008,     // ±0.8% random noise
    'CRYPTO': 0.015,    // ±1.5% random noise
    'BOND': 0.003,      // ±0.3% random noise
    'ETF': 0.006        // ±0.6% random noise
};

// ==================== SENTIMENT SCORE MAPPING ====================
// Maps news sentiment to normalized score (-1 to +1)
const SENTIMENT_SCORE: Record<string, number> = {
    'very_positive': 1.0,
    'positive': 0.5,
    'neutral': 0.0,
    'negative': -0.5,
    'very_negative': -1.0
};

// ==================== SECTOR IMPACT WEIGHTS ====================
// How much a sector is affected by sector-specific news
const SECTOR_IMPACT_WEIGHT: Record<string, number> = {
    'technology': 1.0,      // Full impact
    'finance': 1.0,
    'energy': 1.0,
    'crypto': 1.0,
    'bonds': 1.0,
    'gold': 1.0
};

// Indirect impact: related sectors get partial impact
const SECTOR_CORRELATION: Record<string, Record<string, number>> = {
    'technology': { 'finance': 0.3, 'crypto': 0.2 },
    'finance': { 'technology': 0.3, 'bonds': 0.4, 'energy': 0.2 },
    'energy': { 'finance': 0.2 },
    'crypto': { 'technology': 0.2 },
    'bonds': { 'finance': 0.4, 'gold': -0.3 },
    'gold': { 'bonds': -0.3, 'finance': -0.2 }
};

// ==================== SAFETY RAILS ====================
const MAX_ROUND_MOVE_PERCENT = 0.25;   // Max ±25% per round
const MIN_PRICE_THRESHOLD = 0.01;      // Minimum price to prevent zero/negative

export class GameManager {
    private io: Server<ClientToServerEvents, ServerToClientEvents, any, any>;
    private gameState: GameState;
    private roundTimer: NodeJS.Timeout | null = null;
    private preMatchTimer: NodeJS.Timeout | null = null;
    private genAI: GoogleGenerativeAI | null = null;
    private model: any = null;
    private currentPhaseNext: (() => void) | null = null;
    
    // Track current news card
    private currentNewsCard: NewsCard | null = null;
    // Track base prices at round start
    private roundStartPrices: Map<string, number> = new Map();
    // Track last round's sentiment for chaos prevention
    private lastRoundSentiment: string = 'neutral';
    private consecutiveSameSentiment: number = 0;
    // Track news cards for each round for AI analysis
    private roundNewsHistory: Array<{ round: number; newsCard: NewsCard; timestamp: number }> = [];

    constructor(io: Server) {
        this.io = io;
        this.gameState = this.createInitialState();

        const apiKey = process.env.GEMINI_API_KEY;
        if (apiKey) {
            this.genAI = new GoogleGenerativeAI(apiKey);
            this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        }
    }

    private createInitialState(): GameState {
        return {
            id: 'game-1',
            players: [],
            assets: JSON.parse(JSON.stringify(INITIAL_ASSETS)),
            currentRound: 0,
            maxRounds: GAME_ROUNDS,
            activeEvent: null,
            phase: 'PRE_MATCH',
            subPhase: 'INTRO',
            timeRemaining: 0,
            activeAssetType: 'ALL',
            activeScenario: null,
            fearZoneActive: false,
            sentiment: { 'STOCK': 0, 'CRYPTO': 0, 'BOND': 0, 'ETF': 0 }
        };
    }

    // ==================== PLAYER MANAGEMENT ====================

    public addPlayer(socketId: string, name: string) {
        console.log(`Adding player: ${name} (${socketId})`);
        const existingPlayerIndex = this.gameState.players.findIndex(p => p.name === name);

        if (existingPlayerIndex !== -1) {
            this.gameState.players[existingPlayerIndex].id = socketId;
        } else {
            const newPlayer: PlayerState = {
                id: socketId,
                name,
                cash: STARTING_CASH,
                holdings: [],
                riskScore: 0,
                powerUps: [
                    { id: 'future-glimpse', name: 'Risk Shield', description: '-20 Risk Score', usesLeft: 1 },
                    { id: 'market-freeze', name: 'Bailout', description: '+$1000 Cash', usesLeft: 1 }
                ],
                totalValue: STARTING_CASH,
                ready: false,
                transactionLog: []
            };
            this.gameState.players.push(newPlayer);
        }
        this.broadcastState();
    }

    public removePlayer(socketId: string) {
        this.gameState.players = this.gameState.players.filter(p => p.id !== socketId);
        this.broadcastState();
        if (this.gameState.players.length === 0) {
            this.resetGame();
        }
    }

    // ==================== PRE-MATCH FLOW ====================

    public startPreMatch() {
        if (this.gameState.phase !== 'PRE_MATCH') return;
        console.log('Starting Pre-Match...');

        this.runSubPhase('INTRO', 3, () => {
            this.runSubPhase('AVATAR_SELECTION', 15, () => {
                this.runSubPhase('STRATEGY_SELECTION', 15, () => {
                    this.gameState.activeScenario = SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)];
                    // Merged SCENARIO_TEASER with TUTORIAL - extended to 8 seconds
                    this.runSubPhase('SCENARIO_TEASER', 8, () => {
                        this.startGame();
                    });
                });
            });
        });
    }

    private runSubPhase(subPhase: PreMatchSubPhase, durationSeconds: number, next: () => void) {
        console.log(`Running SubPhase: ${subPhase}`);
        this.gameState.subPhase = subPhase;
        this.gameState.timeRemaining = durationSeconds;
        this.broadcastState();
        this.currentPhaseNext = next;

        let timeLeft = durationSeconds;
        if (this.preMatchTimer) clearInterval(this.preMatchTimer);

        this.preMatchTimer = setInterval(() => {
            timeLeft--;
            this.gameState.timeRemaining = timeLeft;
            this.broadcastState();
            if (timeLeft <= 0) this.advancePhase();
        }, 1000);
    }

    private advancePhase() {
        if (this.preMatchTimer) clearInterval(this.preMatchTimer);
        this.preMatchTimer = null;
        if (this.currentPhaseNext) {
            const next = this.currentPhaseNext;
            this.currentPhaseNext = null;
            next();
        }
    }

    private checkAllReady() {
        if (this.gameState.players.length === 0) return;
        let allReady = false;
        if (this.gameState.subPhase === 'AVATAR_SELECTION') {
            allReady = this.gameState.players.every(p => p.avatarId);
        } else if (this.gameState.subPhase === 'STRATEGY_SELECTION') {
            allReady = this.gameState.players.every(p => p.strategyId);
        }
        if (allReady) this.advancePhase();
    }

    public handleSelectAvatar(socketId: string, avatarId: AvatarId) {
        const player = this.gameState.players.find(p => p.id === socketId);
        if (player && this.gameState.subPhase === 'AVATAR_SELECTION') {
            player.avatarId = avatarId;
            this.checkAllReady();
            this.broadcastState();
        }
    }

    public handleSelectStrategy(socketId: string, strategyId: StrategyId) {
        const player = this.gameState.players.find(p => p.id === socketId);
        if (player && this.gameState.subPhase === 'STRATEGY_SELECTION') {
            player.strategyId = strategyId;
            this.checkAllReady();
            this.broadcastState();
        }
    }

    // ==================== GAME FLOW ====================

    public startGame() {
        console.log('Starting Game!');
        this.gameState.phase = 'PLAYING';
        this.gameState.currentRound = 1;
        this.gameState.fearZoneActive = false;
        this.startRound();
    }

    private startRound() {
        if (this.gameState.currentRound > this.gameState.maxRounds) {
            this.endGame();
            return;
        }

        console.log(`\n========== ROUND ${this.gameState.currentRound} ==========`);

        // Fear Zone in Final Round
        if (this.gameState.currentRound === this.gameState.maxRounds) {
            this.gameState.fearZoneActive = true;
        }

        // Store base prices for this round (for safety rails)
        this.roundStartPrices.clear();
        this.gameState.assets.forEach(asset => {
            this.roundStartPrices.set(asset.id, asset.currentPrice);
        });

        // Generate news card for this round
        this.currentNewsCard = getRandomNewsCard();
        this.gameState.activeEvent = newsCardToMarketEvent(this.currentNewsCard);
        
        // Track news card for AI analysis
        this.roundNewsHistory.push({
            round: this.gameState.currentRound,
            newsCard: this.currentNewsCard,
            timestamp: Date.now()
        });
        
        // Track consecutive same sentiment for chaos prevention
        const currentSentimentType = this.currentNewsCard.sentiment.includes('positive') ? 'positive' : 
                                     this.currentNewsCard.sentiment.includes('negative') ? 'negative' : 'neutral';
        if (currentSentimentType === this.lastRoundSentiment) {
            this.consecutiveSameSentiment++;
        } else {
            this.consecutiveSameSentiment = 0;
        }
        this.lastRoundSentiment = currentSentimentType;
        
        console.log(`📰 NEWS: ${this.currentNewsCard.title}`);
        console.log(`   Sentiment: ${this.currentNewsCard.sentiment} (consecutive: ${this.consecutiveSameSentiment})`);
        console.log(`   Sectors: ${this.currentNewsCard.affectedSectors.join(', ')}`);

        // Apply immediate sentiment change
        this.applySentimentFromNews(this.currentNewsCard);
        
        // Apply sector rotation (unaffected sectors get small positive drift)
        this.applySectorRotation(this.currentNewsCard);

        // Reset timer
        this.gameState.timeRemaining = TOTAL_FRAMES;
        this.broadcastState();

        let currentFrame = 0;

        this.roundTimer = setInterval(() => {
            currentFrame++;
            this.gameState.timeRemaining = Math.max(0, TOTAL_FRAMES - currentFrame);

            const tradingSecondsElapsed = Math.max(0, currentFrame - NEWS_PHASE_SECONDS);
            
            if (currentFrame > NEWS_PHASE_SECONDS) {
                // Trading phase - update prices
                this.updatePricesGameMode(tradingSecondsElapsed);
            }

            this.calculatePlayerValues();
            this.calculateRisk();
            this.broadcastState();

            if (currentFrame >= TOTAL_FRAMES) {
                if (this.roundTimer) clearInterval(this.roundTimer);

                if (this.gameState.currentRound < this.gameState.maxRounds) {
                    this.gameState.currentRound++;
                    this.startRound();
                } else {
                    this.endGame();
                }
            }
        }, 1000);
    }


    // ==================== REALISTIC PRICE MOVEMENT ====================
    // Formula: P_new = P_old × (1 + r_base + α × S + ε)

    private updatePricesGameMode(tradingSecondsElapsed: number) {
        const tradingWindowTotal = TOTAL_FRAMES - NEWS_PHASE_SECONDS; // 30 seconds

        this.gameState.assets.forEach(asset => {
            const basePrice = this.roundStartPrices.get(asset.id) || asset.currentPrice;
            
            // 1. MARKET DRIFT (r_base): Natural growth/decay
            const r_base = MARKET_DRIFT[asset.type] || 0.001;
            
            // 2. SENTIMENT SCORE (S): Calculate based on news impact
            const S = this.calculateSentimentScore(asset, tradingSecondsElapsed, tradingWindowTotal);
            
            // 3. VOLATILITY FACTOR (α): Impact weight of news
            const alpha = VOLATILITY_FACTOR[asset.type] || 0.03;
            
            // 4. RANDOM NOISE (ε): Market unpredictability (Gaussian-like)
            const epsilon = this.generateRandomNoise(asset.type);
            
            // 5. APPLY FORMULA: P_new = P_old × (1 + r_base + α × S + ε)
            const priceChange = r_base + (alpha * S) + epsilon;
            let newPrice = asset.currentPrice * (1 + priceChange);
            
            // 6. SAFETY RAILS - Prevent extreme moves
            const maxPrice = basePrice * (1 + MAX_ROUND_MOVE_PERCENT);
            const minPrice = basePrice * (1 - MAX_ROUND_MOVE_PERCENT);
            newPrice = Math.max(minPrice, Math.min(maxPrice, newPrice));
            
            // 7. MINIMUM PRICE THRESHOLD
            newPrice = Math.max(MIN_PRICE_THRESHOLD, newPrice);
            
            asset.currentPrice = newPrice;
            asset.history.push(newPrice);
            if (asset.history.length > 50) asset.history.shift();
        });
    }

    // Calculate Sentiment Score (S) with sector-specific weighting
    private calculateSentimentScore(asset: any, tradingSecondsElapsed: number, tradingWindowTotal: number): number {
        if (!this.currentNewsCard) return 0;

        const news = this.currentNewsCard;
        const assetSector = this.getAssetSector(asset);
        
        // Base sentiment value (-1 to +1)
        const baseSentiment = SENTIMENT_SCORE[news.sentiment] || 0;
        
        // Check if asset's sector is directly affected
        let impactWeight = 0;
        
        if (news.affectedSectors.includes(assetSector)) {
            // Direct impact: full weight
            impactWeight = SECTOR_IMPACT_WEIGHT[assetSector] || 1.0;
        } else {
            // Indirect impact: check correlations
            for (const affectedSector of news.affectedSectors) {
                const correlation = SECTOR_CORRELATION[affectedSector]?.[assetSector] || 0;
                impactWeight += correlation * 0.5; // Indirect impact is 50% of correlation
            }
        }
        
        // Time decay: impact diminishes over time
        // Early phase (0-10s): 100% impact
        // Mid phase (10-20s): 60% impact
        // Late phase (20-30s): 30% impact
        let timeDecay = 1.0;
        if (tradingSecondsElapsed > 20) {
            timeDecay = 0.3;
        } else if (tradingSecondsElapsed > 10) {
            timeDecay = 0.6;
        }
        
        // Final sentiment score: S = baseSentiment × impactWeight × timeDecay
        return baseSentiment * impactWeight * timeDecay;
    }

    // Generate random noise (ε) with Gaussian-like distribution
    private generateRandomNoise(assetType: string): number {
        const range = RANDOM_NOISE_RANGE[assetType] || 0.005;
        
        // Box-Muller transform for Gaussian distribution
        const u1 = Math.random();
        const u2 = Math.random();
        const gaussian = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
        
        // Scale to desired range (±range)
        return gaussian * (range / 3); // Divide by 3 so ~99.7% of values are within ±range
    }

    private getAssetSector(asset: any): string {
        // Map asset IDs to sectors
        const techAssets = ['tcs', 'infy', 'it-bees'];
        const financeAssets = ['hdfc', 'icici', 'sbi', 'bank-bees', 'us-treasury', 'corp-bond-aaa', 'muni-bond', 'junk-bond', 'tips-bond'];
        const energyAssets = ['reliance', 'infra-bees', 'green-bond'];
        const cryptoAssets = ['sol', 'ltc', 'icp', 'etc', 'qnt', 'egld', 'doge', 'xvs', 'ethfi'];
        const goldAssets = ['gold-bees', 'sov-gold-bond'];

        if (techAssets.includes(asset.id)) return 'technology';
        if (financeAssets.includes(asset.id)) return 'finance';
        if (energyAssets.includes(asset.id)) return 'energy';
        if (cryptoAssets.includes(asset.id)) return 'crypto';
        if (goldAssets.includes(asset.id)) return 'gold';
        if (asset.type === 'BOND') return 'bonds';
        if (asset.type === 'CRYPTO') return 'crypto';
        
        return 'finance'; // Default
    }

    private applySentimentFromNews(news: NewsCard) {
        const sentimentScore = SENTIMENT_SCORE[news.sentiment] || 0;
        
        news.affectedSectors.forEach(sector => {
            const assetTypes = this.getAssetTypesForSector(sector);
            assetTypes.forEach(type => {
                const impactWeight = SECTOR_IMPACT_WEIGHT[sector] || 1.0;
                const change = sentimentScore * impactWeight * 20; // Scale for sentiment display
                this.gameState.sentiment[type as AssetType] = Math.max(-100, Math.min(100, 
                    this.gameState.sentiment[type as AssetType] + change
                ));
            });
        });

        console.log(`   Sentiment after news:`, this.gameState.sentiment);
    }

    private applySectorRotation(news: NewsCard) {
        // If a sector is hit negatively, unaffected sectors get small positive drift
        if (news.sentiment.includes('negative')) {
            const allSectors = ['technology', 'finance', 'energy', 'crypto', 'bonds', 'gold'];
            const unaffectedSectors = allSectors.filter(s => !news.affectedSectors.includes(s));
            
            unaffectedSectors.forEach(sector => {
                const assetTypes = this.getAssetTypesForSector(sector);
                assetTypes.forEach(type => {
                    // Small positive drift (+1-2%)
                    const drift = (Math.random() * 0.01 + 0.01) * 100; // 1-2% as sentiment points
                    this.gameState.sentiment[type as AssetType] = Math.min(100, 
                        this.gameState.sentiment[type as AssetType] + drift
                    );
                });
            });
            
            console.log(`   💫 Sector rotation: ${unaffectedSectors.join(', ')} getting positive drift`);
        }
    }

    private getAssetTypesForSector(sector: string): string[] {
        const mapping: Record<string, string[]> = {
            'technology': ['STOCK'],
            'finance': ['STOCK', 'ETF', 'BOND'],
            'energy': ['STOCK', 'ETF'],
            'crypto': ['CRYPTO'],
            'bonds': ['BOND'],
            'gold': ['ETF']
        };
        return mapping[sector] || ['STOCK'];
    }

    private calculatePlayerValues() {
        this.gameState.players.forEach(player => {
            let holdingsValue = 0;
            player.holdings.forEach(h => {
                const asset = this.gameState.assets.find(a => a.id === h.assetId);
                if (asset) {
                    holdingsValue += h.quantity * asset.currentPrice;
                }
            });
            player.totalValue = player.cash + holdingsValue;
        });
    }

    private calculateRisk() {
        this.gameState.players.forEach(player => {
            let totalRisk = 0;
            let totalPortfolioValue = 0;

            player.holdings.forEach(h => {
                const asset = this.gameState.assets.find(a => a.id === h.assetId);
                if (asset) {
                    const value = h.quantity * asset.currentPrice;
                    totalPortfolioValue += value;
                    // Use realistic volatility factors for risk calculation
                    const vol = VOLATILITY_FACTOR[asset.type] || 0.03;
                    totalRisk += value * vol * 500; // Scale for display
                }
            });

            if (totalPortfolioValue > 0) {
                let riskScore = Math.min(100, Math.round(totalRisk / totalPortfolioValue * 100));
                if (player.strategyId === 'SAFETY_FIRST') {
                    riskScore = Math.max(0, riskScore - 10);
                }
                player.riskScore = riskScore;
            } else {
                player.riskScore = 0;
            }
        });
    }


    // ==================== TRADING ====================

    public handleBuy(socketId: string, assetId: string, amount: number) {
        const player = this.gameState.players.find(p => p.id === socketId);
        const asset = this.gameState.assets.find(a => a.id === assetId);

        if (!player || !asset || this.gameState.phase !== 'PLAYING') return;

        // Liquidity scaling: large orders cause self-slippage
        const slippage = this.calculateSlippage(amount, asset.currentPrice);
        const effectivePrice = asset.currentPrice * (1 + slippage);
        const cost = amount * effectivePrice;

        if (player.cash >= cost) {
            player.cash -= cost;
            const holding = player.holdings.find(h => h.assetId === assetId);
            if (holding) {
                const totalCost = (holding.quantity * holding.avgBuyPrice) + cost;
                holding.quantity += amount;
                holding.avgBuyPrice = totalCost / holding.quantity;
            } else {
                player.holdings.push({
                    assetId,
                    quantity: amount,
                    avgBuyPrice: effectivePrice
                });
            }

            player.transactionLog.push({
                round: this.gameState.currentRound,
                type: 'BUY',
                assetId,
                assetType: asset.type,
                amount,
                price: effectivePrice,
                totalValue: cost,
                eventActive: this.gameState.activeEvent?.id,
                sentimentAtTime: this.gameState.sentiment[asset.type]
            });

            this.broadcastState();
        }
    }

    public handleSell(socketId: string, assetId: string, amount: number) {
        const player = this.gameState.players.find(p => p.id === socketId);
        const asset = this.gameState.assets.find(a => a.id === assetId);

        if (!player || !asset || this.gameState.phase !== 'PLAYING') return;

        const holding = player.holdings.find(h => h.assetId === assetId);
        if (holding && holding.quantity >= amount) {
            // Liquidity scaling: large orders cause self-slippage
            const slippage = this.calculateSlippage(amount, asset.currentPrice);
            const effectivePrice = asset.currentPrice * (1 - slippage);
            const revenue = amount * effectivePrice;

            player.cash += revenue;
            holding.quantity -= amount;
            if (holding.quantity <= 0) {
                player.holdings = player.holdings.filter(h => h.assetId !== assetId);
            }

            player.transactionLog.push({
                round: this.gameState.currentRound,
                type: 'SELL',
                assetId,
                assetType: asset.type,
                amount,
                price: effectivePrice,
                totalValue: revenue,
                eventActive: this.gameState.activeEvent?.id,
                sentimentAtTime: this.gameState.sentiment[asset.type]
            });

            this.broadcastState();
        }
    }

    private calculateSlippage(amount: number, price: number): number {
        // Larger orders = more slippage (prevents big players from dominating)
        const orderValue = amount * price;
        if (orderValue > 5000) return 0.02;  // 2% slippage for orders > $5000
        if (orderValue > 2000) return 0.01;  // 1% slippage for orders > $2000
        if (orderValue > 1000) return 0.005; // 0.5% slippage for orders > $1000
        return 0; // No slippage for small orders
    }

    public handleUsePowerUp(socketId: string, powerUpId: string) {
        const player = this.gameState.players.find(p => p.id === socketId);
        if (!player) return;

        const powerUp = player.powerUps.find(p => p.id === powerUpId);
        if (!powerUp || powerUp.usesLeft <= 0) return;

        powerUp.usesLeft--;

        if (powerUpId === 'future-glimpse') {
            player.riskScore = Math.max(0, player.riskScore - 20);
        } else if (powerUpId === 'market-freeze') {
            player.cash += 1000;
        }

        this.broadcastState();
    }

    // ==================== GAME END ====================

    private async endGame() {
        if (this.roundTimer) {
            clearInterval(this.roundTimer);
            this.roundTimer = null;
        }
        this.gameState.phase = 'FINISHED';

        const results = await this.calculateResults();
        this.io.emit('gameOver', results);
        this.broadcastState();
    }

    private async calculateResults() {
        const results = await Promise.all(this.gameState.players.map(async player => {
            const initialValue = STARTING_CASH;
            let finalValue = player.totalValue;

            if (player.strategyId === 'DIVERSIFIER') {
                const uniqueAssets = new Set(player.holdings.map(h => h.assetId)).size;
                if (uniqueAssets >= 4) {
                    finalValue += finalValue * 0.05;
                }
            }

            const roi = ((finalValue - initialValue) / initialValue) * 100;
            const riskAdjustedScore = roi - (player.riskScore * 0.5);

            let analysis;
            try {
                if (this.model) {
                    analysis = await this.generateGeminiAnalysis(player);
                } else {
                    const context = this.buildTradingContext(player);
                    analysis = this.generateEnhancedHeuristicAnalysis(player, context);
                }
            } catch (error) {
                const context = this.buildTradingContext(player);
                analysis = this.generateEnhancedHeuristicAnalysis(player, context);
            }

            return {
                playerId: player.id,
                playerName: player.name,
                finalValue,
                riskScore: player.riskScore,
                roi,
                riskAdjustedScore,
                rank: 0,
                insights: analysis.playerSummary.whatYouDidWell.concat(analysis.playerSummary.mistakesAndOpportunities),
                playerSummary: analysis.playerSummary,
                learningCards: analysis.learningCards
            };
        }));

        return results.sort((a, b) => b.riskAdjustedScore - a.riskAdjustedScore)
            .map((result, index) => ({ ...result, rank: index + 1 }));
    }

    private async generateGeminiAnalysis(player: PlayerState): Promise<{ playerSummary: any, learningCards: any[] }> {
        // Build comprehensive trading context
        const tradingContext = this.buildTradingContext(player);
        
        const prompt = `You are an expert financial coach analyzing a trading game performance. Provide detailed, personalized feedback based on the player's actual trades and market conditions.

GAME CONTEXT:
- Starting Cash: $${STARTING_CASH}
- Final Value: $${player.totalValue.toFixed(2)}
- ROI: ${((player.totalValue - STARTING_CASH) / STARTING_CASH * 100).toFixed(1)}%
- Risk Score: ${player.riskScore}/100
- Total Rounds: ${GAME_ROUNDS}
- Strategy: ${player.strategyId || 'None selected'}

NEWS EVENTS BY ROUND:
${tradingContext.newsHistory}

PLAYER'S TRADES:
${tradingContext.tradeAnalysis}

TRADING PATTERNS:
${tradingContext.patterns}

TASK:
Analyze this player's performance and provide:
1. What they did well (2-4 specific points based on their actual trades)
2. Mistakes and missed opportunities (2-4 specific points with examples)
3. Improvement suggestions (2-3 actionable tips)
4. 2-3 educational cards about concepts they should learn

Be specific! Reference actual trades, news events, and timing. Don't give generic advice.

Return ONLY valid JSON with this structure:
{
  "playerSummary": {
    "whatYouDidWell": ["specific positive action 1", "specific positive action 2", ...],
    "mistakesAndOpportunities": ["specific mistake 1 with example", "missed opportunity 1", ...],
    "improvementSuggestions": ["actionable tip 1", "actionable tip 2", ...]
  },
  "learningCards": [
    {
      "title": "Concept Title",
      "text": "Brief explanation (2-3 sentences)",
      "deepDive": "Detailed explanation with examples",
      "searchQuery": "search term for more info"
    }
  ]
}`;

        try {
            const result = await this.model.generateContent(prompt);
            const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(text);
        } catch (error) {
            console.error('Gemini analysis error:', error);
            return this.generateEnhancedHeuristicAnalysis(player, tradingContext);
        }
    }

    private buildTradingContext(player: PlayerState): any {
        // Build news history
        const newsHistory = this.roundNewsHistory.map(rn => 
            `Round ${rn.round}: "${rn.newsCard.title}" (${rn.newsCard.sentiment}) - Affected: ${rn.newsCard.affectedSectors.join(', ')}`
        ).join('\n');

        // Analyze trades
        const tradesByRound: Record<number, any[]> = {};
        player.transactionLog.forEach(trade => {
            if (!tradesByRound[trade.round]) {
                tradesByRound[trade.round] = [];
            }
            tradesByRound[trade.round].push(trade);
        });

        const tradeAnalysis = Object.entries(tradesByRound).map(([round, trades]) => {
            const newsForRound = this.roundNewsHistory.find(rn => rn.round === parseInt(round));
            const newsInfo = newsForRound ? `News: "${newsForRound.newsCard.title}" (${newsForRound.newsCard.sentiment})` : 'No news';
            
            const tradeDetails = trades.map(t => 
                `  - ${t.type} ${t.amount.toFixed(2)} ${t.assetId} @ $${t.price.toFixed(2)} (${t.assetType})`
            ).join('\n');
            
            return `Round ${round} - ${newsInfo}\n${tradeDetails}`;
        }).join('\n\n');

        // Identify patterns
        const patterns = this.identifyTradingPatterns(player);

        return {
            newsHistory,
            tradeAnalysis: tradeAnalysis || 'No trades made',
            patterns
        };
    }

    private identifyTradingPatterns(player: PlayerState): string {
        const patterns: string[] = [];
        const trades = player.transactionLog;

        if (trades.length === 0) {
            return '- No trades made (passive strategy)';
        }

        // Check if player traded with news
        const tradesWithNews = trades.filter(t => t.eventActive);
        if (tradesWithNews.length > trades.length * 0.7) {
            patterns.push('- Highly reactive to news (70%+ trades during news events)');
        } else if (tradesWithNews.length < trades.length * 0.3) {
            patterns.push('- Ignored news signals (less than 30% trades aligned with news)');
        }

        // Check diversification
        const uniqueAssets = new Set(trades.map(t => t.assetId)).size;
        if (uniqueAssets >= 5) {
            patterns.push(`- Well diversified (traded ${uniqueAssets} different assets)`);
        } else if (uniqueAssets <= 2) {
            patterns.push(`- Concentrated portfolio (only ${uniqueAssets} assets)`);
        }

        // Check asset type preference
        const assetTypeCounts: Record<string, number> = {};
        trades.forEach(t => {
            assetTypeCounts[t.assetType] = (assetTypeCounts[t.assetType] || 0) + 1;
        });
        const dominantType = Object.entries(assetTypeCounts).sort((a, b) => b[1] - a[1])[0];
        if (dominantType && dominantType[1] > trades.length * 0.6) {
            patterns.push(`- Heavy focus on ${dominantType[0]} (${((dominantType[1] / trades.length) * 100).toFixed(0)}% of trades)`);
        }

        // Check buy/sell ratio
        const buys = trades.filter(t => t.type === 'BUY').length;
        const sells = trades.filter(t => t.type === 'SELL').length;
        if (buys > sells * 2) {
            patterns.push('- Aggressive buyer (bought much more than sold)');
        } else if (sells > buys * 2) {
            patterns.push('- Frequent profit-taker (sold much more than bought)');
        }

        // Check timing
        const earlyTrades = trades.filter(t => t.round <= 2).length;
        const lateTrades = trades.filter(t => t.round >= 4).length;
        if (earlyTrades > lateTrades * 2) {
            patterns.push('- Early mover (most trades in first 2 rounds)');
        } else if (lateTrades > earlyTrades * 2) {
            patterns.push('- Late trader (most activity in final rounds)');
        }

        return patterns.join('\n');
    }

    private generateEnhancedHeuristicAnalysis(player: PlayerState, context: any): { playerSummary: any, learningCards: any[] } {
        const trades = player.transactionLog;
        const roi = ((player.totalValue - STARTING_CASH) / STARTING_CASH * 100);
        
        const whatYouDidWell: string[] = [];
        const mistakes: string[] = [];
        const suggestions: string[] = [];

        // Analyze performance
        if (trades.length > 0) {
            whatYouDidWell.push('You actively participated in the market and made trades');
        }
        
        if (roi > 5) {
            whatYouDidWell.push(`You achieved a positive ROI of ${roi.toFixed(1)}%`);
        }

        const uniqueAssets = new Set(trades.map(t => t.assetId)).size;
        if (uniqueAssets >= 4) {
            whatYouDidWell.push(`You diversified across ${uniqueAssets} different assets`);
        } else if (uniqueAssets <= 2 && trades.length > 0) {
            mistakes.push(`Limited diversification - you only traded ${uniqueAssets} assets`);
        }

        if (player.riskScore > 70) {
            mistakes.push('Your portfolio had high risk exposure (70+ risk score)');
        }

        if (trades.length === 0) {
            mistakes.push('You didn\'t make any trades - missed all opportunities');
            suggestions.push('React to news events by buying affected assets');
        }

        const tradesWithNews = trades.filter(t => t.eventActive).length;
        if (tradesWithNews < trades.length * 0.3 && trades.length > 0) {
            mistakes.push('You ignored most news signals - only 30% of trades aligned with news');
            suggestions.push('Pay attention to news cards and trade the affected sectors');
        }

        if (roi < 0) {
            suggestions.push('Focus on buying during negative news and selling during positive news');
        }

        suggestions.push('Study the relationship between news sentiment and price movements');

        const summary = {
            whatYouDidWell: whatYouDidWell.length > 0 ? whatYouDidWell : ['You completed the game'],
            mistakesAndOpportunities: mistakes.length > 0 ? mistakes : ['Consider being more active in trading'],
            improvementSuggestions: suggestions
        };

        const cards = [
            {
                title: 'News-Driven Trading',
                text: 'Markets react strongly to news. Positive news drives prices up, negative news drives them down.',
                deepDive: 'Professional traders monitor news constantly. The key is to act quickly when news breaks, but also understand that news impact fades over time (time decay). Buy the rumor, sell the news.',
                searchQuery: 'how news affects stock prices'
            },
            {
                title: 'Diversification',
                text: 'Don\'t put all your eggs in one basket. Spread investments across different asset types.',
                deepDive: 'Diversification reduces risk because different assets react differently to the same news. When stocks fall, bonds might rise. When crypto crashes, gold might rally. A balanced portfolio protects you from sector-specific crashes.',
                searchQuery: 'portfolio diversification strategy'
            }
        ];

        return { playerSummary: summary, learningCards: cards };
    }

    // ==================== RESET & UTILITIES ====================

    private resetGame() {
        console.log("Resetting Game...");
        if (this.roundTimer) clearInterval(this.roundTimer);
        if (this.preMatchTimer) clearInterval(this.preMatchTimer);
        this.roundTimer = null;
        this.preMatchTimer = null;

        // Store existing players before reset
        const existingPlayers = this.gameState.players;

        // Reset game state
        this.gameState = this.createInitialState();
        this.gameState.assets = JSON.parse(JSON.stringify(INITIAL_ASSETS));
        this.lastRoundSentiment = 'neutral';
        this.consecutiveSameSentiment = 0;
        this.roundNewsHistory = []; // Clear news history

        // Restore players with reset stats
        this.gameState.players = existingPlayers.map(p => ({
            id: p.id,
            name: p.name,
            cash: STARTING_CASH,
            holdings: [],
            riskScore: 0,
            powerUps: [
                { id: 'future-glimpse', name: 'Risk Shield', description: '-20 Risk Score', usesLeft: 1 },
                { id: 'market-freeze', name: 'Bailout', description: '+$1000 Cash', usesLeft: 1 }
            ],
            totalValue: STARTING_CASH,
            avatarId: undefined,
            strategyId: undefined,
            ready: false,
            transactionLog: []
        }));
    }

    public handlePlayAgain() {
        console.log("Play Again requested");
        this.resetGame();
        this.broadcastState(); // Broadcast reset state immediately
        this.startPreMatch();
    }

    private broadcastState() {
        this.io.emit('gameState', this.gameState);
    }
}
