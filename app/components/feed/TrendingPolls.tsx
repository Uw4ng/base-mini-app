'use client';

import { useEffect, useState } from 'react';
import type { Poll } from '@/lib/db';

interface TrendingPollsProps {
    polls?: Poll[];
    onPollClick?: (pollId: string) => void;
}

export default function TrendingPolls({ polls: initialPolls, onPollClick }: TrendingPollsProps) {
    const [polls, setPolls] = useState<Poll[]>(initialPolls || []);
    const [loading, setLoading] = useState(!initialPolls);

    useEffect(() => {
        if (initialPolls) return;

        async function fetchTrending() {
            try {
                const res = await fetch('/api/polls?trending=true');
                const data = await res.json();
                setPolls(data.polls || []);
            } catch (error) {
                console.error('Failed to fetch trending:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchTrending();
    }, [initialPolls]);

    if (loading) {
        return (
            <div style={{ marginBottom: 'var(--space-4)' }}>
                <div className="flex items-center" style={{ gap: 'var(--space-2)', marginBottom: 'var(--space-3)', paddingLeft: 'var(--space-1)' }}>
                    <span>🔥</span>
                    <span className="text-[14px] font-bold">Trending</span>
                </div>
                <div className="flex overflow-x-auto" style={{ gap: 'var(--space-3)', paddingBottom: 'var(--space-2)', scrollbarWidth: 'none' }}>
                    {[1, 2, 3].map(i => (
                        <div key={i} className="skeleton flex-shrink-0" style={{ width: '208px', height: '96px', borderRadius: 'var(--radius-md)' }} />
                    ))}
                </div>
            </div>
        );
    }

    if (polls.length === 0) return null;

    const accentColors = [
        { bg: 'rgba(59, 130, 246, 0.08)', border: 'rgba(59, 130, 246, 0.15)' },
        { bg: 'rgba(139, 92, 246, 0.08)', border: 'rgba(139, 92, 246, 0.15)' },
        { bg: 'rgba(245, 158, 11, 0.08)', border: 'rgba(245, 158, 11, 0.15)' },
        { bg: 'rgba(34, 197, 94, 0.08)', border: 'rgba(34, 197, 94, 0.15)' },
        { bg: 'rgba(239, 68, 68, 0.08)', border: 'rgba(239, 68, 68, 0.15)' },
    ];

    return (
        <div style={{ marginBottom: 'var(--space-4)' }}>
            <div className="flex items-center" style={{ gap: 'var(--space-2)', marginBottom: 'var(--space-3)', paddingLeft: 'var(--space-1)' }}>
                <span>🔥</span>
                <span className="text-[14px] font-bold">Trending</span>
            </div>
            <div className="flex overflow-x-auto" style={{ gap: 'var(--space-3)', paddingBottom: 'var(--space-2)', scrollbarWidth: 'none' }}>
                {polls.map((poll, index) => {
                    const color = accentColors[index % accentColors.length];
                    return (
                        <button
                            key={poll.id}
                            onClick={() => onPollClick?.(poll.id)}
                            className="flex-shrink-0 text-left transition-all touch-target animate-fade-in"
                            style={{
                                width: '208px',
                                padding: 'var(--space-3)',
                                borderRadius: 'var(--radius-md)',
                                background: color.bg,
                                border: `1px solid ${color.border}`,
                                animationDelay: `${index * 100}ms`,
                            }}
                            aria-label={`View poll: ${poll.question}`}
                        >
                            <div className="text-metadata" style={{ marginBottom: 'var(--space-1)' }}>
                                @{poll.creator_username}
                            </div>
                            <div
                                className="text-[14px] font-semibold leading-tight overflow-hidden"
                                style={{
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    color: 'var(--text-primary)',
                                    marginBottom: 'var(--space-2)',
                                }}
                            >
                                {poll.question}
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] tabular-nums" style={{ color: 'var(--text-tertiary)' }}>
                                    {poll.total_votes} votes
                                </span>
                                <span className="text-[11px] font-medium" style={{ color: 'var(--accent-blue)' }}>
                                    {poll.options.length} options
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
