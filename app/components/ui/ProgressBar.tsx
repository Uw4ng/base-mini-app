'use client';

import { useEffect, useState } from 'react';

interface ProgressBarProps {
    percentage: number;
    optionIndex?: number;
    label?: string;
    animate?: boolean;
    showPercentage?: boolean;
    isSelected?: boolean;
    isWinner?: boolean;
    voteCount?: number;
}

const OPTION_COLORS = [
    'var(--option-1)',
    'var(--option-2)',
    'var(--option-3)',
    'var(--option-4)',
];

export default function ProgressBar({
    percentage,
    optionIndex = 0,
    label,
    animate = true,
    showPercentage = true,
    isSelected = false,
    isWinner = false,
    voteCount,
}: ProgressBarProps) {
    const [width, setWidth] = useState(animate ? 0 : percentage);

    useEffect(() => {
        if (animate) {
            const timer = setTimeout(() => setWidth(percentage), 50 + optionIndex * 100);
            return () => clearTimeout(timer);
        }
    }, [percentage, animate, optionIndex]);

    const color = OPTION_COLORS[optionIndex % OPTION_COLORS.length];

    return (
        <div
            className={`poll-result ${isSelected ? 'poll-result-selected' : ''}`}
            style={{
                borderLeftColor: isSelected ? color : 'transparent',
            }}
        >
            {/* Fill bar */}
            <div
                className="poll-result-fill"
                style={{
                    width: `${Math.max(width, 0)}%`,
                    background: color,
                    opacity: 0.15,
                    transitionDelay: animate ? `${optionIndex * 100}ms` : '0ms',
                }}
            />

            {/* Content */}
            <div className="relative z-10 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                    {isWinner && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    )}
                    <span className="text-option truncate">{label}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    {voteCount !== undefined && (
                        <span className="text-metadata tabular-nums">{voteCount}</span>
                    )}
                    {showPercentage && (
                        <span className="text-[15px] font-semibold tabular-nums animate-count-up" style={{ color }}>
                            {Math.round(percentage)}%
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
