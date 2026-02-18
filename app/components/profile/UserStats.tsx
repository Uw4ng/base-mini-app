'use client';

import { useState, useEffect } from 'react';
import type { UserStatsData } from '@/lib/db';

interface UserStatsProps {
    fid: number;
    username: string;
}

export default function UserStats({ fid, username }: UserStatsProps) {
    const [stats, setStats] = useState<UserStatsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'polls' | 'history'>('polls');

    useEffect(() => {
        fetch(`/api/users/${fid}/stats`)
            .then(r => r.json())
            .then(data => setStats(data.stats))
            .catch(() => setStats(null))
            .finally(() => setLoading(false));
    }, [fid]);

    const handleShareStats = () => {
        if (!stats) return;
        const shareText = `📊 My Quick Poll Stats\n🗳️ ${stats.totalVotes} Votes\n${stats.majorityPercent}% Majority\n✏️ ${stats.pollsCreated} Polls Created\n${stats.funLabel}\n\nquickpoll.base.app`;

        if (typeof navigator !== 'undefined' && navigator.share) {
            navigator.share({ title: 'My Quick Poll Stats', text: shareText }).catch(() => { /* cancelled */ });
        } else {
            navigator.clipboard.writeText(shareText).catch(() => { /* not available */ });
        }
    };

    if (loading) {
        return (
            <div
                style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--space-5)',
                }}
            >
                <div className="flex items-center" style={{ gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                    <div className="skeleton" style={{ width: '56px', height: '56px', borderRadius: '50%' }} />
                    <div className="flex-1">
                        <div className="skeleton" style={{ width: '120px', height: '16px', marginBottom: '6px' }} />
                        <div className="skeleton" style={{ width: '80px', height: '12px' }} />
                    </div>
                </div>
                <div className="grid grid-cols-3" style={{ gap: 'var(--space-2)' }}>
                    {[1, 2, 3].map(i => (
                        <div key={i} className="skeleton" style={{ height: '68px', borderRadius: 'var(--radius-sm)' }} />
                    ))}
                </div>
            </div>
        );
    }

    if (!stats) return null;

    const statCards = [
        { value: String(stats.totalVotes), label: 'Votes', color: 'var(--accent-blue)' },
        { value: `${stats.majorityPercent}%`, label: 'Majority', color: 'var(--accent-purple)' },
        { value: String(stats.pollsCreated), label: 'Polls', color: 'var(--accent-green)' },
    ];

    return (
        <div className="flex flex-col animate-fade-in" style={{ gap: 'var(--space-4)' }}>
            {/* Profile Card */}
            <div
                style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--space-5)',
                }}
            >
                {/* Avatar & username */}
                <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-4)' }}>
                    <div className="flex items-center" style={{ gap: 'var(--space-3)' }}>
                        <div
                            className="rounded-full flex items-center justify-center text-xl font-bold text-white"
                            style={{
                                width: '56px', height: '56px',
                                background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))',
                            }}
                        >
                            {username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div className="text-[16px] font-bold">@{username}</div>
                            <div className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
                                {stats.funLabel}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleShareStats}
                        className="flex items-center transition-colors"
                        style={{
                            gap: '4px',
                            padding: '8px 14px',
                            borderRadius: 'var(--radius-full)',
                            background: 'var(--bg-tertiary)',
                            border: '1px solid var(--border-subtle)',
                            color: 'var(--text-secondary)',
                            fontSize: '12px',
                            fontWeight: 600,
                        }}
                    >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="18" cy="5" r="3" />
                            <circle cx="6" cy="12" r="3" />
                            <circle cx="18" cy="19" r="3" />
                            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                        </svg>
                        Share
                    </button>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-3" style={{ gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
                    {statCards.map(stat => (
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
                            <div className="text-stat-number animate-count-up" style={{ color: stat.color }}>
                                {stat.value}
                            </div>
                            <div className="text-stat-label font-medium" style={{ marginTop: 'var(--space-1)' }}>
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Fun insights */}
                <div className="flex flex-col" style={{ gap: '6px' }}>
                    <div className="flex items-center" style={{ gap: 'var(--space-2)' }}>
                        <span className="text-[13px]">🔥</span>
                        <span className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
                            Most active: <strong style={{ color: 'var(--text-primary)' }}>{stats.mostActiveDay}</strong>
                        </span>
                    </div>
                    <div className="flex items-center" style={{ gap: 'var(--space-2)' }}>
                        <span className="text-[13px]">💻</span>
                        <span className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
                            Top category: <strong style={{ color: 'var(--text-primary)' }}>{stats.topCategory}</strong>
                        </span>
                    </div>
                    <div className="flex items-center" style={{ gap: 'var(--space-2)' }}>
                        <span className="text-[13px]">🔥</span>
                        <span className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
                            Streak: <strong style={{ color: 'var(--accent-orange)' }}>{stats.streak} days</strong>
                        </span>
                    </div>
                </div>
            </div>

            {/* Tabs: Your Polls / Voting History */}
            <div className="flex" style={{
                gap: '2px',
                padding: '2px',
                background: 'var(--bg-tertiary)',
                borderRadius: 'var(--radius-sm)',
            }}>
                <button
                    onClick={() => setActiveTab('polls')}
                    className="flex-1 text-[13px] font-medium transition-all"
                    style={{
                        padding: '8px',
                        borderRadius: '6px',
                        background: activeTab === 'polls' ? 'var(--accent-blue)' : 'transparent',
                        color: activeTab === 'polls' ? 'white' : 'var(--text-secondary)',
                        border: 'none',
                    }}
                >
                    Your Polls
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className="flex-1 text-[13px] font-medium transition-all"
                    style={{
                        padding: '8px',
                        borderRadius: '6px',
                        background: activeTab === 'history' ? 'var(--accent-blue)' : 'transparent',
                        color: activeTab === 'history' ? 'white' : 'var(--text-secondary)',
                        border: 'none',
                    }}
                >
                    Voting History
                </button>
            </div>

            {/* Content */}
            {activeTab === 'history' && (
                <div className="flex flex-col animate-fade-in" style={{ gap: 'var(--space-2)' }}>
                    {stats.votingHistory.length === 0 ? (
                        <div className="text-center" style={{ padding: 'var(--space-6) 0' }}>
                            <div className="text-3xl" style={{ marginBottom: 'var(--space-2)' }}>🗳️</div>
                            <p className="text-metadata">No votes yet</p>
                        </div>
                    ) : (
                        stats.votingHistory.slice(0, 10).map(vote => (
                            <div
                                key={`${vote.pollId}-${vote.optionId}`}
                                className="flex items-start"
                                style={{
                                    padding: 'var(--space-3)',
                                    background: 'var(--bg-secondary)',
                                    border: '1px solid var(--border-subtle)',
                                    borderRadius: 'var(--radius-sm)',
                                    gap: 'var(--space-3)',
                                }}
                            >
                                <div className="text-[16px]">🗳️</div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-[13px] font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                                        {vote.question}
                                    </div>
                                    <div className="text-[11px]" style={{ color: 'var(--text-tertiary)', marginTop: '2px' }}>
                                        {new Date(vote.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
