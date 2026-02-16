'use client';

import { useState } from 'react';
import type { PollOption } from '@/lib/db';

interface ThisOrThatProps {
    options: PollOption[];
    voteCounts?: Record<string, number>;
    totalVotes?: number;
    voted?: string | null;
    onVote?: (optionId: string) => void;
}

export default function ThisOrThat({
    options,
    voteCounts = {},
    totalVotes = 0,
    voted = null,
    onVote,
}: ThisOrThatProps) {
    const [selected, setSelected] = useState(voted);
    const [animating, setAnimating] = useState(false);
    const showResults = selected !== null;

    const optionA = options[0];
    const optionB = options[1];

    const handleVote = (optionId: string) => {
        if (selected || animating) return;
        setAnimating(true);
        setSelected(optionId);
        onVote?.(optionId);
        setTimeout(() => setAnimating(false), 600);
    };

    const getPct = (optionId: string) => {
        if (totalVotes === 0) return 50;
        return ((voteCounts[optionId] || 0) / totalVotes) * 100;
    };

    const pctA = getPct(optionA?.id || '');
    const pctB = getPct(optionB?.id || '');

    if (!optionA || !optionB) return null;

    return (
        <div className="relative">
            <div className="grid grid-cols-2" style={{ gap: 0 }}>
                {/* Option A */}
                <button
                    onClick={() => handleVote(optionA.id)}
                    disabled={!!selected}
                    className="relative overflow-hidden transition-all touch-target"
                    style={{
                        height: '120px',
                        borderTopLeftRadius: 'var(--radius-sm)',
                        borderBottomLeftRadius: 'var(--radius-sm)',
                        background: showResults
                            ? `linear-gradient(to right, rgba(59, 130, 246, ${pctA / 100 * 0.3}), rgba(59, 130, 246, 0.05))`
                            : 'linear-gradient(135deg, #1e3a5f 0%, #1a2744 100%)',
                        border: selected === optionA.id ? '2px solid var(--accent-blue)' : '1px solid var(--border-subtle)',
                        opacity: selected === optionB.id ? 0.6 : 1,
                        transform: selected === optionA.id ? 'scale(1.02)' : 'scale(1)',
                    }}
                    aria-label={`Choose ${optionA.text}`}
                >
                    <div className="relative z-10 h-full flex flex-col items-center justify-center" style={{ padding: 'var(--space-3)' }}>
                        <span className="text-[16px] font-semibold text-center leading-tight" style={{ color: 'var(--text-primary)' }}>
                            {optionA.text}
                        </span>
                        {showResults && (
                            <div className="animate-scale-in" style={{ marginTop: 'var(--space-2)' }}>
                                <span className="text-stat-number tabular-nums" style={{ color: 'var(--accent-blue)' }}>
                                    {Math.round(pctA)}%
                                </span>
                                <div className="text-[11px] tabular-nums" style={{ color: 'var(--text-tertiary)' }}>
                                    {voteCounts[optionA.id] || 0} votes
                                </div>
                            </div>
                        )}
                    </div>
                </button>

                {/* Option B */}
                <button
                    onClick={() => handleVote(optionB.id)}
                    disabled={!!selected}
                    className="relative overflow-hidden transition-all touch-target"
                    style={{
                        height: '120px',
                        borderTopRightRadius: 'var(--radius-sm)',
                        borderBottomRightRadius: 'var(--radius-sm)',
                        background: showResults
                            ? `linear-gradient(to left, rgba(139, 92, 246, ${pctB / 100 * 0.3}), rgba(139, 92, 246, 0.05))`
                            : 'linear-gradient(135deg, #2d1b4e 0%, #1a1530 100%)',
                        border: selected === optionB.id ? '2px solid var(--accent-purple)' : '1px solid var(--border-subtle)',
                        opacity: selected === optionA.id ? 0.6 : 1,
                        transform: selected === optionB.id ? 'scale(1.02)' : 'scale(1)',
                    }}
                    aria-label={`Choose ${optionB.text}`}
                >
                    <div className="relative z-10 h-full flex flex-col items-center justify-center" style={{ padding: 'var(--space-3)' }}>
                        <span className="text-[16px] font-semibold text-center leading-tight" style={{ color: 'var(--text-primary)' }}>
                            {optionB.text}
                        </span>
                        {showResults && (
                            <div className="animate-scale-in" style={{ marginTop: 'var(--space-2)' }}>
                                <span className="text-stat-number tabular-nums" style={{ color: 'var(--accent-purple)' }}>
                                    {Math.round(pctB)}%
                                </span>
                                <div className="text-[11px] tabular-nums" style={{ color: 'var(--text-tertiary)' }}>
                                    {voteCounts[optionB.id] || 0} votes
                                </div>
                            </div>
                        )}
                    </div>
                </button>
            </div>

            {/* OR pill */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                <div
                    className={`flex items-center justify-center font-bold text-[13px] ${animating ? 'animate-scale-in' : ''}`}
                    style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: 'var(--bg-primary)',
                        border: '2px solid var(--border-default)',
                        color: 'var(--text-secondary)',
                    }}
                >
                    OR
                </div>
            </div>
        </div>
    );
}
