'use client';

import { useState } from 'react';
import type { PollOption } from '@/lib/db';

interface ImagePollProps {
    options: PollOption[];
    voteCounts?: Record<string, number>;
    totalVotes?: number;
    voted?: string | null;
    onVote?: (optionId: string) => void;
}

const OPTION_COLORS = ['var(--option-1)', 'var(--option-2)', 'var(--option-3)', 'var(--option-4)'];

export default function ImagePoll({
    options,
    voteCounts = {},
    totalVotes = 0,
    voted = null,
    onVote,
}: ImagePollProps) {
    const [selected, setSelected] = useState(voted);
    const showResults = selected !== null;

    const handleVote = (optionId: string) => {
        if (selected) return;
        setSelected(optionId);
        onVote?.(optionId);
    };

    const getPercentage = (optionId: string) => {
        if (totalVotes === 0) return 50;
        return ((voteCounts[optionId] || 0) / totalVotes) * 100;
    };

    const gradients = [
        'linear-gradient(135deg, #1e3a5f, #142440)',
        'linear-gradient(135deg, #3d1b5e, #261040)',
        'linear-gradient(135deg, #4a3000, #302000)',
        'linear-gradient(135deg, #0f3d1f, #0a2814)',
    ];

    return (
        <div className="grid grid-cols-2" style={{ gap: 'var(--space-2)' }}>
            {options.map((option, index) => {
                const pct = getPercentage(option.id);
                const isSelected = selected === option.id;

                return (
                    <button
                        key={option.id}
                        onClick={() => handleVote(option.id)}
                        className="relative overflow-hidden aspect-square transition-all touch-target"
                        style={{
                            borderRadius: 'var(--radius-sm)',
                            border: isSelected ? `3px solid var(--accent-blue)` : '1px solid var(--border-subtle)',
                            opacity: selected && !isSelected ? 0.6 : 1,
                        }}
                        disabled={!!selected}
                        aria-label={`Vote for ${option.text}`}
                    >
                        {/* Background gradient placeholder */}
                        <div
                            className="absolute inset-0 flex items-center justify-center"
                            style={{ background: gradients[index % gradients.length] }}
                        >
                            <span className="text-3xl">🖼️</span>
                        </div>

                        {/* Bottom label */}
                        <div
                            className="absolute bottom-0 left-0 right-0"
                            style={{
                                background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                                padding: 'var(--space-3)',
                                paddingTop: 'var(--space-8)',
                            }}
                        >
                            <span className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                                {option.text}
                            </span>
                            {showResults && (
                                <div style={{ marginTop: 'var(--space-1)' }}>
                                    {/* Frosted percentage overlay */}
                                    <div
                                        className="overflow-hidden"
                                        style={{
                                            height: '4px',
                                            borderRadius: 'var(--radius-full)',
                                            background: 'rgba(255,255,255,0.15)',
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: `${pct}%`,
                                                height: '100%',
                                                borderRadius: 'var(--radius-full)',
                                                background: OPTION_COLORS[index % OPTION_COLORS.length],
                                                transition: 'width 600ms ease-out',
                                            }}
                                        />
                                    </div>
                                    <span className="text-[12px] font-semibold tabular-nums" style={{ color: 'rgba(255,255,255,0.8)' }}>
                                        {Math.round(pct)}%
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Selected checkmark */}
                        {isSelected && (
                            <div
                                className="absolute animate-scale-in flex items-center justify-center"
                                style={{
                                    top: 'var(--space-2)',
                                    right: 'var(--space-2)',
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '50%',
                                    background: 'var(--accent-blue)',
                                }}
                            >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            </div>
                        )}
                    </button>
                );
            })}
        </div>
    );
}
