'use client';

import { useState } from 'react';
import type { PollOption } from '@/lib/db';

interface ImagePollProps {
    options: PollOption[];
    voteCounts?: Record<string, number>;
    totalVotes?: number;
    voted?: string | null;
    onVote?: (optionId: string) => void;
}

export default function ImagePoll({
    options,
    voteCounts = {},
    totalVotes = 0,
    voted = null,
    onVote,
}: ImagePollProps) {
    const [selected, setSelected] = useState(voted);
    const showResults = selected !== null;

    const handleVote = (optionId: string) => {
        if (selected) return;
        setSelected(optionId);
        onVote?.(optionId);
    };

    const getPercentage = (optionId: string) => {
        if (totalVotes === 0) return 50;
        return ((voteCounts[optionId] || 0) / totalVotes) * 100;
    };

    // Generate gradient colors for image placeholders
    const colors = [
        'from-purple-600 to-blue-500',
        'from-pink-500 to-orange-400',
        'from-green-500 to-teal-400',
        'from-blue-500 to-indigo-600',
    ];

    return (
        <div className="grid grid-cols-2 gap-3">
            {options.map((option, index) => {
                const pct = getPercentage(option.id);
                const isSelected = selected === option.id;

                return (
                    <button
                        key={option.id}
                        onClick={() => handleVote(option.id)}
                        className={`relative rounded-xl overflow-hidden aspect-square transition-all ${isSelected ? 'ring-2 ring-accent scale-[1.02]' : ''
                            } ${selected && !isSelected ? 'opacity-70' : ''}`}
                        disabled={!!selected}
                    >
                        {/* Image placeholder with gradient */}
                        <div
                            className={`absolute inset-0 bg-gradient-to-br ${colors[index % colors.length]} flex items-center justify-center`}
                        >
                            <span className="text-4xl">{option.text === 'Tabs' ? '⌨️' : option.text === 'Spaces' ? '⌨️' : '🖼️'}</span>
                        </div>

                        {/* Label */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                            <span className="text-sm font-bold text-white">{option.text}</span>
                            {showResults && (
                                <div className="mt-1">
                                    <div className="h-1.5 rounded-full bg-white/20 overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-white transition-all duration-700"
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                    <span className="text-xs text-white/80 mt-0.5 block">{Math.round(pct)}%</span>
                                </div>
                            )}
                        </div>

                        {/* Selected check */}
                        {isSelected && (
                            <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-accent flex items-center justify-center animate-scale-in">
                                <span className="text-white text-xs">✓</span>
                            </div>
                        )}
                    </button>
                );
            })}
        </div>
    );
}
