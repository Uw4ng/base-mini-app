import { NextRequest, NextResponse } from 'next/server';
import { getPollById, enrichPoll, getReactionsForPoll, getRecentVoters } from '@/lib/db';

/**
 * GET /api/polls/[id]
 * Returns full poll data with all votes (or anonymous aggregate)
 * Query: ?fid=<user_fid>
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const fid = request.nextUrl.searchParams.get('fid')
        ? parseInt(request.nextUrl.searchParams.get('fid')!, 10)
        : undefined;

    const poll = getPollById(id);
    if (!poll) {
        return NextResponse.json({ error: 'Poll not found' }, { status: 404 });
    }

    const enriched = enrichPoll(poll, fid);

    // For anonymous polls, strip voter info
    if (poll.is_anonymous) {
        return NextResponse.json({
            ...enriched,
            recentVoters: [],
            reactions: enriched.reactions.map(r => ({
                ...r,
                username: 'Anonymous',
                fid: 0,
                avatar: null,
            })),
        });
    }

    // Include full reactions and voters for non-anonymous
    const allReactions = getReactionsForPoll(id);
    const voters = getRecentVoters(id, 10);

    return NextResponse.json({
        ...enriched,
        reactions: allReactions,
        recentVoters: voters,
    });
}
