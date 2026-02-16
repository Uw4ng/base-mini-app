'use client';

import { useState, useEffect } from 'react';
import type { DailyQuestion as DQType, PollOption } from '@/lib/db';
import ProgressBar from '../ui/ProgressBar';

interface DailyQuestionProps {
    question?: DQType | null;
}

export default function DailyQuestion({ question }: DailyQuestionProps) {
    const [voted, setVoted] = useState<string | null>(null);
    const [counts, setCounts] = useState<Record<string, number>>({});
    const [total, setTotal] = useState(0);
    const [dq, setDq] = useState<DQType | null>(question || null);

    useEffect(() => {
        if (question) {
            setDq(question);
            const initialCounts: Record<string, number> = {};
            question.options.forEach((opt: PollOption) => {
                initialCounts[opt.id] = Math.floor(Math.random() * 50) + 10;
            });
            const t = Object.values(initialCounts).reduce((a, b) => a + b, 0);
            setCounts(initialCounts);
            setTotal(t);
        }
    }, [question]);

    if (!dq) return null;

    const handleVote = (optionId: string) => {
        if (voted) return;
        setVoted(optionId);
        setCounts(prev => ({ ...prev, [optionId]: (prev[optionId] || 0) + 1 }));
        setTotal(prev => prev + 1);
    };

    return (
        <div
            className="relative overflow-hidden"
            style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-5)',
            }}
        >
            {/* Decorative glow */}
            <div
                className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl"
                style={{ background: 'var(--accent-purple)', opacity: 0.06 }}
            />

            {/* Header */}
            <div className="flex items-center" style={{ gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                <span className="text-lg">🌟</span>
                <div className="flex items-center" style={{ gap: 'var(--space-2)' }}>
                    <span
                        className="text-[11px] font-bold uppercase tracking-wider"
                        style={{ color: 'var(--accent-purple)' }}
                    >
                        Daily Question
                    </span>
                    <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                        {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                </div>
            </div>

            {/* Question */}
            <h3 className="text-poll-question" style={{ marginBottom: 'var(--space-3)' }}>{dq.question}</h3>

            {/* Options */}
            <div className="flex flex-col" style={{ gap: 'var(--space-2)' }}>
                {dq.options.map((option: PollOption, index: number) => {
                    const pct = total > 0 ? ((counts[option.id] || 0) / total) * 100 : 0;

                    return voted ? (
                        <ProgressBar
                            key={option.id}
                            percentage={pct}
                            optionIndex={index}
                            label={`${voted === option.id ? '✓ ' : ''}${option.text}`}
                            isSelected={voted === option.id}
                        />
                    ) : (
                        <button
                            key={option.id}
                            onClick={() => handleVote(option.id)}
                            className="poll-option w-full text-left text-option touch-target"
                            aria-label={`Vote for ${option.text}`}
                        >
                            {option.text}
                        </button>
                    );
                })}
            </div>

            {/* Vote count */}
            <div className="text-right" style={{ marginTop: 'var(--space-2)' }}>
                <span className="text-metadata tabular-nums">{total} votes today</span>
            </div>
        </div>
    );
}
