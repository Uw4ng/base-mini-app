'use client';

import { useState, useEffect, useRef } from 'react';
import type { PollOption, DailyStreak } from '@/lib/db';
import ProgressBar from '../ui/ProgressBar';

interface YesterdayResult {
    question: string;
    winnerText: string;
    winnerPercent: number;
    totalVotes: number;
    dayNumber: number;
}

interface DailyQuestionData {
    question: {
        id: string;
        question: string;
        options: PollOption[];
        category: string;
        day_number: number;
        active_date: string;
    };
    voteCounts: Record<string, number>;
    totalVotes: number;
    dayNumber: number;
    yesterdayResult: YesterdayResult | null;
    streak: DailyStreak | null;
    userVotedOptionId: string | null;
}

interface DailyQuestionProps {
    data?: DailyQuestionData | null;
}

// Category emoji map
const categoryEmoji: Record<string, string> = {
    tech: '💻',
    food: '🍕',
    lifestyle: '🌿',
    pop_culture: '🎬',
    philosophy: '🧠',
    funny: '😂',
};

// Confetti particle component
function Confetti({ active }: { active: boolean }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!active || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        const colors = ['#8b5cf6', '#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#ec4899'];
        const particles: {
            x: number; y: number; vx: number; vy: number;
            size: number; color: string; rotation: number; rotSpeed: number;
        }[] = [];

        for (let i = 0; i < 60; i++) {
            particles.push({
                x: canvas.width / 2,
                y: canvas.height / 2,
                vx: (Math.random() - 0.5) * 12,
                vy: -(Math.random() * 8 + 2),
                size: Math.random() * 6 + 3,
                color: colors[Math.floor(Math.random() * colors.length)],
                rotation: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 0.3,
            });
        }

        let frame = 0;
        const maxFrames = 90;

        function animate() {
            if (frame >= maxFrames || !ctx || !canvas) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const opacity = 1 - frame / maxFrames;

            for (const p of particles) {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.25; // gravity
                p.vx *= 0.98;
                p.rotation += p.rotSpeed;

                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rotation);
                ctx.globalAlpha = opacity;
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
                ctx.restore();
            }

            frame++;
            requestAnimationFrame(animate);
        }

        animate();
    }, [active]);

    if (!active) return null;

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none"
            style={{ zIndex: 10 }}
        />
    );
}

// Midnight countdown
function MidnightCountdown() {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        function calc() {
            const now = new Date();
            const midnight = new Date(now);
            midnight.setUTCHours(24, 0, 0, 0);
            const diff = midnight.getTime() - now.getTime();
            const hours = Math.floor(diff / 3600000);
            const minutes = Math.floor((diff % 3600000) / 60000);
            setTimeLeft(`${hours}h ${minutes}m`);
        }

        calc();
        const interval = setInterval(calc, 60000);
        return () => clearInterval(interval);
    }, []);

    return (
        <span className="text-metadata tabular-nums">
            Ends in {timeLeft}
        </span>
    );
}

// Streak milestones
const STREAK_MILESTONES = [7, 14, 30, 60, 100];

