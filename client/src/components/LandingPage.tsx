import React from 'react';
import { ParticleBackground } from './ParticleBackground';

interface LandingPageProps {
    onContinue: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onContinue }) => {
    return (
        <div className="min-h-screen bg-theme-bg text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Elements */}
            <ParticleBackground />
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-blue rounded-full blur-[150px] animate-float"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-green rounded-full blur-[150px] animate-float" style={{ animationDelay: '2s' }}></div>
            </div>

            <div className="z-10 text-center max-w-2xl">
                <h1 className="text-6xl font-bold mb-6 tracking-tighter relative">
                    <span className="text-neon-green">BULL</span> vs <span className="text-neon-red">BEAR</span>
                    <br />
                    <span className="text-white">ROYALE</span>
                </h1>

                <p className="text-xl text-theme-text-muted mb-12 leading-relaxed animate-slideUpFade" style={{ animationDelay: '0.2s' }}>
                    Master the market in this high-stakes trading simulation.
                    Analyze trends, manage risk, and outsmart the competition
                    to become the ultimate tycoon.
                </p>

                <div className="space-y-4 animate-slideUpFade" style={{ animationDelay: '0.4s' }}>
                    <button
                        onClick={onContinue}
                        className="bg-neon-blue text-black font-bold text-xl py-4 px-12 rounded-full hover:bg-white hover:scale-105 transition-all duration-300 shadow-[0_0_30px_rgba(0,243,255,0.4)]"
                    >
                        ENTER MARKET
                    </button>

                    <div className="text-sm text-gray-500 mt-8">
                        v1.0.0 • 5 Rounds • 5 Min Duration
                    </div>
                </div>
            </div>
        </div>
    );
};
