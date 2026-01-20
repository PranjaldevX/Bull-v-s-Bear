import React from 'react';

export const TutorialHint: React.FC = () => {
    return (
        <div className="fixed inset-0 bg-gray-950/95 flex flex-col items-center justify-center z-50 p-8">
            <h2 className="text-4xl text-white mb-12 font-bold">REMEMBER</h2>
            <div className="space-y-6 w-full max-w-2xl">
                <div className="bg-white text-black p-6 rounded-lg shadow-lg transform -rotate-2 text-2xl font-bold text-center">
                    🔹 Buy dips — not hype
                </div>
                <div className="bg-white text-black p-6 rounded-lg shadow-lg transform rotate-1 text-2xl font-bold text-center">
                    🔹 Don’t put all money in one asset
                </div>
                <div className="bg-white text-black p-6 rounded-lg shadow-lg transform -rotate-1 text-2xl font-bold text-center">
                    🔹 Finish with the highest risk-adjusted return
                </div>
            </div>
        </div>
    );
};
