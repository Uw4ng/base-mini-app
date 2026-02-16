'use client';

import { useState, useCallback } from 'react';
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

const GRADIENTS = [
    'linear-gradient(135deg, #845EF7 0%, #B197FC 100%)',
    'linear-gradient(135deg, #E64980 0%, #F783AC 100%)',
    'linear-gradient(135deg, #51CF66 0%, #A9E34B 100%)',
    'linear-gradient(135deg, #339AF0 0%, #74C0FC 100%)',
    'linear-gradient(135deg, #FFD43B 0%, #FFA94D 100%)',
    'linear-gradient(135deg, #FF6B6B 0%, #FFA8A8 100%)',
];

export default function PollCard({
    poll,
    voteCounts = {},
    currentUserFid = 9999,
    userVotedOptionId = null,
    onVote,
    compact = false,
}: PollCardProps) {
    const [voted, setVoted] = useState(userVotedOptionId);
    const [localCounts, setLocalCounts] = useState(voteCounts);
    const [localTotal, setLocalTotal] = useState(poll.total_votes);
    const [animating, setAnimating] = useState(false);

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

            // Call API
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
        <div className="glass rounded-2xl p-4 space-y-3 animate-fade-in">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
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
                        <span className="text-xs text-muted ml-2">{timeAgo(poll.created_at)}</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {poll.is_onchain && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent/10 text-accent-light font-medium">
                            ⛓ On-chain
                        </span>
                    )}
                    {poll.expires_at && !isExpired && <Timer expiresAt={poll.expires_at} compact />}
                    {isExpired && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-danger/10 text-danger font-medium">
                            Ended
                        </span>
                    )}
                </div>
            </div>

            {/* Question */}
            <h3 className={`font-bold leading-snug ${compact ? 'text-base' : 'text-lg'}`}>
                {poll.question}
            </h3>

            {/* Options */}
            <div className="space-y-2">
                {poll.options.map((option: PollOption, index: number) => (
                    <div key={option.id}>
                        {!showResults ? (
                            <button
                                onClick={() => handleVote(option.id)}
                                className="poll-option w-full text-left px-4 py-3 rounded-xl border border-border bg-foreground/[0.03] hover:bg-foreground/[0.06] flex items-center gap-3"
                            >
                                <div
                                    className="w-6 h-6 rounded-full border-2 border-foreground/20 flex items-center justify-center text-xs font-bold flex-shrink-0"
                                >
                                    {String.fromCharCode(65 + index)}
                                </div>
                                <span className="text-sm font-medium">{option.text}</span>
                            </button>
                        ) : (
                            <div className={`relative ${voted === option.id ? 'scale-[1.01]' : ''} transition-transform`}>
                                <ProgressBar
                                    percentage={getPercentage(option.id)}
                                    color={GRADIENTS[index % GRADIENTS.length]}
                                    label={option.text}
                                    height={36}
                                />
                                {voted === option.id && (
                                    <span className="absolute right-2 top-0 text-xs text-accent font-medium">
                                        ✓ Your vote
                                    </span>
                                )}
                                {winnerId === option.id && showResults && (
                                    <span className="absolute right-2 bottom-1 text-[10px] text-success font-medium">
                                        👑 Leading
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-3">
                    <span className="text-xs text-muted">
                        {localTotal} vote{localTotal !== 1 ? 's' : ''}
                    </span>
                    {!poll.is_anonymous && <VoterAvatars pollId={poll.id} limit={3} />}
                </div>
                <div className="flex items-center gap-2">
                    <ReactionBar pollId={poll.id} compact />
                    <ShareButton pollId={poll.id} question={poll.question} />
                </div>
            </div>
        </div>
    );
}
