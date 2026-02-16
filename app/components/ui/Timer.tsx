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
    const [urgency, setUrgency] = useState<'normal' | 'warning' | 'danger'>('normal');

    useEffect(() => {
        function update() {
            const now = new Date().getTime();
            const target = new Date(expiresAt).getTime();
            const diff = target - now;

            if (diff <= 0) {
                setTimeLeft('Ended');
                setIsExpired(true);
                setUrgency('danger');
                onExpire?.();
                return;
            }

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            if (hours > 0) {
                setTimeLeft(`${hours}h ${minutes}m`);
                setUrgency('normal');
            } else if (minutes > 10) {
                setTimeLeft(`${minutes}m ${seconds}s`);
                setUrgency('normal');
            } else if (minutes > 0) {
                setTimeLeft(`${minutes}m ${seconds}s`);
                setUrgency('warning');
            } else {
                setTimeLeft(`${seconds}s`);
                setUrgency('danger');
            }
        }

        update();
        const interval = setInterval(update, 1000);
        return () => clearInterval(interval);
    }, [expiresAt, onExpire]);

    const colors = {
        normal: 'text-muted',
        warning: 'text-warning',
        danger: 'text-danger',
    };

    if (compact) {
        return (
            <span className={`text-xs font-medium tabular-nums ${colors[urgency]} ${urgency === 'danger' && !isExpired ? 'animate-pulse' : ''}`}>
                ⏱ {timeLeft}
            </span>
        );
    }

    return (
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${colors[urgency]} ${isExpired ? 'bg-danger/10' : 'bg-foreground/5'} ${urgency === 'danger' && !isExpired ? 'animate-pulse' : ''}`}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
            </svg>
            {timeLeft}
        </div>
    );
}
