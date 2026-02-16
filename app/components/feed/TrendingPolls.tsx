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
            <div className="mb-4">
                <div className="flex items-center gap-2 mb-3 px-1">
                    <span>🔥</span>
                    <span className="text-sm font-bold">Trending</span>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex-shrink-0 w-48 h-24 glass rounded-xl animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    if (polls.length === 0) return null;

    const trendingColors = [
        'from-violet-600/20 to-purple-900/20',
        'from-pink-600/20 to-rose-900/20',
        'from-blue-600/20 to-indigo-900/20',
        'from-emerald-600/20 to-green-900/20',
        'from-amber-600/20 to-orange-900/20',
    ];

    return (
        <div className="mb-4">
            <div className="flex items-center gap-2 mb-3 px-1">
                <span>🔥</span>
                <span className="text-sm font-bold">Trending</span>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1" style={{ scrollbarWidth: 'none' }}>
                {polls.map((poll, index) => (
                    <button
                        key={poll.id}
                        onClick={() => onPollClick?.(poll.id)}
                        className={`flex-shrink-0 w-52 p-3 rounded-xl bg-gradient-to-br ${trendingColors[index % trendingColors.length]} border border-foreground/5 text-left transition-all hover:scale-[1.02] active:scale-[0.98]`}
                        style={{ animationDelay: `${index * 0.1}s` }}
                    >
                        <div className="text-xs text-muted mb-1.5">
                            @{poll.creator_username}
                        </div>
                        <div className="text-sm font-semibold leading-tight line-clamp-2 mb-2">
                            {poll.question}
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] text-muted">{poll.total_votes} votes</span>
                            <span className="text-[10px] text-accent-light font-medium">
                                {poll.options.length} options
                            </span>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
