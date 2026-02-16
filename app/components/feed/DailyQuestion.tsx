'use client';

import { useState, useEffect } from 'react';
import type { DailyQuestion as DQType, PollOption } from '@/lib/db';
import ProgressBar from '../ui/ProgressBar';

const GRADIENTS = [
    'linear-gradient(135deg, #845EF7 0%, #B197FC 100%)',
    'linear-gradient(135deg, #E64980 0%, #F783AC 100%)',
    'linear-gradient(135deg, #51CF66 0%, #A9E34B 100%)',
    'linear-gradient(135deg, #339AF0 0%, #74C0FC 100%)',
];

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
            // Initialize counts
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
        <div className="relative overflow-hidden rounded-2xl p-4"
            style={{
                background: 'linear-gradient(135deg, #1a0e2e 0%, #0f1a2e 100%)',
                border: '1px solid rgba(132, 94, 247, 0.15)',
            }}
        >
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 blur-2xl"
                style={{ background: 'var(--accent-gradient)' }}
            />

            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">🌟</span>
                <div>
                    <span className="text-xs font-bold text-accent-light uppercase tracking-wider">
                        Daily Question
                    </span>
                    <span className="text-[10px] text-muted ml-2">
                        {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                </div>
            </div>

            {/* Question */}
            <h3 className="text-base font-bold mb-3 leading-snug">{dq.question}</h3>

            {/* Options */}
            <div className="space-y-2">
                {dq.options.map((option: PollOption, index: number) => {
                    const pct = total > 0 ? ((counts[option.id] || 0) / total) * 100 : 0;

                    return voted ? (
                        <ProgressBar
                            key={option.id}
                            percentage={pct}
                            color={GRADIENTS[index % GRADIENTS.length]}
                            label={`${voted === option.id ? '✓ ' : ''}${option.text}`}
                            height={34}
                        />
                    ) : (
                        <button
                            key={option.id}
                            onClick={() => handleVote(option.id)}
                            className="poll-option w-full text-left px-4 py-2.5 rounded-xl border border-foreground/10 bg-foreground/[0.03] hover:bg-foreground/[0.06] text-sm font-medium"
                        >
                            {option.text}
                        </button>
                    );
                })}
            </div>

            {/* Vote count */}
            <div className="text-xs text-muted mt-2 text-right">
                {total} votes today
            </div>
        </div>
    );
}
