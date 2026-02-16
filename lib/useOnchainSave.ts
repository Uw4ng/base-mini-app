'use client';

import { useState, useCallback } from 'react';
import { useAccount, useConnect, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { keccak256, toBytes, stringToHex, pad } from 'viem';
import { coinbaseWallet } from 'wagmi/connectors';
import {
    QUICKPOLL_REGISTRY_ADDRESS,
    QUICKPOLL_REGISTRY_ABI,
} from './contractConfig';

interface PollDataForChain {
    pollId: string;
    question: string;
    options: { id: string; text: string }[];
    voteCounts: Record<string, number>;
    totalVotes: number;
}

interface UseOnchainSaveReturn {
    save: (data: PollDataForChain) => Promise<void>;
    isPending: boolean;
    isConnecting: boolean;
    isSuccess: boolean;
    txHash: string | null;
    error: string | null;
    reset: () => void;
}

/**
 * Hook for saving poll results on-chain via QuickPollRegistry
 * - Connects wallet if needed (Coinbase Smart Wallet)
 * - Hashes question + options for lightweight on-chain storage
 * - Calls savePollResult on the contract
 * - Returns tx hash for BaseScan link
 */
export function useOnchainSave(): UseOnchainSaveReturn {
    const { isConnected } = useAccount();
    const { connectAsync } = useConnect();
    const { writeContractAsync } = useWriteContract();

    const [isPending, setIsPending] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [txHash, setTxHash] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // For tx confirmation tracking
    const { isLoading: isConfirming } = useWaitForTransactionReceipt({
        hash: txHash as `0x${string}` | undefined,
    });

    const reset = useCallback(() => {
        setIsPending(false);
        setIsConnecting(false);
        setIsSuccess(false);
        setTxHash(null);
        setError(null);
    }, []);

    const save = useCallback(async (data: PollDataForChain) => {
        setError(null);
        setIsSuccess(false);
        setTxHash(null);

        try {
            // Step 1: Connect wallet if needed
            if (!isConnected) {
                setIsConnecting(true);
                try {
                    await connectAsync({
                        connector: coinbaseWallet({
                            appName: 'Quick Poll',
                            preference: 'smartWalletOnly',
                        }),
                    });
                } catch (connectError) {
                    setError('Wallet connection cancelled');
                    setIsConnecting(false);
                    return;
                }
                setIsConnecting(false);
            }

            setIsPending(true);

            // Step 2: Generate hashes
            const questionHash = keccak256(toBytes(data.question));

            const optionsWithResults = data.options.map(opt => ({
                id: opt.id,
                text: opt.text,
                votes: data.voteCounts[opt.id] || 0,
            }));
            const optionsHash = keccak256(toBytes(JSON.stringify(optionsWithResults)));

            // Step 3: Convert pollId (UUID) to bytes32
            // Remove hyphens and pad to 32 bytes
            const cleanId = data.pollId.replace(/-/g, '');
            const pollIdBytes = pad(stringToHex(cleanId, { size: 32 }), { size: 32 });

            // Step 4: Call contract
            const hash = await writeContractAsync({
                address: QUICKPOLL_REGISTRY_ADDRESS,
                abi: QUICKPOLL_REGISTRY_ABI,
                functionName: 'savePollResult',
                args: [
                    pollIdBytes,
                    questionHash,
                    optionsHash,
                    BigInt(data.totalVotes),
                ],
            });

            setTxHash(hash);
            setIsSuccess(true);

            // Step 5: Notify backend
            try {
                await fetch(`/api/polls/${data.pollId}/save-onchain`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ txHash: hash }),
                });
            } catch {
                // Non-critical: tx is still on-chain even if backend update fails
            }

        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Transaction failed';
            // Simplify common error messages
            if (message.includes('User rejected') || message.includes('denied')) {
                setError('Transaction cancelled');
            } else if (message.includes('insufficient funds')) {
                setError('Insufficient funds for gas');
            } else {
                setError(message.slice(0, 100));
            }
        } finally {
            setIsPending(false);
        }
    }, [isConnected, connectAsync, writeContractAsync]);

    return {
        save,
        isPending: isPending || isConfirming,
        isConnecting,
        isSuccess,
        txHash,
        error,
        reset,
    };
}
