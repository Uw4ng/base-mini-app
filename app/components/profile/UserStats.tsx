'use client';

interface UserStatsProps {
    pollsCreated: number;
    votesGiven: number;
    streak: number;
    username: string;
}

export default function UserStats({ pollsCreated, votesGiven, streak, username }: UserStatsProps) {
    const stats = [
        { label: 'Total Votes', value: String(votesGiven), icon: '🗳️' },
        { label: 'Majority %', value: '72%', icon: '📊' },
        { label: 'Polls Created', value: String(pollsCreated), icon: '✏️' },
    ];

    return (
        <div
            className="animate-fade-in"
            style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-5)',
            }}
        >
            {/* User info */}
            <div className="flex items-center" style={{ gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                <div
                    className="rounded-full flex items-center justify-center text-lg font-bold text-white"
                    style={{
                        width: '44px',
                        height: '44px',
                        background: 'var(--accent-blue)',
                    }}
                >
                    {username.charAt(0).toUpperCase()}
                </div>
                <div>
                    <div className="text-[15px] font-bold">@{username}</div>
                    <div className="text-metadata">Quick Poll Member • 🔥 {streak} day streak</div>
                </div>
            </div>

            {/* Stats grid — 3 columns */}
            <div className="grid grid-cols-3" style={{ gap: 'var(--space-2)' }}>
                {stats.map(stat => (
                    <div
                        key={stat.label}
                        className="text-center"
                        style={{
                            padding: 'var(--space-3)',
                            borderRadius: 'var(--radius-sm)',
                            background: 'var(--bg-tertiary)',
                            border: '1px solid var(--border-subtle)',
                        }}
                    >
                        <div className="text-stat-number animate-count-up">{stat.value}</div>
                        <div className="text-stat-label" style={{ marginTop: 'var(--space-1)' }}>{stat.label}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
