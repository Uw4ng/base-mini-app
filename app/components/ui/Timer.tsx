'use client';

import { useEffect, useState } from 'react';

interface TimerProps {
    expiresAt: string;
    onExpire?: () => void;
    compact?: boolean;
}

export default function Timer({ expiresAt, onExpire, compact = false }: TimerProps) {
    const [timeLeft, setTimeLeft] = useState('');
    const [isExpired, setIsExpired] = useState(false);
    const [isUrgent, setIsUrgent] = useState(false);

    useEffect(() => {
        function update() {
            const now = new Date().getTime();
            const target = new Date(expiresAt).getTime();
            const diff = target - now;

            if (diff <= 0) {
                setTimeLeft('Ended');
                setIsExpired(true);
                onExpire?.();
                return;
            }

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            if (hours > 0) {
                setTimeLeft(`${hours}h ${minutes}m left`);
                setIsUrgent(false);
            } else if (minutes > 0) {
                setTimeLeft(`${minutes}m ${seconds}s left`);
                setIsUrgent(minutes < 10);
            } else {
                setTimeLeft(`${seconds}s left`);
                setIsUrgent(true);
            }
        }

        update();
        const interval = setInterval(update, 1000);
        return () => clearInterval(interval);
    }, [expiresAt, onExpire]);

    if (compact) {
        return (
            <span className={`text-timer tabular-nums ${isUrgent && !isExpired ? 'animate-timer-pulse' : ''}`}>
                {isExpired ? (
                    <span style={{ color: 'var(--accent-red)' }}>Ended</span>
                ) : (
                    <>⏱ {timeLeft}</>
                )}
            </span>
        );
    }

    return (
        <div className={`timer-badge ${isUrgent && !isExpired ? 'animate-timer-pulse' : ''}`}
            style={isExpired ? { background: 'rgba(239, 68, 68, 0.15)', color: 'var(--accent-red)' } : {}}
        >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
            </svg>
            <span className="tabular-nums">{timeLeft}</span>
        </div>
    );
}
