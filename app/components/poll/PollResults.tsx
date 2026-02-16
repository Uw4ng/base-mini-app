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
        <div className="animate-scale-in">
            <div className="text-center" style={{ marginBottom: 'var(--space-4)' }}>
                <h3 className="text-poll-question" style={{ marginBottom: 'var(--space-1)' }}>{question}</h3>
                <p className="text-metadata">{totalVotes} total votes</p>
            </div>

            <div className="flex flex-col" style={{ gap: 'var(--space-2)' }}>
                {options.map((option, index) => (
                    <ProgressBar
                        key={option.id}
                        percentage={getPercentage(option.id)}
                        optionIndex={index}
                        label={option.text}
                        isSelected={option.id === userVotedOptionId}
                        isWinner={option.id === winnerId}
                        voteCount={voteCounts[option.id] || 0}
                    />
                ))}
            </div>
        </div>
    );
}
