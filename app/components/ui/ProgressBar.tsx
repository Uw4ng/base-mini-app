'use client';

import { useEffect, useState } from 'react';

interface ProgressBarProps {
    percentage: number;
    color?: string;
    label?: string;
    animate?: boolean;
    showPercentage?: boolean;
    height?: number;
}

export default function ProgressBar({
    percentage,
    color,
    label,
    animate = true,
    showPercentage = true,
    height = 32,
}: ProgressBarProps) {
    const [width, setWidth] = useState(animate ? 0 : percentage);

    useEffect(() => {
        if (animate) {
            const timer = setTimeout(() => setWidth(percentage), 100);
            return () => clearTimeout(timer);
        }
    }, [percentage, animate]);

    const gradients = [
        'linear-gradient(135deg, #845EF7 0%, #B197FC 100%)',
        'linear-gradient(135deg, #E64980 0%, #F783AC 100%)',
        'linear-gradient(135deg, #51CF66 0%, #A9E34B 100%)',
        'linear-gradient(135deg, #339AF0 0%, #74C0FC 100%)',
        'linear-gradient(135deg, #FFD43B 0%, #FFA94D 100%)',
    ];

    const bgGradient = color || gradients[0];

    return (
        <div className="w-full">
            {label && (
                <div className="flex justify-between items-center mb-1.5">
                    <span className="text-sm font-medium text-foreground/90 truncate pr-2">{label}</span>
                    {showPercentage && (
                        <span className="text-sm font-bold text-foreground/70 tabular-nums">
                            {Math.round(percentage)}%
                        </span>
                    )}
                </div>
            )}
            <div
                className="w-full rounded-full overflow-hidden"
                style={{
                    height: `${height}px`,
                    backgroundColor: 'rgba(255,255,255,0.06)',
                }}
            >
                <div
                    className="h-full rounded-full relative overflow-hidden"
                    style={{
                        width: `${Math.max(width, 2)}%`,
                        background: bgGradient,
                        transition: animate ? 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)' : 'none',
                    }}
                >
                    {/* Shimmer overlay */}
                    <div
                        className="absolute inset-0 animate-shimmer"
                        style={{ opacity: 0.3 }}
                    />
                    {/* Inner percentage text */}
                    {showPercentage && !label && percentage > 10 && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xs font-bold text-white drop-shadow">
                                {Math.round(percentage)}%
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
