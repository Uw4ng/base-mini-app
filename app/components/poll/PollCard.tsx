'use client';

import { useState, useCallback, useRef } from 'react';
import ProgressBar from '../ui/ProgressBar';
import Timer from '../ui/Timer';
import VoterAvatars from '../social/VoterAvatars';
import ReactionBar from '../social/ReactionBar';
import ShareButton from '../social/ShareButton';
import type { Poll, PollOption } from '@/lib/db';
import { timeAgo } from '@/lib/farcaster';

interface PollCardProps {
    poll: Poll;
    voteCounts?: Record<string, number>;
    currentUserFid?: number;
    userVotedOptionId?: string | null;
    onVote?: (pollId: string, optionId: string) => void;
    compact?: boolean;
}

export default function PollCard({
    poll,
    voteCounts = {},
    currentUserFid: _currentUserFid = 9999,
    userVotedOptionId = null,
    onVote,
    compact = false,
}: PollCardProps) {
    const [voted, setVoted] = useState(userVotedOptionId);
    const [localCounts, setLocalCounts] = useState(voteCounts);
    const [localTotal, setLocalTotal] = useState(poll.total_votes);
    const [animating, setAnimating] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

    const isExpired = poll.expires_at ? new Date(poll.expires_at) < new Date() : false;
    const hasVoted = voted !== null;
    const showResults = hasVoted || isExpired;

    const handleVote = useCallback(
        (optionId: string) => {
            if (hasVoted || isExpired || animating) return;
            setAnimating(true);

            // Optimistic update
            setVoted(optionId);
            setLocalCounts(prev => ({
                ...prev,
                [optionId]: (prev[optionId] || 0) + 1,
            }));
            setLocalTotal(prev => prev + 1);

            // Confetti burst
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 400);

            // API call
            onVote?.(poll.id, optionId);
            setTimeout(() => setAnimating(false), 500);
        },
        [hasVoted, isExpired, animating, onVote, poll.id]
    );

    const getPercentage = (optionId: string) => {
        const total = localTotal || 1;
        return ((localCounts[optionId] || 0) / total) * 100;
    };

    const getWinnerOptionId = () => {
        let maxVotes = 0;
        let winnerId = '';
        for (const [id, count] of Object.entries(localCounts)) {
            if (count > maxVotes) {
                maxVotes = count;
                winnerId = id;
            }
        }
        return winnerId;
    };

    const winnerId = showResults ? getWinnerOptionId() : '';

    return (
        <div ref={cardRef} className="poll-card relative animate-fade-in">
            {/* Confetti burst */}
            {showConfetti && (
                <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden" style={{ borderRadius: 'var(--radius-md)' }}>
                    {[...Array(5)].map((_, i) => (
                        <div
                            key={i}
                            className="confetti-dot"
                            style={{
                                left: `${30 + Math.random() * 40}%`,
                                top: `${30 + Math.random() * 40}%`,
                                background: ['var(--accent-blue)', 'var(--accent-purple)', 'var(--accent-green)', 'var(--accent-orange)', 'var(--accent-red)'][i],
                                animationDelay: `${i * 30}ms`,
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Header: avatar + username + time */}
            <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-3)' }}>
                <div className="flex items-center" style={{ gap: 'var(--space-2)' }}>
                    <div
                        className="rounded-full flex items-center justify-center text-sm font-semibold text-white"
                        style={{
                            width: '32px',
                            height: '32px',
                            background: `hsl(${(poll.creator_fid * 137.508) % 360}, 55%, 50%)`,
                        }}
                    >
                        {poll.creator_username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <span className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                            {poll.creator_username}
                        </span>
                        <span className="text-metadata ml-2">{timeAgo(poll.created_at)}</span>
                    </div>
                </div>
                <div className="flex items-center" style={{ gap: 'var(--space-2)' }}>
                    {poll.is_onchain && (
                        <span
                            className="text-[11px] font-medium"
                            style={{
                                padding: '2px 8px',
                                borderRadius: 'var(--radius-full)',
                                background: 'rgba(139, 92, 246, 0.15)',
                                color: 'var(--accent-purple)',
                            }}
                        >
                            ⛓ On-chain
                        </span>
                    )}
                    {poll.expires_at && !isExpired && <Timer expiresAt={poll.expires_at} compact />}
                    {isExpired && (
                        <span
                            className="text-[11px] font-medium animate-timer-pulse"
                            style={{
                                padding: '2px 8px',
                                borderRadius: 'var(--radius-full)',
                                background: 'rgba(239, 68, 68, 0.15)',
                                color: 'var(--accent-red)',
                            }}
                        >
                            Ended
                        </span>
                    )}
                </div>
            </div>

            {/* Question */}
            <h3 className={`text-poll-question ${compact ? '' : ''}`} style={{ marginBottom: 'var(--space-3)' }}>
                {poll.question}
            </h3>

            {/* Options */}
            <div className="flex flex-col" style={{ gap: 'var(--space-2)' }}>
                {poll.options.map((option: PollOption, index: number) => (
                    <div key={option.id}>
                        {!showResults ? (
                            <button
                                onClick={() => handleVote(option.id)}
                                className="poll-option touch-target w-full text-left flex items-center"
                                style={{ gap: 'var(--space-3)' }}
                                aria-label={`Vote for ${option.text}`}
                            >
                                <span className="text-option">{option.text}</span>
                            </button>
                        ) : (
                            <ProgressBar
                                percentage={getPercentage(option.id)}
                                optionIndex={index}
                                label={option.text}
                                isSelected={voted === option.id}
                                isWinner={winnerId === option.id}
                                voteCount={localCounts[option.id] || 0}
                            />
                        )}
                    </div>
                ))}
            </div>

            {/* Footer: vote count + timer + avatars + share */}
            <div
                className="flex items-center justify-between"
                style={{ marginTop: 'var(--space-3)', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--border-subtle)' }}
            >
                <div className="flex items-center" style={{ gap: 'var(--space-3)' }}>
                    <span className="text-metadata tabular-nums">
                        {localTotal} vote{localTotal !== 1 ? 's' : ''}
                    </span>
                    {!poll.is_anonymous && <VoterAvatars pollId={poll.id} limit={4} />}
                </div>
                <div className="flex items-center" style={{ gap: 'var(--space-2)' }}>
                    <ReactionBar pollId={poll.id} compact />
                    <ShareButton pollId={poll.id} question={poll.question} />
                </div>
            </div>
        </div>
    );
}
