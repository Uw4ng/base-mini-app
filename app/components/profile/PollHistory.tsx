'use client';

import type { Poll } from '@/lib/db';
import { timeAgo } from '@/lib/farcaster';

interface PollHistoryProps {
    polls: Poll[];
    onPollClick?: (pollId: string) => void;
}

export default function PollHistory({ polls, onPollClick }: PollHistoryProps) {
    if (polls.length === 0) {
        return (
            <div className="text-center" style={{ padding: 'var(--space-8) 0' }}>
                <div className="text-3xl" style={{ marginBottom: 'var(--space-2)' }}>📋</div>
                <p className="text-metadata">No polls created yet</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col" style={{ gap: 'var(--space-2)' }}>
            <h3 className="text-[13px] font-bold" style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>
                Your Polls
            </h3>
            {polls.map((poll, index) => {
                const isExpired = poll.expires_at ? new Date(poll.expires_at) < new Date() : false;

                return (
                    <button
                        key={poll.id}
                        onClick={() => onPollClick?.(poll.id)}
                        className="w-full text-left transition-all touch-target animate-slide-down"
                        style={{
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: 'var(--radius-md)',
                            padding: 'var(--space-3)',
                            animationDelay: `${index * 50}ms`,
                        }}
                    >
                        <div className="flex items-start justify-between" style={{ gap: 'var(--space-2)' }}>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-[14px] font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                                    {poll.question}
                                </h4>
                                <div className="flex items-center" style={{ gap: 'var(--space-2)', marginTop: 'var(--space-1)' }}>
                                    <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>{timeAgo(poll.created_at)}</span>
                                    <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>•</span>
                                    <span className="text-[11px] tabular-nums" style={{ color: 'var(--text-tertiary)' }}>{poll.total_votes} votes</span>
                                    {poll.is_onchain && (
                                        <>
                                            <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>•</span>
                                            <span className="text-[11px]" style={{ color: 'var(--accent-purple)' }}>⛓ On-chain</span>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div
                                className="text-[11px] font-medium"
                                style={{
                                    padding: '2px 8px',
                                    borderRadius: 'var(--radius-full)',
                                    background: isExpired ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                                    color: isExpired ? 'var(--accent-red)' : 'var(--accent-green)',
                                }}
                            >
                                {isExpired ? 'Ended' : 'Active'}
                            </div>
                        </div>
                    </button>
                );
            })}
        </div>
    );
}
