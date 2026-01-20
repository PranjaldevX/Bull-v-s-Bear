import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { Asset, AssetType } from '@bvb/shared';
import { RiskMeter } from './RiskMeter';
import { EventCard } from './EventCard';
import { PowerUpBar } from './PowerUpBar';

export const GameDashboard: React.FC = () => {
    const gameState = useGameStore(state => state.gameState);
    const gameResults = useGameStore(state => state.gameResults);
    const playerName = useGameStore(state => state.playerName);
    const buyAsset = useGameStore(state => state.buyAsset);
    const sellAsset = useGameStore(state => state.sellAsset);
    const usePowerUp = useGameStore(state => state.usePowerUp);
    const playAgain = useGameStore(state => state.playAgain);

    const [activeTab, setActiveTab] = useState<AssetType>('STOCK');
    const [showLearningCards, setShowLearningCards] = useState(false);
    const [showEventPopup, setShowEventPopup] = useState(false);
    const [lastRound, setLastRound] = useState(0);

    // Show news popup at the start of each round when a new event appears
    React.useEffect(() => {
        if (gameState?.activeEvent && gameState.currentRound !== lastRound) {
            setLastRound(gameState.currentRound);
            setShowEventPopup(true);
            const timer = setTimeout(() => {
                setShowEventPopup(false);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [gameState?.activeEvent?.id, gameState?.currentRound, lastRound]);

    // Also show popup when event changes mid-round
    React.useEffect(() => {
        if (gameState?.activeEvent) {
            setShowEventPopup(true);
            const timer = setTimeout(() => {
                setShowEventPopup(false);
            }, 5000);
            return () => clearTimeout(timer);
        } else {
            setShowEventPopup(false);
        }
    }, [gameState?.activeEvent?.id]);

    if (!gameState) return <div className="text-white">Loading market data...</div>;

    const me = gameState.players.find(p => p.name === playerName);
    const sortedPlayers = [...gameState.players].sort((a, b) => b.totalValue - a.totalValue);

    // Filter assets by active tab
    const visibleAssets = gameState.assets.filter(a => a.type === activeTab);

    return (
        <div className={`min-h-screen bg-theme-bg text-white p-4 flex flex-col relative ${gameState.fearZoneActive ? 'border-4 border-red-600' : ''}`}>
            {/* Fear Zone Overlay */}
            {gameState.fearZoneActive && (
                <div className="absolute top-0 left-0 right-0 bg-red-600 text-white text-center font-bold py-1 animate-bounce z-40">
                    🔥 FEAR ZONE ACTIVE - MOST INVESTORS MAKE MISTAKES HERE 🔥
                </div>
            )}

            {/* Event Popup (TOP of Screen) - Shows at start of each round */}
            {showEventPopup && gameState.activeEvent && (
                <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 pointer-events-none">
                    <div className="w-full max-w-2xl animate-slideDownFade pointer-events-auto transform px-4">
                        {/* Round Banner */}
                        <div className="text-center mb-2">
                            <div className="inline-block bg-neon-blue text-black font-bold text-xl px-6 py-1 rounded-full animate-pulse shadow-[0_0_30px_rgba(59,130,246,0.6)]">
                                📰 ROUND {gameState.currentRound} - BREAKING NEWS 📰
                            </div>
                        </div>
                        <EventCard event={gameState.activeEvent} isPopup={true} />
                        <div className="text-center mt-2 text-gray-300 text-sm bg-black/80 py-2 rounded-b-lg">
                            ⏱️ Market opens in <span className="text-neon-green font-bold">{Math.max(0, gameState.timeRemaining - 30)}s</span> - Read the news carefully!
                        </div>
                    </div>
                </div>
            )}

            {/* Game Over Modal */}
            {gameResults && (
                <div className="absolute inset-0 bg-black bg-opacity-90 z-50 flex items-start justify-center p-4 pt-10 overflow-y-auto">
                    <div className="bg-theme-surface border border-neon-blue rounded-lg p-8 max-w-3xl w-full shadow-[0_0_50px_rgba(59,130,246,0.5)] my-8 animate-slideUpFade">
                        <h2 className="text-4xl font-bold text-center text-neon-blue mb-6 animate-pulse">MARKET CLOSED</h2>

                        <div className="space-y-6">
                            <div className="grid grid-cols-5 gap-4 font-bold text-theme-text-muted border-b border-gray-700 pb-2">
                                <div>Rank</div>
                                <div className="col-span-2">Player</div>
                                <div className="text-right">ROI</div>
                                <div className="text-right">Score</div>
                            </div>

                            {gameResults.map((result) => (
                                <div key={result.playerId} className={`flex flex-col ${result.playerName === playerName ? 'bg-theme-surface-highlight p-3 rounded border border-neon-green' : 'py-2'}`}>
                                    <div className="grid grid-cols-5 gap-4 items-center w-full">
                                        <div className="text-2xl font-mono text-gray-500">#{result.rank}</div>
                                        <div className="col-span-2 font-bold text-lg">{result.playerName}</div>
                                        <div className={`text-right font-mono ${result.roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            {result.roi.toFixed(1)}%
                                        </div>
                                        <div className="text-right font-mono text-neon-blue text-xl">
                                            {result.riskAdjustedScore.toFixed(0)}
                                        </div>
                                    </div>

                                    {/* Player Summary (Only for me) */}
                                    {result.playerName === playerName && result.playerSummary && (
                                        <div className="mt-4 bg-theme-bg p-4 rounded border border-gray-600">
                                            <h3 className="text-neon-green font-bold mb-2">Coach's Feedback</h3>

                                            <div className="mb-2">
                                                <div className="text-xs text-green-400 uppercase font-bold">What You Did Well</div>
                                                <ul className="list-disc list-inside text-sm text-gray-300">
                                                    {result.playerSummary.whatYouDidWell.map((item, i) => <li key={i}>{item}</li>)}
                                                </ul>
                                            </div>

                                            <div className="mb-2">
                                                <div className="text-xs text-yellow-400 uppercase font-bold">Mistakes & Opportunities</div>
                                                <ul className="list-disc list-inside text-sm text-gray-300">
                                                    {result.playerSummary.mistakesAndOpportunities.map((item, i) => <li key={i}>{item}</li>)}
                                                </ul>
                                            </div>

                                            <div>
                                                <div className="text-xs text-blue-400 uppercase font-bold">Suggestions</div>
                                                <ul className="list-disc list-inside text-sm text-gray-300">
                                                    {result.playerSummary.improvementSuggestions.map((item, i) => <li key={i}>{item}</li>)}
                                                </ul>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Learn More Button */}
                        {gameResults.find(r => r.playerName === playerName)?.learningCards && (
                            <div className="mt-6 text-center">
                                <button
                                    onClick={() => setShowLearningCards(!showLearningCards)}
                                    className="text-neon-blue hover:text-white underline text-sm font-bold transition-colors mb-4"
                                >
                                    {showLearningCards ? "Hide Insights" : "Learn More 💡"}
                                </button>
                            </div>
                        )}

                        {/* Learning Cards (Tooltips/Cards) */}
                        {showLearningCards && gameResults.find(r => r.playerName === playerName)?.learningCards && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fadeIn">
                                {gameResults.find(r => r.playerName === playerName)?.learningCards?.map((card, idx) => (
                                    <LearningCardItem key={idx} card={card} />
                                ))}
                            </div>
                        )}

                        <div className="mt-8 text-center animate-slideUpFade" style={{ animationDelay: '0.5s' }}>
                            <button
                                onClick={() => playAgain()}
                                className="bg-neon-green text-black font-bold py-3 px-8 rounded hover:bg-green-400 transition-colors shadow-[0_0_20px_rgba(0,255,157,0.4)]"
                            >
                                PLAY AGAIN
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <header className="flex justify-between items-center mb-6 bg-theme-surface p-4 rounded border-b border-gray-800 mt-6 shadow-lg shadow-neon-blue/10">
                <div>
                    <h1 className="text-2xl font-bold text-neon-blue tracking-wider">Bull vs Bear Royale</h1>
                    <div className="text-sm text-theme-text-muted">Round {gameState.currentRound} / {gameState.maxRounds}</div>
                    {gameState.activeScenario && (
                        <div className="text-xs font-bold text-yellow-400 mt-1 uppercase">
                            SCENARIO: {gameState.activeScenario.title}
                        </div>
                    )}
                </div>
                <div className="text-center">
                    <div className={`text-3xl font-mono font-bold ${gameState.timeRemaining <= 10 ? 'text-red-500 animate-ping' : 'text-neon-green'}`}>
                        {Math.floor(gameState.timeRemaining)}s
                    </div>
                    <div className="text-xs text-gray-500 uppercase tracking-widest">Round Time</div>
                </div>
                <div className="flex gap-8 text-right">
                    <div>
                        <div className="text-xl font-bold text-green-400">
                            ${me?.cash.toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-400">Available Cash</div>
                    </div>
                    <div>
                        <div className="text-xl font-bold text-white">
                            ${(me ? me.totalValue - me.cash : 0).toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-400">Invested Value</div>
                    </div>
                </div>
            </header>

            <div className="flex-1 grid grid-cols-12 gap-4">
                {/* Left: Market */}
                <div className="col-span-3 bg-theme-surface rounded p-4 border border-gray-800 overflow-y-auto flex flex-col">
                    <h2 className="text-lg font-bold mb-4 text-gray-300">Market</h2>

                    {/* Tabs */}
                    <div className="grid grid-cols-2 gap-2 mb-4">
                        {(['STOCK', 'CRYPTO', 'ETF', 'BOND'] as AssetType[]).map(type => (
                            <button
                                key={type}
                                onClick={() => setActiveTab(type)}
                                className={`text-xs font-bold py-2 rounded transition-colors ${activeTab === type
                                    ? 'bg-neon-blue text-black'
                                    : 'bg-theme-surface-highlight text-gray-400 hover:bg-gray-600'
                                    }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>

                    <div className="space-y-3 flex-1 overflow-y-auto">
                        {visibleAssets.map(asset => (
                            <AssetCard
                                key={asset.id}
                                asset={asset}
                                disabled={false}
                                onBuy={(amount) => buyAsset(asset.id, amount)}
                                onSell={(amount) => sellAsset(asset.id, amount)}
                            />
                        ))}
                    </div>
                </div>

                {/* Center: Portfolio & Cash */}
                <div className="col-span-6 flex flex-col gap-4">
                    <div className="bg-theme-surface rounded p-4 border border-gray-800 flex-1">
                        <h2 className="text-lg font-bold mb-4 text-gray-300">Your Portfolio</h2>
                        {me?.holdings.length === 0 ? (
                            <p className="text-gray-500 text-center mt-10">No assets held. Buy something!</p>
                        ) : (
                            <div className="grid grid-cols-2 gap-3">
                                {me?.holdings.map(holding => {
                                    const asset = gameState.assets.find(a => a.id === holding.assetId);
                                    const currentValue = (asset?.currentPrice || 0) * holding.quantity;
                                    const profit = currentValue - (holding.avgBuyPrice * holding.quantity);
                                    const isProfit = profit >= 0;

                                    return (
                                        <div key={holding.assetId} className="bg-theme-surface-highlight p-3 rounded">
                                            <div className="flex justify-between">
                                                <span className="font-bold">{asset?.name}</span>
                                                <span className="text-gray-400">x{holding.quantity}</span>
                                            </div>
                                            <div className="flex justify-between mt-2">
                                                <span>${currentValue.toFixed(2)}</span>
                                                <span className={isProfit ? 'text-green-400' : 'text-red-400'}>
                                                    {isProfit ? '+' : ''}{profit.toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Leaderboard, News, Power-Ups */}
                <div className="col-span-3 flex flex-col gap-2 overflow-y-auto">
                    {/* Leaderboard - Compact */}
                    <div className="bg-theme-surface rounded p-2 border border-gray-800 max-h-[120px] overflow-y-auto flex-shrink-0">
                        <h2 className="text-xs font-bold mb-1 text-gray-300">Leaderboard</h2>
                        <ul className="space-y-0.5">
                            {sortedPlayers.map((p, idx) => (
                                <li key={p.id} className={`flex justify-between items-center p-1 rounded text-xs ${p.id === me?.id ? 'bg-theme-surface-highlight border border-neon-blue' : ''}`}>
                                    <div className="flex items-center gap-1">
                                        <span className="text-gray-500 font-mono">#{idx + 1}</span>
                                        <span className="font-medium truncate max-w-[50px]">{p.name}</span>
                                    </div>
                                    <span className="font-mono">${p.totalValue.toFixed(0)}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Risk Meter - Compact */}
                    <div className="flex-shrink-0">
                        <RiskMeter score={me?.riskScore || 0} />
                    </div>

                    {/* Show Event Card in Sidebar */}
                    {!showEventPopup && gameState.activeEvent && (
                        <div className="flex-shrink-0">
                            <EventCard event={gameState.activeEvent} isPopup={false} />
                        </div>
                    )}

                    {/* Power-Ups - RIGHT AFTER NEWS CARD */}
                    <div className="flex-shrink-0">
                        <PowerUpBar
                            powerUps={me?.powerUps || []}
                            onUse={(id) => usePowerUp(id)}
                        />
                    </div>
                </div>
            </div>
        </div >
    );
};

const AssetCard: React.FC<{ asset: Asset; disabled: boolean; onBuy: (amount: number) => void; onSell: (amount: number) => void }> = ({ asset, disabled, onBuy, onSell }) => {
    const isUp = asset.history.length > 1 && asset.currentPrice > asset.history[asset.history.length - 2];
    const [amount, setAmount] = useState(1);

    return (
        <div className={`p-3 rounded transition-colors ${disabled ? 'bg-theme-surface-highlight opacity-50 cursor-not-allowed' : 'bg-theme-surface-highlight hover:bg-theme-accent-dark'}`}>
            <div className="flex justify-between items-start mb-2">
                <div>
                    <div className="font-bold text-sm">{asset.name}</div>
                    <div className="text-xs text-gray-400">{asset.type}</div>
                </div>
                <div className={`font-mono font-bold ${isUp ? 'text-green-400' : 'text-red-400'}`}>
                    ${asset.currentPrice.toFixed(2)}
                </div>
            </div>

            <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-gray-400">Qty:</span>
                <input
                    type="number"
                    min="1"
                    value={amount}
                    onChange={(e) => setAmount(Math.max(1, parseInt(e.target.value) || 1))}
                    disabled={disabled}
                    className="w-16 bg-gray-800 border border-gray-600 rounded px-1 text-sm text-white disabled:opacity-50"
                />
            </div>

            <div className="flex gap-2">
                <button
                    onClick={() => onBuy(amount)}
                    disabled={disabled}
                    className={`flex-1 text-xs py-1 rounded font-bold ${disabled ? 'bg-gray-600 text-gray-400' : 'bg-green-600 hover:bg-green-500'}`}
                >
                    BUY
                </button>
                <button
                    onClick={() => onSell(amount)}
                    disabled={disabled}
                    className={`flex-1 text-xs py-1 rounded font-bold ${disabled ? 'bg-gray-600 text-gray-400' : 'bg-red-600 hover:bg-red-500'}`}
                >
                    SELL
                </button>
            </div>
        </div>
    );
};

const LearningCardItem: React.FC<{ card: any }> = ({ card }) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <div
            className={`bg-theme-surface-highlight p-4 rounded border transition-all duration-300 relative group cursor-pointer ${expanded ? 'border-neon-blue col-span-1 md:col-span-3' : 'border-neon-blue/30 hover:border-neon-blue'}`}
            onClick={() => setExpanded(!expanded)}
        >
            <div className="absolute -top-2 -right-2 bg-neon-blue text-black text-xs font-bold px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                {expanded ? 'CLOSE' : 'TIP'}
            </div>

            <h4 className="text-neon-blue font-bold text-sm mb-2 flex items-center gap-2">
                {card.title}
                {!expanded && <span className="text-xs text-gray-500 font-normal">(Click to learn more)</span>}
            </h4>

            <p className="text-xs text-gray-300 leading-relaxed mb-2">{card.text}</p>

            {expanded && (
                <div className="mt-4 pt-4 border-t border-gray-700 animate-fadeIn">
                    <h5 className="text-neon-green font-bold text-xs uppercase mb-2">Deep Dive</h5>
                    <p className="text-sm text-gray-200 leading-relaxed mb-4">
                        {card.deepDive || "No deep dive available for this topic."}
                    </p>

                    {card.searchQuery && (
                        <a
                            href={`https://www.google.com/search?q=${encodeURIComponent(card.searchQuery)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2 px-4 rounded transition-colors"
                            onClick={(e) => e.stopPropagation()}
                        >
                            Search "{card.searchQuery}" on Google ↗
                        </a>
                    )}
                </div>
            )}
        </div>
    );
};
