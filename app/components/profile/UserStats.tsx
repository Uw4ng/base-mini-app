'use client';

interface UserStatsProps {
    pollsCreated: number;
    votesGiven: number;
    streak: number;
    username: string;
}

export default function UserStats({ pollsCreated, votesGiven, streak, username }: UserStatsProps) {
    const stats = [
        { label: 'Polls', value: pollsCreated, icon: '📊', color: 'from-purple-500 to-violet-600' },
        { label: 'Votes', value: votesGiven, icon: '🗳️', color: 'from-pink-500 to-rose-600' },
        { label: 'Streak', value: `${streak}d`, icon: '🔥', color: 'from-amber-500 to-orange-600' },
    ];

    return (
        <div className="glass rounded-2xl p-4 animate-fade-in">
            {/* User info */}
            <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold"
                    style={{ background: 'var(--accent-gradient)' }}
                >
                    {username.charAt(0).toUpperCase()}
                </div>
                <div>
                    <div className="font-bold text-sm">@{username}</div>
                    <div className="text-xs text-muted">Quick Poll Member</div>
                </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-2">
                {stats.map(stat => (
                    <div
                        key={stat.label}
                        className={`rounded-xl p-3 text-center bg-gradient-to-br ${stat.color} bg-opacity-10`}
                        style={{ background: `linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))` }}
                    >
                        <div className="text-lg mb-0.5">{stat.icon}</div>
                        <div className="text-lg font-black">{stat.value}</div>
                        <div className="text-[10px] text-muted">{stat.label}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
