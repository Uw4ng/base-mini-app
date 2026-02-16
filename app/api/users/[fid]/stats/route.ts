import { NextRequest, NextResponse } from 'next/server';
import { getUserStats } from '@/lib/db';

/**
 * GET /api/users/[fid]/stats
 */
export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ fid: string }> }
) {
    const { fid } = await params;
    const userFid = parseInt(fid, 10);
    const stats = getUserStats(userFid);

    return NextResponse.json({ stats });
}
