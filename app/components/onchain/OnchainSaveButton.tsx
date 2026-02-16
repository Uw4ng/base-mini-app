'use client';

import { useState } from 'react';
import { useOnchainSave } from '@/lib/useOnchainSave';
import { BASESCAN_URL } from '@/lib/contractConfig';

interface OnchainSaveButtonProps {
    pollId: string;
    question: string;
    options: { id: string; text: string }[];
    voteCounts: Record<string, number>;
    totalVotes: number;
    onSaved?: (txHash: string) => void;
}

export default function OnchainSaveButton({
    pollId,
    question,
    options,
    voteCounts,
    totalVotes,
    onSaved,
}: OnchainSaveButtonProps) {
    const { save, isPending, isConnecting, isSuccess, txHash, error, reset } = useOnchainSave();
    const [showConfirm, setShowConfirm] = useState(false);

    const handleSave = async () => {
        setShowConfirm(false);
        await save({ pollId, question, options, voteCounts, totalVotes });
        if (txHash) onSaved?.(txHash);
    };

    if (isSuccess && txHash) {
        return (
            <div
                className="flex items-center justify-between animate-fade-in"
                style={{
                    padding: 'var(--space-3)',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(34, 197, 94, 0.08)',
                    border: '1px solid rgba(34, 197, 94, 0.2)',
                }}
            >
                <div className="flex items-center" style={{ gap: 'var(--space-2)' }}>
                    <span className="text-[14px]">⛓️</span>
                    <div>
                        <div className="text-[13px] font-medium" style={{ color: 'var(--accent-green)' }}>
                            Saved on Base
                        </div>
                        <a
                            href={`${BASESCAN_URL}/tx/${txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] font-mono"
                            style={{ color: 'var(--accent-blue)' }}
                        >
                            {txHash.slice(0, 10)}...{txHash.slice(-8)}
                        </a>
                    </div>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
            </div>
        );
    }

    if (error) {
        return (
            <div
                className="flex items-center justify-between animate-fade-in"
                style={{
                    padding: 'var(--space-3)',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                }}
            >
                <div>
                    <div className="text-[13px] font-medium" style={{ color: 'var(--accent-red)' }}>
                        {error}
                    </div>
                </div>
                <button
                    onClick={reset}
                    className="text-[12px] font-medium"
                    style={{
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-secondary)',
                    }}
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <>
            <button
                onClick={() => setShowConfirm(true)}
                disabled={isPending || isConnecting}
                className="w-full flex items-center justify-center transition-all touch-target"
                style={{
                    gap: 'var(--space-2)',
                    padding: '12px var(--space-4)',
                    borderRadius: 'var(--radius-sm)',
                    background: isPending ? 'var(--bg-tertiary)' : 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(139, 92, 246, 0.15))',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    color: isPending ? 'var(--text-tertiary)' : 'var(--accent-purple)',
                    fontSize: '14px',
                    fontWeight: 600,
                }}
            >
                {isPending ? (
                    <>
                        <div className="animate-spin" style={{ width: '14px', height: '14px', border: '2px solid var(--text-tertiary)', borderTopColor: 'var(--accent-purple)', borderRadius: '50%' }} />
                        Saving to Base...
                    </>
                ) : isConnecting ? (
                    <>
                        <div className="animate-spin" style={{ width: '14px', height: '14px', border: '2px solid var(--text-tertiary)', borderTopColor: 'var(--accent-blue)', borderRadius: '50%' }} />
                        Connecting wallet...
                    </>
                ) : (
                    <>
                        ⛓️ Save Results on Base
                    </>
                )}
            </button>

            {/* Confirmation modal */}
            {showConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)' }}>
                    <div
                        className="w-[90%] max-w-sm animate-scale-in"
                        style={{
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border-default)',
                            borderRadius: 'var(--radius-lg)',
                            padding: 'var(--space-5)',
                        }}
                    >
                        <div className="text-center" style={{ marginBottom: 'var(--space-4)' }}>
                            <div className="text-2xl" style={{ marginBottom: 'var(--space-2)' }}>⛓️</div>
                            <h3 className="text-[16px] font-bold" style={{ marginBottom: 'var(--space-1)' }}>
                                Save Results On-Chain
                            </h3>
                            <p className="text-[13px]" style={{ color: 'var(--text-tertiary)' }}>
                                This permanently records the poll results on Base. Gas is sponsored — no cost to you.
                            </p>
                        </div>

                        <div
                            className="text-[12px]"
                            style={{
                                padding: 'var(--space-3)',
                                borderRadius: 'var(--radius-sm)',
                                background: 'var(--bg-tertiary)',
                                marginBottom: 'var(--space-4)',
                            }}
                        >
                            <div className="flex justify-between" style={{ marginBottom: '4px' }}>
                                <span style={{ color: 'var(--text-tertiary)' }}>Question hash</span>
                                <span style={{ color: 'var(--text-secondary)' }}>keccak256</span>
                            </div>
                            <div className="flex justify-between" style={{ marginBottom: '4px' }}>
                                <span style={{ color: 'var(--text-tertiary)' }}>Results hash</span>
                                <span style={{ color: 'var(--text-secondary)' }}>keccak256</span>
                            </div>
                            <div className="flex justify-between" style={{ marginBottom: '4px' }}>
                                <span style={{ color: 'var(--text-tertiary)' }}>Total votes</span>
                                <span style={{ color: 'var(--text-secondary)' }}>{totalVotes}</span>
                            </div>
                            <div className="flex justify-between">
                                <span style={{ color: 'var(--text-tertiary)' }}>Network</span>
                                <span style={{ color: 'var(--accent-blue)' }}>Base Sepolia</span>
                            </div>
                        </div>

                        <div className="flex" style={{ gap: 'var(--space-2)' }}>
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="flex-1 touch-target"
                                style={{
                                    padding: '12px',
                                    borderRadius: 'var(--radius-sm)',
                                    background: 'var(--bg-tertiary)',
                                    border: '1px solid var(--border-default)',
                                    color: 'var(--text-secondary)',
                                    fontSize: '14px',
                                    fontWeight: 600,
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex-1 touch-target"
                                style={{
                                    padding: '12px',
                                    borderRadius: 'var(--radius-sm)',
                                    background: 'var(--accent-purple)',
                                    border: 'none',
                                    color: 'white',
                                    fontSize: '14px',
                                    fontWeight: 600,
                                }}
                            >
                                Confirm & Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
