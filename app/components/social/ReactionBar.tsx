'use client';

import { useState } from 'react';

interface ReactionBarProps {
    pollId: string;
    compact?: boolean;
    onReact?: (pollId: string, reaction: string) => void;
}

export default function ReactionBar({ pollId, compact = false, onReact }: ReactionBarProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [reaction, setReaction] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const quickReactions = ['🔥', '💯', '🤔', '😂', '👀', '❤️'];

    const handleSubmit = () => {
        if (!reaction.trim()) return;
        onReact?.(pollId, reaction.trim());
        setSubmitted(true);
        setIsOpen(false);
    };

    if (submitted) {
        return (
            <span className="text-xs text-success animate-fade-in">✓ Reacted</span>
        );
    }

    if (compact) {
        return (
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-xs text-muted hover:text-foreground transition-colors"
            >
                💬
            </button>
        );
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1 text-xs text-muted hover:text-foreground transition-colors px-2 py-1 rounded-lg hover:bg-foreground/5"
            >
                💬 React
            </button>

            {isOpen && (
                <div className="absolute bottom-full right-0 mb-2 glass rounded-xl p-3 w-64 animate-scale-in z-30">
                    {/* Quick reactions */}
                    <div className="flex gap-1 mb-2">
                        {quickReactions.map(emoji => (
                            <button
                                key={emoji}
                                onClick={() => {
                                    setReaction(emoji);
                                    onReact?.(pollId, emoji);
                                    setSubmitted(true);
                                    setIsOpen(false);
                                }}
                                className="w-8 h-8 rounded-lg hover:bg-foreground/10 flex items-center justify-center transition-transform hover:scale-125"
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>

                    {/* Text reaction */}
                    <div className="flex gap-1.5">
                        <input
                            value={reaction}
                            onChange={e => setReaction(e.target.value)}
                            placeholder="Write a reaction..."
                            className="flex-1 bg-foreground/5 border border-border rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-accent"
                            maxLength={100}
                            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                        />
                        <button
                            onClick={handleSubmit}
                            disabled={!reaction.trim()}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-white disabled:opacity-40"
                            style={{ background: 'var(--accent-gradient)' }}
                        >
                            Send
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
