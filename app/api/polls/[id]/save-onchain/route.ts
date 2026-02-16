import { NextRequest, NextResponse } from 'next/server';
import { updatePollOnchainTx } from '@/lib/db';

/**
 * POST /api/polls/[id]/save-onchain
 * Body: { txHash: string }
 * Updates the poll's onchain_tx field after successful on-chain save
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        const body = await request.json();
        const { txHash } = body;

        if (!txHash || typeof txHash !== 'string') {
            return NextResponse.json({ error: 'txHash is required' }, { status: 400 });
        }

        const updated = updatePollOnchainTx(id, txHash);

        if (!updated) {
            return NextResponse.json({ error: 'Poll not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, onchain_tx: txHash });
    } catch {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}
