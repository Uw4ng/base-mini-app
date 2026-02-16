'use client';

import { useState, useCallback, useRef } from 'react';
import ProgressBar from '../ui/ProgressBar';
import Timer from '../ui/Timer';
import VoterAvatars from '../social/VoterAvatars';
import ShareButton from '@/app/components/social/ShareButton';
import type { Poll, PollOption } from '@/lib/db';
import { timeAgo } from '@/lib/farcaster';

interface EnrichedPoll extends Poll {
    voteCounts?: Record<string, number>;
    userVotedOptionId?: string | null;
    userPrediction?: string | null;
    userReaction?: string | null;
    predictionCorrect?: boolean | null;
    majorityOptionId?: string | null;
    recentVoters?: { fid: number; username: string; avatar: string | null }[];
    reactions?: { fid: number; username: string; reaction: string; avatar: string | null }[];
}

interface PollCardProps {
    poll: EnrichedPoll;
    currentUserFid?: number;
    onVote?: (pollId: string, optionId: string, prediction?: string) => void;
    onReaction?: (pollId: string, reaction: string) => void;
}

export default function PollCard({
    poll,
    currentUserFid: _currentUserFid = 9999,
    onVote,
    onReaction,
}: PollCardProps) {
    const [voted, setVoted] = useState(poll.userVotedOptionId || null);
    const [localCounts, setLocalCounts] = useState(poll.voteCounts || {});
    const [localTotal, setLocalTotal] = useState(poll.total_votes);
    const [animating, setAnimating] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [reactionText, setReactionText] = useState('');
    const [reactionSubmitted, setReactionSubmitted] = useState(!!poll.userReaction);

    // Prediction mode state
    const [showPrediction, setShowPrediction] = useState(false);
    const [pendingVoteOption, setPendingVoteOption] = useState<string | null>(null);
    const [prediction, setPrediction] = useState(poll.userPrediction || null);
    const [predictionResult, setPredictionResult] = useState<boolean | null>(poll.predictionCorrect ?? null);

    const cardRef = useRef<HTMLDivElement>(null);

    const isExpired = poll.expires_at ? new Date(poll.expires_at) < new Date() : false;
    const hasVoted = voted !== null;
    const showResults = hasVoted || isExpired;

    const handleVote = useCallback(
        (optionId: string) => {
            if (hasVoted || isExpired || animating) return;

            // If prediction mode, show prediction modal first
            if (poll.is_prediction && !prediction) {
                setPendingVoteOption(optionId);
                setShowPrediction(true);
                return;
            }

            executeVote(optionId, prediction);
        },
        [hasVoted, isExpired, animating, poll.is_prediction, prediction]
    );

    const executeVote = (optionId: string, pred?: string | null) => {
        setAnimating(true);
        setVoted(optionId);
        setLocalCounts(prev => ({
            ...prev,
            [optionId]: (prev[optionId] || 0) + 1,
        }));
        setLocalTotal(prev => prev + 1);

        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 400);

        onVote?.(poll.id, optionId, pred || undefined);
        setTimeout(() => setAnimating(false), 500);
        setShowPrediction(false);
        setPendingVoteOption(null);
    };

    const handlePredictionSelect = (predictedOptionId: string) => {
        setPrediction(predictedOptionId);
        if (pendingVoteOption) {
            executeVote(pendingVoteOption, predictedOptionId);
            // Simulate prediction result (majority check would come from API)
            const currentMajority = Object.entries(localCounts).reduce(
                (max, [id, count]) => count > max[1] ? [id, count] : max,
                ['', 0] as [string, number]
            )[0];
            setPredictionResult(predictedOptionId === currentMajority);
        }
    };

    const handleReactionSubmit = () => {
        if (!reactionText.trim()) return;
        onReaction?.(poll.id, reactionText.trim());
        setReactionSubmitted(true);
        setReactionText('');
    };

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
        <div
            ref={cardRef}
            className="poll-card relative animate-fade-in"
            style={{ opacity: isExpired ? 0.85 : 1 }}
        >
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

            {/* Header */}
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
                        <span className="text-[14px] font-semibold">{poll.creator_username}</span>
                        <span className="text-metadata ml-2">{timeAgo(poll.created_at)}</span>
                    </div>
                </div>
                <div className="flex items-center" style={{ gap: 'var(--space-2)' }}>
                    {poll.is_anonymous && (
                        <span
                            className="text-[11px] font-medium"
                            style={{
                                padding: '2px 8px',
                                borderRadius: 'var(--radius-full)',
                                background: 'rgba(102, 102, 102, 0.15)',
                                color: 'var(--text-tertiary)',
                            }}
                        >
                            🔒 Anonymous
                        </span>
                    )}
                    {poll.is_prediction && (
                        <span
                            className="text-[11px] font-medium"
                            style={{
                                padding: '2px 8px',
                                borderRadius: 'var(--radius-full)',
                                background: 'rgba(245, 158, 11, 0.15)',
                                color: 'var(--accent-orange)',
                            }}
                        >
                            🎯 Prediction
                        </span>
                    )}
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
            <h3 className="text-poll-question" style={{ marginBottom: 'var(--space-3)' }}>
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

            {/* Prediction result badge */}
            {hasVoted && poll.is_prediction && predictionResult !== null && (
                <div
                    className="animate-scale-in text-center text-[13px] font-medium"
                    style={{
                        marginTop: 'var(--space-2)',
                        padding: 'var(--space-2) var(--space-3)',
                        borderRadius: 'var(--radius-sm)',
                        background: predictionResult ? 'rgba(34, 197, 94, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                        color: predictionResult ? 'var(--accent-green)' : 'var(--accent-orange)',
                    }}
                >
                    {predictionResult
                        ? '🎯 You predicted correctly!'
                        : `😅 Majority picked ${poll.options.find(o => o.id === poll.majorityOptionId)?.text || 'differently'}`
                    }
                </div>
            )}

            {/* Footer */}
            <div
                className="flex items-center justify-between"
                style={{
                    marginTop: 'var(--space-3)',
                    paddingTop: 'var(--space-3)',
                    borderTop: '1px solid var(--border-subtle)',
                }}
            >
                <div className="flex items-center" style={{ gap: 'var(--space-3)' }}>
                    {!poll.is_anonymous && poll.recentVoters && poll.recentVoters.length > 0 && (
                        <VoterAvatars pollId={poll.id} limit={5} voters={poll.recentVoters} />
                    )}
                    <span className="text-metadata tabular-nums">
                        {localTotal} vote{localTotal !== 1 ? 's' : ''}
                    </span>
                    {poll.expires_at && !isExpired && (
                        <Timer expiresAt={poll.expires_at} compact />
                    )}
                </div>
                <ShareButton pollId={poll.id} question={poll.question} />
            </div>

            {/* Reactions section (after voting) */}
            {showResults && poll.reactions && poll.reactions.length > 0 && (
                <div style={{ marginTop: 'var(--space-3)', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--border-subtle)' }}>
                    {poll.reactions.slice(0, 2).map((r, i) => (
                        <div key={i} className="flex items-center text-[13px]" style={{ gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
                            <span style={{ color: 'var(--accent-blue)' }}>
                                {poll.is_anonymous ? '🔒' : `@${r.username}`}
                            </span>
                            <span className="text-reaction">{r.reaction}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Quick reaction input (after voting) */}
            {hasVoted && !reactionSubmitted && (
                <div
                    className="flex items-center animate-fade-in"
                    style={{
                        marginTop: 'var(--space-2)',
                        gap: 'var(--space-2)',
                    }}
                >
                    <input
                        value={reactionText}
                        onChange={e => setReactionText(e.target.value)}
                        placeholder="Add a quick reaction..."
                        maxLength={100}
                        className="flex-1 text-[13px] focus:outline-none"
                        style={{
                            background: 'var(--bg-tertiary)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: 'var(--radius-sm)',
                            padding: '8px 12px',
                            color: 'var(--text-primary)',
                        }}
                        onKeyDown={e => e.key === 'Enter' && handleReactionSubmit()}
                        onFocus={e => { e.currentTarget.style.borderColor = 'var(--border-focus)'; }}
                        onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
                    />
                    <button
                        onClick={handleReactionSubmit}
                        disabled={!reactionText.trim()}
                        className="text-[12px] font-semibold touch-target"
                        style={{
                            padding: '8px 12px',
                            borderRadius: 'var(--radius-sm)',
                            background: reactionText.trim() ? 'var(--accent-blue)' : 'var(--bg-tertiary)',
                            color: reactionText.trim() ? 'white' : 'var(--text-tertiary)',
                            border: 'none',
                        }}
                    >
                        ↗
                    </button>
                </div>
            )}

            {reactionSubmitted && hasVoted && (
                <div className="text-[12px] animate-fade-in" style={{ marginTop: 'var(--space-2)', color: 'var(--accent-green)' }}>
                    ✓ Reaction added
                </div>
            )}

            {/* Prediction modal */}
            {showPrediction && (
                <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)' }}>
                    <div
                        className="w-[90%] max-w-sm animate-scale-in"
                        style={{
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border-default)',
                            borderRadius: 'var(--radius-lg)',
                            padding: 'var(--space-5)',
                        }}
                    >
                        <div className="text-center" style={{ marginBottom: 'var(--space-4)' }}>
                            <div className="text-2xl" style={{ marginBottom: 'var(--space-2)' }}>🎯</div>
                            <h3 className="text-[16px] font-bold" style={{ marginBottom: 'var(--space-1)' }}>
                                What do you think most people will pick?
                            </h3>
                            <p className="text-metadata">Make your prediction before seeing results</p>
                        </div>

                        <div className="flex flex-col" style={{ gap: 'var(--space-2)' }}>
                            {poll.options.map((option: PollOption) => (
                                <button
                                    key={option.id}
                                    onClick={() => handlePredictionSelect(option.id)}
                                    className="poll-option touch-target w-full text-left text-option"
                                >
                                    {option.text}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => {
                                setShowPrediction(false);
                                if (pendingVoteOption) executeVote(pendingVoteOption);
                            }}
                            className="w-full text-[13px] text-center touch-target"
                            style={{
                                marginTop: 'var(--space-3)',
                                color: 'var(--text-tertiary)',
                                background: 'none',
                                border: 'none',
                            }}
                        >
                            Skip prediction
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
