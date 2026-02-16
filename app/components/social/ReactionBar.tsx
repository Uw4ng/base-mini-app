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
            <span className="text-[12px] font-medium animate-fade-in" style={{ color: 'var(--accent-green)' }}>✓ Reacted</span>
        );
    }

    if (compact) {
        return (
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-[13px] transition-colors touch-target flex items-center justify-center"
                style={{ color: 'var(--text-secondary)', width: '32px', height: '32px' }}
                aria-label="React to poll"
            >
                💬
            </button>
        );
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center text-reaction transition-colors touch-target"
                style={{
                    gap: 'var(--space-1)',
                    padding: 'var(--space-1) var(--space-2)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-secondary)',
                    background: 'transparent',
                    border: 'none',
                }}
                aria-label="React to poll"
            >
                💬 React
            </button>

            {isOpen && (
                <div
                    className="absolute bottom-full right-0 animate-scale-in z-30"
                    style={{
                        marginBottom: 'var(--space-2)',
                        width: '260px',
                        padding: 'var(--space-3)',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-default)',
                        borderRadius: 'var(--radius-md)',
                    }}
                >
                    {/* Quick reactions */}
                    <div className="flex" style={{ gap: 'var(--space-1)', marginBottom: 'var(--space-2)' }}>
                        {quickReactions.map(emoji => (
                            <button
                                key={emoji}
                                onClick={() => {
                                    onReact?.(pollId, emoji);
                                    setSubmitted(true);
                                    setIsOpen(false);
                                }}
                                className="flex items-center justify-center transition-transform hover:scale-125 touch-target"
                                style={{
                                    width: '36px', height: '36px',
                                    borderRadius: 'var(--radius-sm)',
                                    background: 'transparent',
                                    border: 'none',
                                    fontSize: '18px',
                                }}
                                aria-label={`React with ${emoji}`}
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>

                    {/* Text reaction */}
                    <div className="flex" style={{ gap: 'var(--space-2)' }}>
                        <input
                            value={reaction}
                            onChange={e => setReaction(e.target.value)}
                            placeholder="Write a reaction..."
                            className="flex-1 text-reaction focus:outline-none"
                            style={{
                                background: 'var(--bg-tertiary)',
                                border: '1px solid var(--border-subtle)',
                                borderRadius: 'var(--radius-sm)',
                                padding: 'var(--space-2) var(--space-3)',
                                color: 'var(--text-primary)',
                            }}
                            maxLength={100}
                            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                            onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--border-focus)'; }}
                            onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
                        />
                        <button
                            onClick={handleSubmit}
                            disabled={!reaction.trim()}
                            className="text-[13px] font-semibold transition-all"
                            style={{
                                padding: 'var(--space-2) var(--space-3)',
                                borderRadius: 'var(--radius-sm)',
                                background: reaction.trim() ? 'var(--accent-blue)' : 'var(--bg-tertiary)',
                                color: reaction.trim() ? 'white' : 'var(--text-tertiary)',
                                border: 'none',
                                opacity: reaction.trim() ? 1 : 0.5,
                            }}
                        >
                            Send
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