export default function DailyQuestion({ data: initialData }: DailyQuestionProps) {
    const [data, setData] = useState<DailyQuestionData | null>(initialData || null);
    const [voted, setVoted] = useState<string | null>(initialData?.userVotedOptionId || null);
    const [localCounts, setLocalCounts] = useState<Record<string, number>>(initialData?.voteCounts || {});
    const [localTotal, setLocalTotal] = useState(initialData?.totalVotes || 0);
    const [streak, setStreak] = useState<DailyStreak | null>(initialData?.streak || null);
    const [loading, setLoading] = useState(!initialData);
    const [showConfetti, setShowConfetti] = useState(false);
    const [streakMilestone, setStreakMilestone] = useState<number | null>(null);

    useEffect(() => {
        if (initialData) {
            setData(initialData);
            setLocalCounts(initialData.voteCounts);
            setLocalTotal(initialData.totalVotes);
            setVoted(initialData.userVotedOptionId);
            setStreak(initialData.streak);
            return;
        }

        async function fetchDQ() {
            try {
                const res = await fetch('/api/daily?fid=9999');
                const d = await res.json();
                if (d.question) {
                    setData(d);
                    setLocalCounts(d.voteCounts);
                    setLocalTotal(d.totalVotes);
                    setVoted(d.userVotedOptionId);
                    setStreak(d.streak);
                }
            } catch (err) {
                console.error('Failed to fetch daily question:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchDQ();
    }, [initialData]);

    if (loading) {
        return (
            <div className="poll-card" style={{ borderLeft: '3px solid var(--accent-purple)' }}>
                <div className="skeleton" style={{ width: '120px', height: '14px', marginBottom: 'var(--space-2)' }} />
                <div className="skeleton" style={{ width: '80%', height: '20px', marginBottom: 'var(--space-3)' }} />
                <div className="flex flex-col" style={{ gap: 'var(--space-2)' }}>
                    <div className="skeleton" style={{ height: '48px' }} />
                    <div className="skeleton" style={{ height: '48px' }} />
                </div>
            </div>
        );
    }

    if (!data) return null;

    const dayNumber = data.dayNumber || data.question.day_number || 1;
    const category = data.question.category || 'tech';
    const yesterdayResult = data.yesterdayResult;

    const handleVote = async (optionId: string) => {
        if (voted) return;
        setVoted(optionId);
        setLocalCounts(prev => ({ ...prev, [optionId]: (prev[optionId] || 0) + 1 }));
        setLocalTotal(prev => prev + 1);

        try {
            const res = await fetch('/api/daily', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ optionId, voterFid: 9999, voterUsername: 'quickpoll.dev' }),
            });
            const result = await res.json();
            if (result.voteCounts) {
                setLocalCounts(result.voteCounts);
                setLocalTotal(result.totalVotes);
            }
            if (result.streak) {
                setStreak(result.streak);
                // Check for milestone
                const newStreak = result.streak.currentStreak;
                if (STREAK_MILESTONES.includes(newStreak)) {
                    setStreakMilestone(newStreak);
                    setShowConfetti(true);
                    setTimeout(() => {
                        setShowConfetti(false);
                        setStreakMilestone(null);
                    }, 3000);
                }
            }
        } catch (err) {
            console.error('Failed to vote on daily question:', err);
        }
    };

    const getWinnerId = () => {
        let maxCount = 0;
        let winnerId = '';
        for (const [id, count] of Object.entries(localCounts)) {
            if (count > maxCount) {
                maxCount = count;
                winnerId = id;
            }
        }
        return winnerId;
    };

    const winnerId = voted ? getWinnerId() : '';

    return (
        <div
            className="poll-card relative overflow-hidden animate-fade-in"
            style={{ borderLeft: '3px solid var(--accent-purple)' }}
        >
            {/* Confetti for milestones */}
            <Confetti active={showConfetti} />

            {/* Decorative glow */}
            <div
                className="absolute -top-16 -right-16 w-32 h-32 rounded-full blur-3xl"
                style={{ background: 'var(--accent-purple)', opacity: 0.08, pointerEvents: 'none' }}
            />
            <div
                className="absolute -bottom-12 -left-12 w-24 h-24 rounded-full blur-2xl"
                style={{ background: 'var(--accent-blue)', opacity: 0.05, pointerEvents: 'none' }}
            />

            {/* Header */}
            <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-3)' }}>
                <div className="flex items-center" style={{ gap: 'var(--space-2)' }}>
                    <span className="text-base">✨</span>
                    <span
                        className="text-[11px] font-bold uppercase tracking-wider"
                        style={{ color: 'var(--accent-purple)' }}
                    >
                        Daily Question
                    </span>
                    <span
                        className="text-[11px] font-mono font-bold tabular-nums"
                        style={{
                            color: 'var(--text-tertiary)',
                            background: 'var(--bg-tertiary)',
                            padding: '1px 6px',
                            borderRadius: 'var(--radius-full)',
                        }}
                    >
                        #{dayNumber}
                    </span>
                    <span
                        className="text-[10px]"
                        style={{
                            padding: '1px 6px',
                            borderRadius: 'var(--radius-full)',
                            background: 'rgba(139, 92, 246, 0.1)',
                            color: 'var(--text-tertiary)',
                        }}
                    >
                        {categoryEmoji[category] || '📊'} {category.replace('_', ' ')}
                    </span>
                </div>
                {/* Streak badge */}
                {streak && streak.currentStreak > 0 && (
                    <span
                        className="text-[11px] font-bold tabular-nums animate-scale-in"
                        style={{
                            color: streak.currentStreak >= 7 ? 'var(--accent-orange)' : 'var(--text-tertiary)',
                        }}
                    >
                        🔥 {streak.currentStreak}
                    </span>
                )}
            </div>

            {/* Question */}
            <h3 className="text-poll-question" style={{ marginBottom: 'var(--space-3)' }}>
                {data.question.question}
            </h3>

            {/* Streak milestone celebration */}
            {streakMilestone && (
                <div
                    className="text-center animate-scale-in"
                    style={{
                        padding: 'var(--space-2) var(--space-3)',
                        marginBottom: 'var(--space-3)',
                        borderRadius: 'var(--radius-sm)',
                        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(239, 68, 68, 0.1))',
                        border: '1px solid rgba(245, 158, 11, 0.3)',
                    }}
                >
                    <div className="text-[18px]">🎉</div>
                    <div className="text-[14px] font-bold" style={{ color: 'var(--accent-orange)' }}>
                        🔥 {streakMilestone}-day streak!
                    </div>
                    <div className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                        You&apos;re on fire! Keep it going
                    </div>
                </div>
            )}

            {/* Options */}
            <div className="flex flex-col" style={{ gap: 'var(--space-2)' }}>
                {data.question.options.map((option: PollOption, index: number) => {
                    const pct = localTotal > 0 ? ((localCounts[option.id] || 0) / localTotal) * 100 : 0;

                    return voted ? (
                        <ProgressBar
                            key={option.id}
                            percentage={pct}
                            optionIndex={index}
                            label={option.text}
                            isSelected={voted === option.id}
                            isWinner={winnerId === option.id}
                            voteCount={localCounts[option.id] || 0}
                        />
                    ) : (
                        <button
                            key={option.id}
                            onClick={() => handleVote(option.id)}
                            className="poll-option w-full text-left text-option touch-target"
                            aria-label={`Vote for ${option.text}`}
                        >
                            {option.text}
                        </button>
                    );
                })}
            </div>

            {/* Footer */}
            <div
                className="flex items-center justify-between"
                style={{ marginTop: 'var(--space-3)' }}
            >
                <span className="text-metadata tabular-nums">
                    {localTotal.toLocaleString()} votes
                </span>
                <div className="flex items-center" style={{ gap: 'var(--space-3)' }}>
                    {voted && (
                        <button
                            onClick={() => {
                                if (navigator.share) {
                                    navigator.share({
                                        title: 'Quick Poll Daily',
                                        text: `I just voted on the Daily Question: ${data.question.question} ✨`,
                                        url: window.location.origin
                                    });
                                } else {
                                    navigator.clipboard.writeText(window.location.origin);
                                    alert('Link copied!');
                                }
                            }}
                            className="text-[11px] font-bold"
                            style={{ color: 'var(--accent-purple)', background: 'none', border: 'none', padding: 0 }}
                        >
                            Share Result
                        </button>
                    )}
                    <MidnightCountdown />
                </div>
            </div>

            {/* Yesterday's result teaser */}
            {yesterdayResult && (
                <div
                    className="animate-fade-in"
                    style={{
                        marginTop: 'var(--space-3)',
                        paddingTop: 'var(--space-3)',
                        borderTop: '1px solid var(--border-subtle)',
                    }}
                >
                    <div className="flex items-start" style={{ gap: 'var(--space-2)' }}>
                        <span className="text-[12px]" style={{ color: 'var(--text-tertiary)', flexShrink: 0, marginTop: '1px' }}>
                            ⏪
                        </span>
                        <div>
                            <span className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
                                Yesterday:
                            </span>
                            <span className="text-[12px] font-medium" style={{ color: 'var(--text-secondary)', marginLeft: '4px' }}>
                                &ldquo;{yesterdayResult.winnerText}&rdquo; won ({yesterdayResult.winnerPercent}%)
                            </span>
                            <span className="text-[11px]" style={{ color: 'var(--text-tertiary)', marginLeft: '6px' }}>
                                · {yesterdayResult.totalVotes.toLocaleString()} votes
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
