import React, { useState, useEffect } from 'react';
import { FINANCIAL_TERMS, FinancialTerm } from '../data/financialTerms';

export const FinancialTermCard: React.FC = () => {
    const [currentTerm, setCurrentTerm] = useState<FinancialTerm | null>(null);

    useEffect(() => {
        // Pick a random term on mount
        const pickRandomTerm = () => {
            const randomIndex = Math.floor(Math.random() * FINANCIAL_TERMS.length);
            setCurrentTerm(FINANCIAL_TERMS[randomIndex]);
        };

        pickRandomTerm();

        // Optional: Rotate every 60 seconds
        const interval = setInterval(pickRandomTerm, 60000);
        return () => clearInterval(interval);
    }, []);

    if (!currentTerm) return null;

    return (
        <div className="bg-gray-900 rounded p-4 border border-gray-800 flex flex-col h-full">
            <h2 className="text-lg font-bold mb-4 text-neon-blue flex items-center gap-2">
                <span>🎓</span> Financial Term
            </h2>

            <div className="flex-1 flex flex-col">
                <div className="mb-2">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider border border-gray-700 px-2 py-0.5 rounded">
                        {currentTerm.category}
                    </span>
                </div>

                <h3 className="text-xl font-bold text-white mb-3 text-shadow-neon">
                    {currentTerm.term}
                </h3>

                <p className="text-sm text-gray-300 leading-relaxed italic border-l-2 border-neon-green pl-3">
                    "{currentTerm.definition}"
                </p>
            </div>
        </div>
    );
};
