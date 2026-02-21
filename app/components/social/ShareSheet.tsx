'use client';

import { useState } from 'react';
import BottomSheet from '../ui/BottomSheet';

interface ShareSheetProps {
    isOpen: boolean;
    onClose: () => void;
    pollId: string;
    question: string;
    isExpired?: boolean;
}

export default function ShareSheet({ isOpen, onClose, pollId, question, isExpired = false }: ShareSheetProps) {
    const [copied, setCopied] = useState(false);

    const shareUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/poll/${pollId}`
        : `/poll/${pollId}`;

    const handleShareToFeed = () => {
        const castText = `Check out this poll: ${question} 🗳️`;
        const farcasterUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(castText)}&embeds[]=${encodeURIComponent(shareUrl)}`;
        window.open(farcasterUrl, '_blank');
        onClose();
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => { setCopied(false); onClose(); }, 1500);
        } catch {
            // Fallback
            const input = document.createElement('input');
            input.value = shareUrl;
            document.body.appendChild(input);
            input.select();
            document.execCommand('copy');
            document.body.removeChild(input);
            setCopied(true);
            setTimeout(() => { setCopied(false); onClose(); }, 1500);
        }
    };

    const handleShareResults = async () => {
        // Try native share with the result card URL
        const resultUrl = `${shareUrl}?results=true`;
        if (typeof navigator !== 'undefined' && navigator.share) {
            try {
                await navigator.share({
                    title: 'Quick Poll Results',
                    text: `Results for: ${question}`,
                    url: resultUrl,
                });
                onClose();
                return;
            } catch { /* Cancelled */ }
        }
        // Fallback: copy result URL
        await navigator.clipboard.writeText(resultUrl);
        setCopied(true);
        setTimeout(() => { setCopied(false); onClose(); }, 1500);
    };

    const options = [
        {
            icon: '📢',
            label: 'Share to Feed',
            description: 'Cast to your Farcaster feed',
            onClick: handleShareToFeed,
            color: 'var(--accent-purple)',
        },
        {
            icon: '𝕏',
            label: 'Share to X',
            description: 'Post to your X / Twitter timeline',
            onClick: () => {
                const text = `Check out this poll: ${question} 🗳️`;
                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
                onClose();
            },
            color: '#000000',
        },
        {
            icon: '🔗',
            label: copied ? '✓ Copied!' : 'Copy Link',
            description: 'Copy the poll URL to clipboard',
            onClick: handleCopyLink,
            color: 'var(--accent-blue)',
        },
        ...(isExpired ? [{
            icon: '📊',
            label: 'Share Results',
            description: 'Share the final results',
            onClick: handleShareResults,
            color: 'var(--accent-green)',
        }] : []),
    ];

    return (
        <BottomSheet isOpen={isOpen} onClose={onClose} title="Share">
            <div className="flex flex-col" style={{ gap: 'var(--space-2)' }}>
                {options.map(opt => (
                    <button
                        key={opt.label}
                        onClick={opt.onClick}
                        className="flex items-center w-full text-left touch-target transition-all"
                        style={{
                            padding: 'var(--space-3) var(--space-4)',
                            borderRadius: 'var(--radius-md)',
                            background: 'var(--bg-tertiary)',
                            border: '1px solid var(--border-subtle)',
                            gap: 'var(--space-3)',
                        }}
                    >
                        <div
                            className="flex items-center justify-center rounded-full flex-shrink-0"
                            style={{
                                width: '40px', height: '40px',
                                background: `${opt.color}20`,
                                fontSize: '18px',
                            }}
                        >
                            {opt.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                                {opt.label}
                            </div>
                            <div className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
                                {opt.description}
                            </div>
                        </div>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                            <polyline points="9 18 15 12 9 6" />
                        </svg>
                    </button>
                ))}
            </div>
        </BottomSheet>
    );
}
