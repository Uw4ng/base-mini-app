import { NextRequest, NextResponse } from 'next/server';
import { getVoterDetails, getNetworkBreakdown } from '@/lib/db';

/**
 * GET /api/polls/[id]/voters
 * Query: ?fid=user_fid&breakdown=true
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const fid = searchParams.get('fid') ? parseInt(searchParams.get('fid')!, 10) : undefined;
    const wantBreakdown = searchParams.get('breakdown') === 'true';

    const voters = getVoterDetails(id, fid);

    const result: Record<string, unknown> = { voters };

    if (wantBreakdown && fid) {
        result.breakdown = getNetworkBreakdown(id, fid);
    }

    return NextResponse.json(result);
}
