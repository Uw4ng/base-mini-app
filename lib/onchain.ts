// Optional on-chain utilities
// Used only when poll creator explicitly chooses to save results on-chain

export interface OnchainPollResult {
    pollId: string;
    question: string;
    results: { option: string; votes: number }[];
    totalVotes: number;
    txHash: string | null;
}

export async function savePollOnchain(data: {
    pollId: string;
    question: string;
    results: { option: string; votes: number }[];
    totalVotes: number;
}): Promise<OnchainPollResult> {
    // TODO: Implement actual on-chain transaction via Base
    // This would use wagmi/viem to write to a smart contract
    console.log(`[Onchain] Saving poll ${data.pollId} results on-chain...`);

    return {
        ...data,
        txHash: null, // Would be the actual tx hash
    };
}

export function getBaseScanUrl(txHash: string): string {
    return `https://basescan.org/tx/${txHash}`;
}
