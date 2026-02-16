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
            <div className="text-center py-8">
                <div className="text-3xl mb-2">📋</div>
                <p className="text-sm text-muted">No polls created yet</p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <h3 className="text-sm font-bold text-muted mb-3">Your Polls</h3>
            {polls.map(poll => {
                const isExpired = poll.expires_at ? new Date(poll.expires_at) < new Date() : false;

                return (
                    <button
                        key={poll.id}
                        onClick={() => onPollClick?.(poll.id)}
                        className="w-full text-left glass rounded-xl p-3 transition-all hover:bg-card-hover active:scale-[0.98]"
                    >
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-semibold truncate">{poll.question}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] text-muted">{timeAgo(poll.created_at)}</span>
                                    <span className="text-[10px] text-muted">•</span>
                                    <span className="text-[10px] text-muted">{poll.total_votes} votes</span>
                                    {poll.is_onchain && (
                                        <>
                                            <span className="text-[10px] text-muted">•</span>
                                            <span className="text-[10px] text-accent-light">⛓ On-chain</span>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${isExpired ? 'bg-danger/10 text-danger' : 'bg-success/10 text-success'}`}>
                                {isExpired ? 'Ended' : 'Active'}
                            </div>
                        </div>
                    </button>
                );
            })}
        </div>
    );
}
