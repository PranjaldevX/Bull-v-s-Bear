import React from 'react';

export const Intro: React.FC = () => {
    return (
        <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50 animate-fade-in p-4">
            {/* Main Title */}
            <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 mb-4 animate-pulse">
                MARKET ARENA
            </h1>
            <p className="text-2xl text-white mb-6">Fortunes are made in four minutes.</p>
            
            {/* Educational Disclaimer */}
            <div className="max-w-2xl bg-gradient-to-r from-yellow-900/40 to-orange-900/40 border border-yellow-600/50 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">⚠️</span>
                    <span className="text-yellow-400 font-bold uppercase text-sm">Educational Simulation</span>
                </div>
                <p className="text-yellow-200/90 text-sm leading-relaxed">
                    This is a <span className="font-bold text-white">game for learning purposes only</span>. 
                    All stock prices, crypto values, and market movements are <span className="font-bold text-white">simulated and exaggerated</span> for educational entertainment. 
                    They do <span className="font-bold text-red-400">NOT</span> reflect real market prices or conditions.
                </p>
                <p className="text-yellow-200/70 text-xs mt-2 italic">
                    🎮 Have fun learning how news affects markets!
                </p>
            </div>

            <div className="text-xl text-yellow-400 font-mono animate-bounce">
                GET READY TO TRADE
            </div>
        </div>
    );
};
