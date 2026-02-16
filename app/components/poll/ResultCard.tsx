'use client';

import type { PollOption } from '@/lib/db';

interface ResultCardProps {
    question: string;
    options: PollOption[];
    voteCounts: Record<string, number>;
    totalVotes: number;
    creatorUsername: string;
}

export default function ResultCard({
    question,
    options,
    voteCounts,
    totalVotes,
    creatorUsername,
}: ResultCardProps) {
    // Find winner
    let maxVotes = 0;
    let winnerId = '';
    for (const [id, count] of Object.entries(voteCounts)) {
        if (count > maxVotes) {
            maxVotes = count;
            winnerId = id;
        }
    }

    const winnerOption = options.find(o => o.id === winnerId);
    const winnerPct = totalVotes > 0 ? (maxVotes / totalVotes) * 100 : 0;

    return (
        <div className="relative overflow-hidden rounded-2xl p-5"
            style={{
                background: 'linear-gradient(135deg, #1a1025 0%, #0f0a1a 50%, #0a0a14 100%)',
                border: '1px solid rgba(132, 94, 247, 0.2)',
            }}
        >
            {/* Decorative glow */}
            <div
                className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-20 blur-3xl"
                style={{ background: 'var(--accent-gradient)' }}
            />

            {/* Quick Poll branding */}
            <div className="flex items-center gap-1.5 mb-3">
                <div className="w-5 h-5 rounded-md flex items-center justify-center text-[10px]"
                    style={{ background: 'var(--accent-gradient)' }}>
                    📊
                </div>
                <span className="text-[10px] font-bold text-accent-light tracking-wider uppercase">Quick Poll Results</span>
            </div>

            {/* Question */}
            <h3 className="text-base font-bold mb-4 leading-snug">{question}</h3>

            {/* Results summary */}
            <div className="space-y-2 mb-4">
                {options.map((option) => {
                    const count = voteCounts[option.id] || 0;
                    const pct = totalVotes > 0 ? (count / totalVotes) * 100 : 0;
                    const isWinner = option.id === winnerId;

                    return (
                        <div key={option.id} className="flex items-center gap-2">
                            <div className="flex-1">
                                <div className="flex justify-between text-xs mb-0.5">
                                    <span className={isWinner ? 'font-bold text-accent-light' : 'text-muted'}>
                                        {isWinner ? '👑 ' : ''}{option.text}
                                    </span>
                                    <span className="text-muted tabular-nums">{Math.round(pct)}%</span>
                                </div>
                                <div className="h-1.5 rounded-full bg-foreground/5 overflow-hidden">
                                    <div
                                        className="h-full rounded-full"
                                        style={{
                                            width: `${pct}%`,
                                            background: isWinner ? 'var(--accent-gradient)' : 'rgba(255,255,255,0.15)',
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between text-[10px] text-muted border-t border-foreground/5 pt-2">
                <span>{totalVotes} votes • by @{creatorUsername}</span>
                {winnerOption && (
                    <span className="text-accent-light font-medium">
                        Winner: {winnerOption.text} ({Math.round(winnerPct)}%)
                    </span>
                )}
            </div>
        </div>
    );
}
