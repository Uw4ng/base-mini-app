'use client';

import { useState } from 'react';

interface DemographicBreakdownProps {
    pollId: string;
    userFid: number;
    hasVoted: boolean;
}

interface BreakdownData {
    hasEnoughData: boolean;
    network: Record<string, { optionText: string; percent: number }>;
    everyone: Record<string, { optionText: string; percent: number }>;
}

export default function DemographicBreakdown({ pollId, userFid, hasVoted }: DemographicBreakdownProps) {
    const [expanded, setExpanded] = useState(false);
    const [data, setData] = useState<BreakdownData | null>(null);
    const [loading, setLoading] = useState(false);
    const [fetched, setFetched] = useState(false);

    if (!hasVoted) return null;

    const fetchBreakdown = async () => {
        if (fetched) {
            setExpanded(!expanded);
            return;
        }
        setLoading(true);
        setExpanded(true);
        try {
            const res = await fetch(`/api/polls/${pollId}/voters?fid=${userFid}&breakdown=true`);
            const result = await res.json();
            setData(result.breakdown || null);
        } catch {
            setData(null);
        } finally {
            setLoading(false);
            setFetched(true);
        }
    };

    const renderBar = (items: Record<string, { optionText: string; percent: number }>, label: string, emoji: string) => {
        const entries = Object.values(items).sort((a, b) => b.percent - a.percent);
        if (entries.length === 0) return null;

        return (
            <div style={{ marginBottom: 'var(--space-3)' }}>
                <div className="text-[12px] font-medium" style={{ color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    {emoji} {label}
                </div>
                <div className="flex flex-col" style={{ gap: '4px' }}>
                    {entries.map((entry, i) => (
                        <div key={i} className="flex items-center" style={{ gap: 'var(--space-2)' }}>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between" style={{ marginBottom: '2px' }}>
                                    <span className="text-[12px] truncate" style={{ color: 'var(--text-primary)', maxWidth: '60%' }}>
                                        {entry.optionText}
                                    </span>
                                    <span className="text-[12px] font-semibold tabular-nums" style={{ color: 'var(--text-secondary)' }}>
                                        {entry.percent}%
                                    </span>
                                </div>
                                <div
                                    className="rounded-full"
                                    style={{
                                        height: '4px',
                                        background: 'var(--bg-hover)',
                                        overflow: 'hidden',
                                    }}
                                >
                                    <div
                                        className="rounded-full transition-all"
                                        style={{
                                            height: '100%',
                                            width: `${entry.percent}%`,
                                            background: i === 0 ? 'var(--accent-blue)' : 'var(--text-tertiary)',
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div style={{ marginTop: 'var(--space-2)' }}>
            <button
                onClick={fetchBreakdown}
                className="flex items-center text-[12px] font-medium transition-colors"
                style={{
                    gap: '6px',
                    color: 'var(--text-secondary)',
                    background: 'none',
                    border: 'none',
                    padding: '4px 0',
                }}
            >
                📊 How your network voted
                <svg
                    width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    className="transition-transform"
                    style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0)' }}
                >
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </button>

            {expanded && (
                <div
                    className="animate-fade-in"
                    style={{
                        marginTop: 'var(--space-2)',
                        padding: 'var(--space-3)',
                        background: 'var(--bg-tertiary)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-subtle)',
                    }}
                >
                    {loading ? (
                        <div className="flex flex-col" style={{ gap: 'var(--space-2)' }}>
                            <div className="skeleton" style={{ width: '60%', height: '12px' }} />
                            <div className="skeleton" style={{ width: '80%', height: '4px' }} />
                            <div className="skeleton" style={{ width: '60%', height: '12px', marginTop: '8px' }} />
                            <div className="skeleton" style={{ width: '70%', height: '4px' }} />
                        </div>
                    ) : !data || !data.hasEnoughData ? (
                        <div className="text-[12px] text-center" style={{ color: 'var(--text-tertiary)', padding: 'var(--space-2) 0' }}>
                            Not enough votes yet (minimum 10 needed)
                        </div>
                    ) : (
                        <>
                            {renderBar(data.network, 'People you follow', '👥')}
                            {renderBar(data.everyone, 'Everyone else', '🌍')}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
