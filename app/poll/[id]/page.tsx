'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PollCard from '@/app/components/poll/PollCard';
import PollResults from '@/app/components/poll/PollResults';
import ThisOrThat from '@/app/components/poll/ThisOrThat';
import ResultCard from '@/app/components/poll/ResultCard';
import ReactionBar from '@/app/components/social/ReactionBar';
import ShareButton from '@/app/components/social/ShareButton';
import type { Poll } from '@/lib/db';

export default function PollDetailPage() {
    const params = useParams();
    const router = useRouter();
    const pollId = params.id as string;

    const [poll, setPoll] = useState<(Poll & { voteCounts?: Record<string, number> }) | null>(null);
    const [loading, setLoading] = useState(true);
    const [voted, setVoted] = useState<string | null>(null);
    const [showResultCard, setShowResultCard] = useState(false);

    const fetchPoll = useCallback(async () => {
        try {
            const res = await fetch('/api/polls');
            const data = await res.json();
            const found = data.polls?.find((p: Poll) => p.id === pollId);
            if (found) setPoll(found);
        } catch (error) {
            console.error('Failed to fetch poll:', error);
        } finally {
            setLoading(false);
        }
    }, [pollId]);

    useEffect(() => {
        fetchPoll();
    }, [fetchPoll]);

    const handleVote = async (pId: string, optionId: string) => {
        setVoted(optionId);
        try {
            const res = await fetch('/api/votes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    poll_id: pId,
                    option_id: optionId,
                    voter_fid: 9999,
                    voter_username: 'quickpoll.dev',
                }),
            });
            const data = await res.json();
            if (data.voteCounts && poll) {
                setPoll({ ...poll, voteCounts: data.voteCounts, total_votes: data.totalVotes });
            }
        } catch (error) {
            console.error('Vote failed:', error);
        }
    };

    if (loading) {
        return (
            <main className="min-h-screen max-w-lg mx-auto" style={{ padding: 'var(--space-4)' }}>
                <div className="poll-card">
                    <div className="flex items-center" style={{ gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                        <div className="skeleton" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                        <div className="skeleton" style={{ width: '96px', height: '14px' }} />
                    </div>
                    <div className="skeleton" style={{ width: '80%', height: '20px', marginBottom: 'var(--space-3)' }} />
                    <div className="flex flex-col" style={{ gap: 'var(--space-2)' }}>
                        <div className="skeleton" style={{ height: '48px' }} />
                        <div className="skeleton" style={{ height: '48px' }} />
                        <div className="skeleton" style={{ height: '48px' }} />
                    </div>
                </div>
            </main>
        );
    }

    if (!poll) {
        return (
            <main className="min-h-screen max-w-lg mx-auto flex items-center justify-center" style={{ padding: 'var(--space-4)' }}>
                <div className="text-center animate-fade-in">
                    <div className="text-4xl" style={{ marginBottom: 'var(--space-3)' }}>🤷</div>
                    <h2 className="text-[18px] font-bold" style={{ marginBottom: 'var(--space-1)' }}>Poll not found</h2>
                    <p className="text-metadata" style={{ marginBottom: 'var(--space-4)' }}>This poll may have been removed.</p>
                    <button
                        onClick={() => router.push('/')}
                        className="text-button touch-target"
                        style={{
                            padding: '12px 24px',
                            borderRadius: 'var(--radius-sm)',
                            background: 'var(--accent-blue)',
                            color: 'white',
                            border: 'none',
                        }}
                    >
                        Go back home
                    </button>
                </div>
            </main>
        );
    }

    const isExpired = poll.expires_at ? new Date(poll.expires_at) < new Date() : false;
    const hasVoted = voted !== null;

    return (
        <main className="min-h-screen max-w-lg mx-auto" style={{ paddingBottom: 'var(--space-8)' }}>
            {/* Header */}
            <header
                className="sticky top-0 z-40 flex items-center"
                style={{
                    background: 'rgba(10, 10, 10, 0.85)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    borderBottom: '1px solid var(--border-subtle)',
                    padding: 'var(--space-3) var(--space-4)',
                    gap: 'var(--space-3)',
                }}
            >
                <button
                    onClick={() => router.push('/')}
                    className="flex items-center justify-center transition-colors touch-target"
                    style={{
                        width: '32px', height: '32px',
                        borderRadius: '50%',
                        background: 'var(--bg-tertiary)',
                        border: 'none',
                    }}
                    aria-label="Go back"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                </button>
                <h1 className="text-[15px] font-bold flex-1">Poll Details</h1>
                <ShareButton pollId={poll.id} question={poll.question} />
            </header>

            <div className="flex flex-col" style={{ padding: 'var(--space-4)', gap: 'var(--space-4)' }}>
                {/* Poll */}
                {poll.poll_type === 'this_or_that' ? (
                    <div className="poll-card">
                        <div className="flex items-center" style={{ gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                            <div
                                className="rounded-full flex items-center justify-center text-sm font-semibold text-white"
                                style={{
                                    width: '32px', height: '32px',
                                    background: `hsl(${(poll.creator_fid * 137.508) % 360}, 55%, 50%)`,
                                }}
                            >
                                {poll.creator_username.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-[14px] font-semibold">{poll.creator_username}</span>
                        </div>
                        <h3 className="text-poll-question" style={{ marginBottom: 'var(--space-3)' }}>{poll.question}</h3>
                        <ThisOrThat
                            options={poll.options}
                            voteCounts={poll.voteCounts || {}}
                            totalVotes={poll.total_votes}
                            voted={voted}
                            onVote={(optionId) => handleVote(poll.id, optionId)}
                        />
                    </div>
                ) : (
                    <PollCard
                        poll={poll}
                        voteCounts={poll.voteCounts || {}}
                        userVotedOptionId={voted}
                        onVote={handleVote}
                    />
                )}

                {/* Full results */}
                {(hasVoted || isExpired) && (
                    <div className="poll-card">
                        <PollResults
                            question={poll.question}
                            options={poll.options}
                            voteCounts={poll.voteCounts || {}}
                            totalVotes={poll.total_votes}
                            userVotedOptionId={voted}
                        />
                    </div>
                )}

                {/* Reactions */}
                <div className="poll-card">
                    <h3 className="text-[14px] font-bold" style={{ marginBottom: 'var(--space-3)' }}>Reactions</h3>
                    <div className="flex flex-col" style={{ gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                        {[
                            { user: 'alice', reaction: 'Great question! 🔥', fid: 2000 },
                            { user: 'bob', reaction: '💯', fid: 2001 },
                            { user: 'charlie', reaction: 'Mini Apps FTW! 🚀', fid: 2002 },
                        ].map((r, i) => (
                            <div key={i} className="flex items-start animate-fade-in" style={{ gap: 'var(--space-2)', animationDelay: `${i * 100}ms` }}>
                                <div
                                    className="flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                                    style={{
                                        width: '24px', height: '24px',
                                        borderRadius: '50%',
                                        marginTop: '1px',
                                        background: `hsl(${(r.fid * 137.508) % 360}, 55%, 45%)`,
                                    }}
                                >
                                    {r.user.charAt(0).toUpperCase()}
                                </div>
                                <div className="text-reaction">
                                    <span className="font-medium" style={{ color: 'var(--accent-blue)' }}>@{r.user}</span>
                                    <span style={{ color: 'var(--text-secondary)', marginLeft: '4px' }}>{r.reaction}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <ReactionBar pollId={poll.id} />
                </div>

                {/* Result card toggle */}
                <button
                    onClick={() => setShowResultCard(!showResultCard)}
                    className="w-full text-[13px] font-medium transition-colors touch-target"
                    style={{
                        padding: 'var(--space-3)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-default)',
                        background: 'transparent',
                        color: 'var(--text-secondary)',
                    }}
                >
                    {showResultCard ? 'Hide' : 'Show'} Shareable Result Card
                </button>

                {showResultCard && (
                    <ResultCard
                        question={poll.question}
                        options={poll.options}
                        voteCounts={poll.voteCounts || {}}
                        totalVotes={poll.total_votes}
                        creatorUsername={poll.creator_username}
                    />
                )}
            </div>
        </main>
    );
}
