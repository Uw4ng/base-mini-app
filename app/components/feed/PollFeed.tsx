'use client';

import { useEffect, useState } from 'react';
import PollCard from '../poll/PollCard';
import type { Poll } from '@/lib/db';

interface PollFeedProps {
    initialPolls?: (Poll & { voteCounts?: Record<string, number> })[];
}

export default function PollFeed({ initialPolls }: PollFeedProps) {
    const [polls, setPolls] = useState<(Poll & { voteCounts?: Record<string, number> })[]>(
        initialPolls || []
    );
    const [loading, setLoading] = useState(!initialPolls);

    useEffect(() => {
        if (initialPolls) return;

        async function fetchPolls() {
            try {
                const res = await fetch('/api/polls');
                const data = await res.json();
                setPolls(data.polls || []);
            } catch (error) {
                console.error('Failed to fetch polls:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchPolls();
    }, [initialPolls]);

    const handleVote = async (pollId: string, optionId: string) => {
        try {
            await fetch('/api/votes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    poll_id: pollId,
                    option_id: optionId,
                    voter_fid: 9999,
                    voter_username: 'quickpoll.dev',
                }),
            });
        } catch (error) {
            console.error('Failed to submit vote:', error);
        }
    };

    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="glass rounded-2xl p-4 space-y-3 animate-pulse">
                        <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-full bg-foreground/10" />
                            <div className="h-4 bg-foreground/10 rounded w-24" />
                        </div>
                        <div className="h-5 bg-foreground/10 rounded w-3/4" />
                        <div className="space-y-2">
                            <div className="h-10 bg-foreground/10 rounded-xl" />
                            <div className="h-10 bg-foreground/10 rounded-xl" />
                            <div className="h-10 bg-foreground/10 rounded-xl" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (polls.length === 0) {
        return (
            <div className="text-center py-16 animate-fade-in">
                <div className="text-4xl mb-3">📊</div>
                <h3 className="text-lg font-bold mb-1">No polls yet</h3>
                <p className="text-sm text-muted">Be the first to create one!</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {polls.map((poll, index) => (
                <div
                    key={poll.id}
                    style={{ animationDelay: `${index * 0.05}s` }}
                    className="animate-slide-down"
                >
                    <PollCard
                        poll={poll}
                        voteCounts={poll.voteCounts || {}}
                        onVote={handleVote}
                    />
                </div>
            ))}
        </div>
    );
}
