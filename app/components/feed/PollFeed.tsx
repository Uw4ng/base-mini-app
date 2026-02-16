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
            <div className="flex flex-col" style={{ gap: 'var(--space-6)' }}>
                {[1, 2, 3].map(i => (
                    <div key={i} className="poll-card">
                        <div className="flex items-center" style={{ gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                            <div className="skeleton" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                            <div className="skeleton" style={{ width: '96px', height: '16px' }} />
                        </div>
                        <div className="skeleton" style={{ width: '75%', height: '20px', marginBottom: 'var(--space-3)' }} />
                        <div className="flex flex-col" style={{ gap: 'var(--space-2)' }}>
                            <div className="skeleton" style={{ height: '48px', borderRadius: 'var(--radius-sm)' }} />
                            <div className="skeleton" style={{ height: '48px', borderRadius: 'var(--radius-sm)' }} />
                            <div className="skeleton" style={{ height: '48px', borderRadius: 'var(--radius-sm)' }} />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (polls.length === 0) {
        return (
            <div className="text-center animate-fade-in" style={{ padding: 'var(--space-8) 0' }}>
                <div className="text-4xl" style={{ marginBottom: 'var(--space-3)' }}>📊</div>
                <h3 className="text-[18px] font-bold" style={{ marginBottom: 'var(--space-1)' }}>No polls yet</h3>
                <p className="text-metadata">Be the first to create one!</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col" style={{ gap: 'var(--space-6)' }}>
            {polls.map((poll, index) => (
                <div
                    key={poll.id}
                    className="animate-slide-down"
                    style={{ animationDelay: `${index * 50}ms` }}
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
