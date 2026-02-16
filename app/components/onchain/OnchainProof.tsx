'use client';

import { BASESCAN_URL } from '@/lib/contractConfig';

interface OnchainProofProps {
    txHash: string;
    blockNumber?: number;
    timestamp?: string;
}

export default function OnchainProof({ txHash, blockNumber, timestamp }: OnchainProofProps) {
    const txUrl = `${BASESCAN_URL}/tx/${txHash}`;

    return (
        <div
            className="animate-fade-in"
            style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
            }}
        >
            {/* Header */}
            <div
                className="flex items-center"
                style={{
                    gap: 'var(--space-2)',
                    padding: 'var(--space-3) var(--space-4)',
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.06), rgba(139, 92, 246, 0.06))',
                    borderBottom: '1px solid var(--border-subtle)',
                }}
            >
                <span className="text-[14px]">⛓️</span>
                <span className="text-[14px] font-bold">On-Chain Proof</span>
            </div>

            {/* Details */}
            <div style={{ padding: 'var(--space-3) var(--space-4)' }}>
                <div className="flex flex-col" style={{ gap: 'var(--space-3)' }}>
                    {/* Tx Hash */}
                    <div className="flex items-center justify-between">
                        <span className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>Transaction</span>
                        <a
                            href={txUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-[12px] font-mono transition-colors"
                            style={{ color: 'var(--accent-blue)', gap: '4px' }}
                        >
                            {txHash.slice(0, 10)}...{txHash.slice(-8)}
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                <polyline points="15 3 21 3 21 9" />
                                <line x1="10" y1="14" x2="21" y2="3" />
                            </svg>
                        </a>
                    </div>

                    {/* Block Number */}
                    {blockNumber && (
                        <div className="flex items-center justify-between">
                            <span className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>Block</span>
                            <span className="text-[12px] font-mono tabular-nums" style={{ color: 'var(--text-secondary)' }}>
                                #{blockNumber.toLocaleString()}
                            </span>
                        </div>
                    )}

                    {/* Timestamp */}
                    {timestamp && (
                        <div className="flex items-center justify-between">
                            <span className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>Saved at</span>
                            <span className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>
                                {new Date(timestamp).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </span>
                        </div>
                    )}
                </div>

                {/* Footer note */}
                <div
                    className="text-[11px] text-center"
                    style={{
                        marginTop: 'var(--space-3)',
                        paddingTop: 'var(--space-3)',
                        borderTop: '1px solid var(--border-subtle)',
                        color: 'var(--text-tertiary)',
                    }}
                >
                    This poll&apos;s results are permanently recorded on Base
                </div>
            </div>
        </div>
    );
}
