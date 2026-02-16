import { NextRequest, NextResponse } from 'next/server';
import { searchMutuals } from '@/lib/db';

/**
 * GET /api/users/[fid]/mutuals
 * Query: ?q=search_query
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ fid: string }> }
) {
    const { fid } = await params;
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const userFid = parseInt(fid, 10);

    const mutuals = searchMutuals(userFid, query);

    return NextResponse.json({ mutuals });
}
