'use client';

import ProgressBar from '../ui/ProgressBar';
import type { PollOption } from '@/lib/db';

interface PollResultsProps {
    question: string;
    options: PollOption[];
    voteCounts: Record<string, number>;
    totalVotes: number;
    userVotedOptionId?: string | null;
}

const GRADIENTS = [
    'linear-gradient(135deg, #845EF7 0%, #B197FC 100%)',
    'linear-gradient(135deg, #E64980 0%, #F783AC 100%)',
    'linear-gradient(135deg, #51CF66 0%, #A9E34B 100%)',
    'linear-gradient(135deg, #339AF0 0%, #74C0FC 100%)',
    'linear-gradient(135deg, #FFD43B 0%, #FFA94D 100%)',
];

export default function PollResults({
    question,
    options,
    voteCounts,
    totalVotes,
    userVotedOptionId,
}: PollResultsProps) {
    const getPercentage = (optionId: string) => {
        if (totalVotes === 0) return 0;
        return ((voteCounts[optionId] || 0) / totalVotes) * 100;
    };

    // Find winner
    let maxVotes = 0;
    let winnerId = '';
    for (const [id, count] of Object.entries(voteCounts)) {
        if (count > maxVotes) {
            maxVotes = count;
            winnerId = id;
        }
    }

    return (
        <div className="space-y-4 animate-scale-in">
            <div className="text-center">
                <h3 className="text-lg font-bold mb-1">{question}</h3>
                <p className="text-sm text-muted">{totalVotes} total votes</p>
            </div>

            <div className="space-y-3">
                {options.map((option, index) => {
                    const pct = getPercentage(option.id);
                    const isWinner = option.id === winnerId;
                    const isUserVote = option.id === userVotedOptionId;

                    return (
                        <div
                            key={option.id}
                            className={`relative ${isWinner ? 'scale-[1.02]' : ''} transition-transform`}
                        >
                            <ProgressBar
                                percentage={pct}
                                color={GRADIENTS[index % GRADIENTS.length]}
                                label={`${isWinner ? '👑 ' : ''}${option.text}${isUserVote ? ' ✓' : ''}`}
                                height={40}
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted tabular-nums">
                                {voteCounts[option.id] || 0}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
