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
            if (found) {
                setPoll(found);
            }
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
            <main className="min-h-screen max-w-lg mx-auto p-4">
                <div className="glass rounded-2xl p-4 space-y-3 animate-pulse">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-foreground/10" />
                        <div className="h-4 bg-foreground/10 rounded w-24" />
                    </div>
                    <div className="h-6 bg-foreground/10 rounded w-3/4" />
                    <div className="space-y-2">
                        <div className="h-12 bg-foreground/10 rounded-xl" />
                        <div className="h-12 bg-foreground/10 rounded-xl" />
                        <div className="h-12 bg-foreground/10 rounded-xl" />
                    </div>
                </div>
            </main>
        );
    }

    if (!poll) {
        return (
            <main className="min-h-screen max-w-lg mx-auto p-4 flex items-center justify-center">
                <div className="text-center animate-fade-in">
                    <div className="text-4xl mb-3">🤷</div>
                    <h2 className="text-lg font-bold mb-1">Poll not found</h2>
                    <p className="text-sm text-muted mb-4">This poll may have been removed.</p>
                    <button
                        onClick={() => router.push('/')}
                        className="px-4 py-2 rounded-xl text-sm font-medium text-white"
                        style={{ background: 'var(--accent-gradient)' }}
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
        <main className="min-h-screen max-w-lg mx-auto pb-8">
            {/* Header */}
            <header className="sticky top-0 z-40 glass px-4 py-3 flex items-center gap-3">
                <button
                    onClick={() => router.push('/')}
                    className="w-8 h-8 rounded-full bg-foreground/5 flex items-center justify-center hover:bg-foreground/10 transition-colors"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                </button>
                <h1 className="text-sm font-bold flex-1">Poll Details</h1>
                <ShareButton pollId={poll.id} question={poll.question} />
            </header>

            <div className="px-4 pt-4 space-y-4">
                {/* Main poll */}
                {poll.poll_type === 'this_or_that' ? (
                    <div className="glass rounded-2xl p-4 space-y-3">
                        <div className="flex items-center gap-2.5 mb-2">
                            <div
                                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
                                style={{
                                    background: `hsl(${(poll.creator_fid * 137.508) % 360}, 60%, 50%)`,
                                }}
                            >
                                {poll.creator_username.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <span className="text-sm font-semibold">{poll.creator_username}</span>
                            </div>
                        </div>
                        <h3 className="text-lg font-bold">{poll.question}</h3>
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

                {/* Full results (shown after voting) */}
                {(hasVoted || isExpired) && (
                    <div className="glass rounded-2xl p-4">
                        <PollResults
                            question={poll.question}
                            options={poll.options}
                            voteCounts={poll.voteCounts || {}}
                            totalVotes={poll.total_votes}
                            userVotedOptionId={voted}
                        />
                    </div>
                )}

                {/* Reactions section */}
                <div className="glass rounded-2xl p-4">
                    <h3 className="text-sm font-bold mb-3">Reactions</h3>
                    <div className="space-y-2 mb-3">
                        {/* Mock reactions */}
                        {[
                            { user: 'alice', reaction: 'Great question! 🔥', fid: 2000 },
                            { user: 'bob', reaction: '💯', fid: 2001 },
                            { user: 'charlie', reaction: 'Mini Apps FTW! 🚀', fid: 2002 },
                        ].map((r, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                                <div
                                    className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white flex-shrink-0 mt-0.5"
                                    style={{
                                        background: `hsl(${(r.fid * 137.508) % 360}, 55%, 45%)`,
                                    }}
                                >
                                    {r.user.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <span className="font-medium text-accent-light">@{r.user}</span>
                                    <span className="text-muted ml-1">{r.reaction}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <ReactionBar pollId={poll.id} />
                </div>

                {/* Result card toggle */}
                <button
                    onClick={() => setShowResultCard(!showResultCard)}
                    className="w-full py-2.5 rounded-xl border border-border text-sm text-muted hover:text-foreground hover:border-foreground/20 transition-colors"
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
