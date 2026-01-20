import React from 'react';
import { PowerUp } from '@bvb/shared';

interface PowerUpBarProps {
    powerUps: PowerUp[];
    onUse: (id: string) => void;
}

export const PowerUpBar: React.FC<PowerUpBarProps> = ({ powerUps, onUse }) => {
    return (
        <div className="bg-gray-800 rounded p-4 border border-gray-700 mt-4">
            <h2 className="text-lg font-bold mb-2 text-gray-300">Power-Ups</h2>
            <div className="flex gap-4">
                {powerUps.map(p => (
                    <button
                        key={p.id}
                        onClick={() => onUse(p.id)}
                        disabled={p.usesLeft <= 0}
                        className={`flex-1 p-3 rounded border ${p.usesLeft > 0
                                ? 'bg-indigo-600 border-indigo-400 hover:bg-indigo-500'
                                : 'bg-gray-700 border-gray-600 opacity-50 cursor-not-allowed'
                            } transition-all`}
                    >
                        <div className="font-bold text-sm">{p.name}</div>
                        <div className="text-xs text-gray-300">{p.description}</div>
                        <div className="text-xs mt-1 font-mono text-neon-blue">{p.usesLeft} left</div>
                    </button>
                ))}
            </div>
        </div>
    );
};
