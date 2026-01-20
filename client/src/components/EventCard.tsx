import React from 'react';
import { MarketEvent } from '@bvb/shared';

interface EventCardProps {
    event: MarketEvent | null;
    isPopup?: boolean;
}

export const EventCard: React.FC<EventCardProps> = ({ event, isPopup = false }) => {
    if (!event) {
        return (
            <div className="bg-theme-surface rounded p-4 border border-gray-800 h-48 flex items-center justify-center opacity-50">
                <div className="text-sm text-theme-text-muted italic">
                    📊 Waiting for market news...
                </div>
            </div>
        );
    }

    // Determine sentiment color
    const getSentimentColor = () => {
        if (event.sentiment === 'positive') return 'border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.4)]';
        if (event.sentiment === 'negative') return 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]';
        return 'border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.4)]';
    };

    const getHeaderColor = () => {
        if (event.sentiment === 'positive') return 'bg-green-600';
        if (event.sentiment === 'negative') return 'bg-red-600';
        return 'bg-yellow-600';
    };

    return (
        <div className={`bg-theme-surface rounded overflow-hidden border-2 ${getSentimentColor()}`}>
            {/* Breaking News Header */}
            <div className={`${getHeaderColor()} text-white px-2 py-1.5 flex justify-between items-center`}>
                <div className="flex items-center gap-1">
                    <span className="animate-pulse">🔴</span>
                    <span className="font-bold uppercase tracking-wider text-xs">BREAKING NEWS</span>
                </div>
                <span className="text-[10px] font-mono bg-black/30 px-1.5 py-0.5 rounded">{new Date().toLocaleTimeString()}</span>
            </div>

            <div className="p-3 relative">
                {/* Large Emoji Background */}
                <div className="absolute top-1 right-1 text-4xl opacity-15">
                    {event.emoji || '📢'}
                </div>

                {/* Title */}
                <h3 className={`font-bold text-white mb-2 leading-tight relative z-10 ${isPopup ? 'text-xl' : 'text-base'}`}>
                    {event.title}
                </h3>

                {/* Description */}
                <p className={`text-gray-300 mb-3 relative z-10 border-l-2 ${event.sentiment === 'positive' ? 'border-green-500' : event.sentiment === 'negative' ? 'border-red-500' : 'border-yellow-500'} pl-2 ${isPopup ? 'text-sm' : 'text-xs'}`}>
                    {event.description}
                </p>

                {/* Sentiment & Duration Badges */}
                <div className="flex flex-wrap gap-1.5 mb-2">
                    <div className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                        event.sentiment === 'positive' ? 'bg-green-900/60 text-green-300 border border-green-600' : 
                        event.sentiment === 'negative' ? 'bg-red-900/60 text-red-300 border border-red-600' : 
                        'bg-yellow-900/60 text-yellow-300 border border-yellow-600'
                    }`}>
                        {event.sentiment === 'positive' ? '📈 BULLISH' : event.sentiment === 'negative' ? '📉 BEARISH' : '➡️ NEUTRAL'}
                    </div>
                    {event.momentum_rounds && (
                        <div className="px-2 py-1 rounded text-xs font-bold uppercase bg-blue-900/60 text-blue-300 border border-blue-600">
                            ⏱️ {event.momentum_rounds}R
                        </div>
                    )}
                </div>

                {/* Trading Hint */}
                {event.hint && (
                    <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 p-2 rounded border border-blue-700/50 text-xs text-blue-200 flex gap-1.5 items-start mb-2">
                        <span>💡</span>
                        <span className="font-medium leading-tight">{event.hint}</span>
                    </div>
                )}

                {/* Affected Sectors */}
                <div className="flex flex-wrap gap-1">
                    {event.sectors && event.sectors.map(sector => (
                        <span key={sector} className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                            event.sentiment === 'positive' ? 'bg-green-900/40 border border-green-700 text-green-300' :
                            event.sentiment === 'negative' ? 'bg-red-900/40 border border-red-700 text-red-300' :
                            'bg-yellow-900/40 border border-yellow-700 text-yellow-300'
                        }`}>
                            {sector}
                        </span>
                    ))}
                </div>
            </div>

            {/* Ticker Tape Effect */}
            <div className={`${getHeaderColor()} py-0.5 overflow-hidden whitespace-nowrap`}>
                <div className="inline-block animate-marquee text-[10px] font-mono text-white/90">
                    {event.sentiment === 'positive' 
                        ? '📈 BUY SIGNAL • BULLISH • PRICES UP • 📈 BUY SIGNAL • BULLISH • PRICES UP •'
                        : event.sentiment === 'negative'
                        ? '📉 SELL ALERT • BEARISH • PROTECT PROFITS • 📉 SELL ALERT • BEARISH •'
                        : '📊 MIXED SIGNALS • TRADE CAREFULLY • 📊 MIXED SIGNALS • TRADE CAREFULLY •'
                    }
                </div>
            </div>
        </div>
    );
};
