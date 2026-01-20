export type AssetType = 'STOCK' | 'CRYPTO' | 'BOND' | 'ETF';
export type TrendBias = 'UP' | 'DOWN' | 'SIDEWAYS';

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  baseVolatility: number;
  trendBias: TrendBias;
  currentPrice: number;
  history: number[];
}

export interface Holding {
  assetId: string;
  quantity: number;
  avgBuyPrice: number;
}

export interface Transaction {
  round: number;
  type: 'BUY' | 'SELL';
  assetId: string;
  assetType: AssetType;
  amount: number;
  price: number;
  totalValue: number;
  eventActive?: string;
  sentimentAtTime: number;
}

export interface PowerUp {
  id: string;
  name: string;
  description: string;
  usesLeft: number;
}

export type AvatarId = 'ANALYST' | 'DEGEN' | 'STRATEGIST' | 'MEME_LORD';
export type StrategyId = 'HIGH_ROLLER' | 'SAFETY_FIRST' | 'DIVERSIFIER' | 'SWING_TRADER';

export interface Avatar {
  id: AvatarId;
  name: string;
  description: string;
  effectDescription: string;
}

export interface Strategy {
  id: StrategyId;
  name: string;
  bonusDescription: string;
  tooltip: string;
}

export interface PlayerState {
  id: string;
  name: string;
  cash: number;
  holdings: Holding[];
  riskScore: number;
  powerUps: PowerUp[];
  totalValue: number;
  avatarId?: AvatarId;
  strategyId?: StrategyId;
  ready: boolean;
  transactionLog: Transaction[];
}

export interface MarketEvent {
  id: string;
  title: string;
  description: string;
  affectedAssets: string[]; // Asset IDs or Types? "stocks", "bonds" etc.
  sentiment: 'positive' | 'negative' | 'neutral';
  intensity: 'low' | 'medium' | 'high';
  tags: string[];
  impact: Partial<Record<AssetType, number>>; // e.g. { STOCK: -0.15, BOND: 0.05 }
  duration: number;
  hint?: string;
  emoji?: string;

  // New Sentiment Engine Fields
  emotion?: string; // "Strong Positive", "Positive", etc.
  sectors?: string[]; // "Technology", "Finance", etc.
  impact_range_percent?: { min: number, max: number };
  momentum_rounds?: number;
  volatility_multiplier?: number;
}

export interface Scenario {
  id: string;
  title: string;
  description: string;
  effectDescription: string;
}

export type GamePhase = 'PRE_MATCH' | 'PLAYING' | 'FINISHED';
export type PreMatchSubPhase = 'INTRO' | 'AVATAR_SELECTION' | 'STRATEGY_SELECTION' | 'SCENARIO_TEASER' | 'TUTORIAL';

export interface GameState {
  id: string;
  players: PlayerState[];
  assets: Asset[];
  currentRound: number;
  maxRounds: number;
  activeEvent: MarketEvent | null;
  phase: GamePhase;
  subPhase: PreMatchSubPhase;
  timeRemaining: number;
  activeAssetType?: AssetType | 'ALL'; // For phased rounds
  activeScenario: Scenario | null;
  fearZoneActive: boolean;
  sentiment: Record<AssetType, number>; // -100 to +100
}

export interface ClientToServerEvents {
  joinGame: (name: string) => void;
  selectAvatar: (avatarId: AvatarId) => void;
  selectStrategy: (strategyId: StrategyId) => void;
  buyAsset: (assetId: string, amount: number) => void;
  sellAsset: (assetId: string, amount: number) => void;
  usePowerUp: (powerUpId: string) => void;
  playAgain: () => void;
}

export interface GameResult {
  playerId: string;
  playerName: string;
  finalValue: number;
  riskScore: number;
  roi: number;
  riskAdjustedScore: number;
  rank: number;
  insights: string[];
  playerSummary?: PlayerSummary;
  learningCards?: LearningCard[];
}

export interface LearningCard {
  title: string;
  text: string;
}

export interface PlayerSummary {
  whatYouDidWell: string[];
  mistakesAndOpportunities: string[];
  improvementSuggestions: string[];
}

export interface ServerToClientEvents {
  gameState: (state: GameState) => void;
  gameOver: (results: GameResult[]) => void;
  error: (message: string) => void;
}
