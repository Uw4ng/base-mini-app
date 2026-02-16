'use client';

import type { PollOption } from '@/lib/db';

interface ResultCardProps {
    question: string;
    options: PollOption[];
    voteCounts: Record<string, number>;
    totalVotes: number;
    creatorUsername: string;
}

const OPTION_COLORS = ['var(--option-1)', 'var(--option-2)', 'var(--option-3)', 'var(--option-4)'];

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
        <div
            className="relative overflow-hidden animate-scale-in"
            style={{
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-5)',
                background: 'linear-gradient(145deg, #111118 0%, #0c0c14 50%, #0a0a10 100%)',
                border: '1px solid var(--border-subtle)',
            }}
        >
            {/* Subtle glow */}
            <div
                className="absolute -top-16 -right-16 w-32 h-32 rounded-full blur-3xl"
                style={{ background: 'var(--accent-blue)', opacity: 0.08 }}
            />

            {/* Branding */}
            <div className="flex items-center" style={{ gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
                <div
                    className="flex items-center justify-center text-[10px]"
                    style={{
                        width: '20px', height: '20px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--accent-blue)',
                    }}
                >
                    📊
                </div>
                <span className="text-[11px] font-semibold tracking-wider uppercase" style={{ color: 'var(--accent-blue)' }}>
                    Quick Poll Results
                </span>
            </div>

            {/* Question */}
            <h3 className="text-poll-question" style={{ marginBottom: 'var(--space-4)' }}>{question}</h3>

            {/* Result bars */}
            <div className="flex flex-col" style={{ gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
                {options.map((option, index) => {
                    const count = voteCounts[option.id] || 0;
                    const pct = totalVotes > 0 ? (count / totalVotes) * 100 : 0;
                    const isWinner = option.id === winnerId;
                    const color = OPTION_COLORS[index % OPTION_COLORS.length];

                    return (
                        <div key={option.id}>
                            <div className="flex justify-between text-[13px]" style={{ marginBottom: '4px' }}>
                                <span style={{ color: isWinner ? color : 'var(--text-secondary)', fontWeight: isWinner ? 600 : 400 }}>
                                    {isWinner ? '✓ ' : ''}{option.text}
                                </span>
                                <span className="tabular-nums" style={{ color: 'var(--text-secondary)' }}>{Math.round(pct)}%</span>
                            </div>
                            <div
                                className="overflow-hidden"
                                style={{
                                    height: '6px',
                                    borderRadius: 'var(--radius-full)',
                                    background: 'var(--bg-tertiary)',
                                }}
                            >
                                <div
                                    style={{
                                        width: `${pct}%`,
                                        height: '100%',
                                        borderRadius: 'var(--radius-full)',
                                        background: isWinner ? color : 'var(--bg-hover)',
                                        transition: 'width 600ms ease-out',
                                    }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Footer */}
            <div
                className="flex items-center justify-between text-[11px]"
                style={{
                    paddingTop: 'var(--space-3)',
                    borderTop: '1px solid var(--border-subtle)',
                    color: 'var(--text-tertiary)',
                }}
            >
                <span>{totalVotes} votes • by @{creatorUsername}</span>
                {winnerOption && (
                    <span style={{ color: 'var(--accent-green)', fontWeight: 600 }}>
                        Winner: {winnerOption.text} ({Math.round(winnerPct)}%)
                    </span>
                )}
            </div>
        </div>
    );
}
