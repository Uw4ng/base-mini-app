'use client';

import { useState } from 'react';
import type { PollOption } from '@/lib/db';

interface ThisOrThatProps {
    options: PollOption[];
    voteCounts?: Record<string, number>;
    totalVotes?: number;
    voted?: string | null;
    onVote?: (optionId: string) => void;
}

export default function ThisOrThat({
    options,
    voteCounts = {},
    totalVotes = 0,
    voted = null,
    onVote,
}: ThisOrThatProps) {
    const [selected, setSelected] = useState(voted);
    const [animating, setAnimating] = useState(false);
    const showResults = selected !== null;

    const optionA = options[0];
    const optionB = options[1];

    const handleVote = (optionId: string) => {
        if (selected || animating) return;
        setAnimating(true);
        setSelected(optionId);
        onVote?.(optionId);
        setTimeout(() => setAnimating(false), 600);
    };

    const getPct = (optionId: string) => {
        if (totalVotes === 0) return 50;
        return ((voteCounts[optionId] || 0) / totalVotes) * 100;
    };

    const pctA = getPct(optionA?.id || '');
    const pctB = getPct(optionB?.id || '');

    if (!optionA || !optionB) return null;

    return (
        <div className="relative">
            <div className="grid grid-cols-2 gap-0">
                {/* Option A */}
                <button
                    onClick={() => handleVote(optionA.id)}
                    disabled={!!selected}
                    className={`relative h-32 rounded-l-xl overflow-hidden transition-all ${selected === optionA.id ? 'scale-[1.02] z-10' : ''
                        } ${selected === optionB.id ? 'opacity-70' : ''}`}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-blue-600" />
                    <div className="relative z-10 h-full flex flex-col items-center justify-center px-3">
                        <span className="text-lg font-bold text-white text-center leading-tight">
                            {optionA.text}
                        </span>
                        {showResults && (
                            <div className="mt-2 animate-scale-in">
                                <span className="text-2xl font-black text-white">{Math.round(pctA)}%</span>
                                <div className="text-xs text-white/60">{voteCounts[optionA.id] || 0} votes</div>
                            </div>
                        )}
                        {selected === optionA.id && (
                            <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-white/30 flex items-center justify-center">
                                <span className="text-white text-xs">✓</span>
                            </div>
                        )}
                    </div>
                </button>

                {/* Option B */}
                <button
                    onClick={() => handleVote(optionB.id)}
                    disabled={!!selected}
                    className={`relative h-32 rounded-r-xl overflow-hidden transition-all ${selected === optionB.id ? 'scale-[1.02] z-10' : ''
                        } ${selected === optionA.id ? 'opacity-70' : ''}`}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-red-500" />
                    <div className="relative z-10 h-full flex flex-col items-center justify-center px-3">
                        <span className="text-lg font-bold text-white text-center leading-tight">
                            {optionB.text}
                        </span>
                        {showResults && (
                            <div className="mt-2 animate-scale-in">
                                <span className="text-2xl font-black text-white">{Math.round(pctB)}%</span>
                                <div className="text-xs text-white/60">{voteCounts[optionB.id] || 0} votes</div>
                            </div>
                        )}
                        {selected === optionB.id && (
                            <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-white/30 flex items-center justify-center">
                                <span className="text-white text-xs">✓</span>
                            </div>
                        )}
                    </div>
                </button>
            </div>

            {/* VS badge */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                <div className={`w-10 h-10 rounded-full bg-background border-2 border-border flex items-center justify-center font-black text-sm ${animating ? 'animate-bounce' : ''}`}>
                    VS
                </div>
            </div>
        </div>
    );
}
