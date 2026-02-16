'use client';

import { useState } from 'react';

interface ShareButtonProps {
    pollId: string;
    question: string;
}

export default function ShareButton({ pollId, question }: ShareButtonProps) {
    const [copied, setCopied] = useState(false);

    const shareUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/poll/${pollId}`
        : `/poll/${pollId}`;

    const handleShare = async () => {
        // Try native share first (works in MiniKit / mobile)
        if (typeof navigator !== 'undefined' && navigator.share) {
            try {
                await navigator.share({
                    title: 'Quick Poll',
                    text: question,
                    url: shareUrl,
                });
                return;
            } catch {
                // User cancelled or not supported
            }
        }

        // Fallback: copy to clipboard
        try {
            await navigator.clipboard.writeText(`${question}\n\nVote now: ${shareUrl}`);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Clipboard not available
        }
    };

    return (
        <button
            onClick={handleShare}
            className="flex items-center gap-1 text-xs text-muted hover:text-foreground transition-colors px-2 py-1 rounded-lg hover:bg-foreground/5"
        >
            {copied ? (
                <span className="text-success animate-fade-in">✓ Copied</span>
            ) : (
                <>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="18" cy="5" r="3" />
                        <circle cx="6" cy="12" r="3" />
                        <circle cx="18" cy="19" r="3" />
                        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                    </svg>
                    Share
                </>
            )}
        </button>
    );
}
