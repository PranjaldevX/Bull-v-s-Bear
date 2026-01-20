import React from 'react';
import { AVATARS } from '../../data/gameData';
import { useGameStore } from '../../store/gameStore';

export const AvatarSelection: React.FC = () => {
    const { selectAvatar, gameState, socket } = useGameStore();
    const myPlayer = gameState?.players.find(p => p.id === socket?.id);

    return (
        <div className="fixed inset-0 bg-gray-900 flex flex-col items-center justify-center z-50 p-8">
            <h2 className="text-4xl text-white mb-8 font-bold">CHOOSE YOUR AVATAR</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl">
                {AVATARS.map(avatar => (
                    <div
                        key={avatar.id}
                        onClick={() => selectAvatar(avatar.id)}
                        className={`p-6 rounded-xl cursor-pointer transition-all transform hover:scale-105 border-2 ${myPlayer?.avatarId === avatar.id
                                ? 'border-green-500 bg-gray-800 shadow-[0_0_20px_rgba(34,197,94,0.5)]'
                                : 'border-gray-700 bg-gray-800 hover:border-blue-400'
                            }`}
                    >
                        <div className="text-5xl mb-4 text-center">
                            {avatar.id === 'ANALYST' && '💼'}
                            {avatar.id === 'DEGEN' && '🚀'}
                            {avatar.id === 'STRATEGIST' && '🧠'}
                            {avatar.id === 'MEME_LORD' && '🎭'}
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2 text-center">{avatar.name}</h3>
                        <p className="text-gray-400 text-sm mb-4 text-center">{avatar.description}</p>
                        <div className="bg-gray-900 p-2 rounded text-xs text-blue-300 text-center">
                            {avatar.effectDescription}
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
