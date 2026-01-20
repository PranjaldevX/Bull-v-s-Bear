import React from 'react';
import { STRATEGIES } from '../../data/gameData';
import { useGameStore } from '../../store/gameStore';

export const StrategySelection: React.FC = () => {
    const { selectStrategy, gameState, socket } = useGameStore();
    const myPlayer = gameState?.players.find(p => p.id === socket?.id);

    return (
        <div className="fixed inset-0 bg-gray-900 flex flex-col items-center justify-center z-50 p-8">
            <h2 className="text-4xl text-white mb-8 font-bold">PICK A STRATEGY CARD</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl">
                {STRATEGIES.map(strategy => (
                    <div
                        key={strategy.id}
                        onClick={() => selectStrategy(strategy.id)}
                        className={`p-6 rounded-xl cursor-pointer transition-all transform hover:scale-105 border-2 ${myPlayer?.strategyId === strategy.id
                                ? 'border-purple-500 bg-gray-800 shadow-[0_0_20px_rgba(168,85,247,0.5)]'
                                : 'border-gray-700 bg-gray-800 hover:border-pink-400'
                            }`}
                    >
                        <div className="text-5xl mb-4 text-center">
                            {strategy.id === 'HIGH_ROLLER' && '⚡'}
                            {strategy.id === 'SAFETY_FIRST' && '🛡️'}
                            {strategy.id === 'DIVERSIFIER' && '🤝'}
                            {strategy.id === 'SWING_TRADER' && '🔁'}
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2 text-center">{strategy.name}</h3>
                        <p className="text-green-400 text-sm mb-4 text-center font-bold">{strategy.bonusDescription}</p>
                        <div className="bg-gray-900 p-2 rounded text-xs text-gray-400 italic text-center">
                            "{strategy.tooltip}"
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-8 text-xl text-yellow-400 font-mono">
                Time Remaining: {Math.ceil(gameState?.timeRemaining || 0)}s
            </div>
        </div>
    );
};
