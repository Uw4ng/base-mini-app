'use client';

import { useState, useEffect } from 'react';
import type { PollOption } from '@/lib/db';
import ProgressBar from '../ui/ProgressBar';

interface DailyQuestionData {
    question: {
        id: string;
        question: string;
        options: PollOption[];
        active_date: string;
    };
    voteCounts: Record<string, number>;
    totalVotes: number;
    userVotedOptionId: string | null;
}

interface DailyQuestionProps {
    data?: DailyQuestionData | null;
}

export default function DailyQuestion({ data: initialData }: DailyQuestionProps) {
    const [data, setData] = useState<DailyQuestionData | null>(initialData || null);
    const [voted, setVoted] = useState<string | null>(initialData?.userVotedOptionId || null);
    const [localCounts, setLocalCounts] = useState<Record<string, number>>(initialData?.voteCounts || {});
    const [localTotal, setLocalTotal] = useState(initialData?.totalVotes || 0);
    const [loading, setLoading] = useState(!initialData);

    useEffect(() => {
        if (initialData) {
            setData(initialData);
            setLocalCounts(initialData.voteCounts);
            setLocalTotal(initialData.totalVotes);
            setVoted(initialData.userVotedOptionId);
            return;
        }

        async function fetchDQ() {
            try {
                const res = await fetch('/api/daily?fid=9999');
                const d = await res.json();
                if (d.question) {
                    setData(d);
                    setLocalCounts(d.voteCounts);
                    setLocalTotal(d.totalVotes);
                    setVoted(d.userVotedOptionId);
                }
            } catch (err) {
                console.error('Failed to fetch daily question:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchDQ();
    }, [initialData]);

    if (loading) {
        return (
            <div className="poll-card" style={{ borderLeft: '3px solid var(--accent-purple)' }}>
                <div className="skeleton" style={{ width: '120px', height: '14px', marginBottom: 'var(--space-2)' }} />
                <div className="skeleton" style={{ width: '80%', height: '20px', marginBottom: 'var(--space-3)' }} />
                <div className="flex flex-col" style={{ gap: 'var(--space-2)' }}>
                    <div className="skeleton" style={{ height: '48px' }} />
                    <div className="skeleton" style={{ height: '48px' }} />
                </div>
            </div>
        );
    }

    if (!data) return null;

    const handleVote = async (optionId: string) => {
        if (voted) return;
        setVoted(optionId);
        setLocalCounts(prev => ({ ...prev, [optionId]: (prev[optionId] || 0) + 1 }));
        setLocalTotal(prev => prev + 1);

        try {
            const res = await fetch('/api/daily', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ optionId, voterFid: 9999, voterUsername: 'quickpoll.dev' }),
            });
            const result = await res.json();
            if (result.voteCounts) {
                setLocalCounts(result.voteCounts);
                setLocalTotal(result.totalVotes);
            }
        } catch (err) {
            console.error('Failed to vote on daily question:', err);
        }
    };

    const getWinnerId = () => {
        let maxCount = 0;
        let winnerId = '';
        for (const [id, count] of Object.entries(localCounts)) {
            if (count > maxCount) {
                maxCount = count;
                winnerId = id;
            }
        }
        return winnerId;
    };

    const winnerId = voted ? getWinnerId() : '';

    return (
        <div
            className="poll-card relative overflow-hidden animate-fade-in"
            style={{ borderLeft: '3px solid var(--accent-purple)' }}
        >
            {/* Decorative glow */}
            <div
                className="absolute -top-16 -right-16 w-32 h-32 rounded-full blur-3xl"
                style={{ background: 'var(--accent-purple)', opacity: 0.06, pointerEvents: 'none' }}
            />

            {/* Header */}
            <div className="flex items-center" style={{ gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                <span className="text-base">✨</span>
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

            {/* Question */}
            <h3 className="text-poll-question" style={{ marginBottom: 'var(--space-3)' }}>
                {data.question.question}
            </h3>

            {/* Options */}
            <div className="flex flex-col" style={{ gap: 'var(--space-2)' }}>
                {data.question.options.map((option: PollOption, index: number) => {
                    const pct = localTotal > 0 ? ((localCounts[option.id] || 0) / localTotal) * 100 : 0;

                    return voted ? (
                        <ProgressBar
                            key={option.id}
                            percentage={pct}
                            optionIndex={index}
                            label={option.text}
                            isSelected={voted === option.id}
                            isWinner={winnerId === option.id}
                            voteCount={localCounts[option.id] || 0}
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
                <span className="text-metadata tabular-nums">{localTotal} votes today</span>
            </div>
        </div>
    );
}
