import React from 'react';
import { useGameStore } from '../../store/gameStore';

export const ScenarioTeaser: React.FC = () => {
    const { gameState } = useGameStore();
    const scenario = gameState?.activeScenario;

    if (!scenario) return null;

    return (
        <div className="fixed inset-0 bg-black flex items-center justify-center z-50 p-8 animate-fade-in">
            {/* Left Side - Market Forecast */}
            <div className="flex-1 flex flex-col items-center justify-center pr-8 border-r border-gray-700">
                <div className="text-2xl text-gray-400 mb-4 uppercase tracking-widest">Market Forecast</div>
                <h1 className="text-6xl font-black text-white mb-6 text-center uppercase tracking-tighter">
                    {scenario.title}
                </h1>
                <p className="text-3xl text-red-500 mb-8 text-center max-w-2xl font-bold">
                    {scenario.description}
                </p>
                <div className="bg-gray-900 border border-red-500/30 p-6 rounded-lg max-w-xl">
                    <p className="text-xl text-white text-center italic">
                        "{scenario.effectDescription}"
                    </p>
                </div>
            </div>

            {/* Right Side - Tutorial Hints */}
            <div className="flex-1 flex flex-col items-center justify-center pl-8">
                <h2 className="text-4xl text-white mb-12 font-bold">REMEMBER</h2>
                <div className="space-y-6 w-full max-w-2xl">
                    <div className="bg-white text-black p-6 rounded-lg shadow-lg transform -rotate-2 text-2xl font-bold text-center">
                        🔹 Buy dips — not hype
                    </div>
                    <div className="bg-white text-black p-6 rounded-lg shadow-lg transform rotate-1 text-2xl font-bold text-center">
                        🔹 Don't put all money in one asset
                    </div>
                    <div className="bg-white text-black p-6 rounded-lg shadow-lg transform -rotate-1 text-2xl font-bold text-center">
                        🔹 Finish with the highest risk-adjusted return
                    </div>
                </div>
            </div>
        </div>
    );
};
