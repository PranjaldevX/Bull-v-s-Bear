import React from 'react';

interface RiskMeterProps {
    score: number;
}

export const RiskMeter: React.FC<RiskMeterProps> = ({ score }) => {
    let color = 'bg-green-500';
    let label = 'Low Risk';

    if (score > 30) {
        color = 'bg-yellow-500';
        label = 'Medium Risk';
    }
    if (score > 60) {
        color = 'bg-red-500';
        label = 'High Risk';
    }
    if (score > 80) {
        color = 'bg-purple-500';
        label = 'YOLO Mode';
    }

    return (
        <div className="bg-gray-800 rounded p-4 border border-gray-700">
            <h2 className="text-lg font-bold mb-2 text-gray-300">Risk Meter</h2>
            <div className="relative h-6 bg-gray-700 rounded-full overflow-hidden">
                <div
                    className={`absolute top-0 left-0 h-full ${color} transition-all duration-500`}
                    style={{ width: `${Math.min(100, score)}%` }}
                ></div>
            </div>
            <div className="flex justify-between mt-1 text-sm">
                <span className="text-gray-400">{score.toFixed(0)}/100</span>
                <span className={`font-bold ${color.replace('bg-', 'text-')}`}>{label}</span>
            </div>
        </div>
    );
};
