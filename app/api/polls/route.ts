import { NextRequest, NextResponse } from 'next/server';
import { getPolls, getTrendingPolls, createPoll, enrichPoll } from '@/lib/db';

/**
 * GET /api/polls
 * Query params:
 *   ?cursor=<timestamp> — for pagination
 *   &limit=10
 *   &fid=<user_fid> — to include user's vote status
 *   &trending=true — for trending sort
 */
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const trending = searchParams.get('trending') === 'true';
    const cursor = searchParams.get('cursor') || undefined;
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const fid = searchParams.get('fid') ? parseInt(searchParams.get('fid')!, 10) : undefined;

    if (trending) {
        const trendingPolls = getTrendingPolls(limit);
        const enriched = trendingPolls.map(p => enrichPoll(p, fid));
        return NextResponse.json({ polls: enriched, nextCursor: null });
    }

    const { polls, nextCursor } = getPolls({ cursor, limit });
    const enriched = polls.map(p => enrichPoll(p, fid));

    return NextResponse.json({ polls: enriched, nextCursor });
}

/**
 * POST /api/polls
 * Body: { creator_fid, creator_username, question, options, poll_type, is_anonymous, is_prediction, expires_at, is_onchain }
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        if (!body.question || !body.options || body.options.length < 2) {
            return NextResponse.json(
                { error: 'Question and at least 2 options are required' },
                { status: 400 }
            );
        }

        const poll = createPoll({
            creator_fid: body.creator_fid || 9999,
            creator_username: body.creator_username || 'anon',
            creator_avatar: body.creator_avatar || null,
            question: body.question,
            poll_type: body.poll_type || 'standard',
            options: body.options,
            is_anonymous: body.is_anonymous || false,
            is_prediction: body.is_prediction || false,
            expires_at: body.expires_at || null,
            is_onchain: body.is_onchain || false,
        });

        return NextResponse.json({
            poll: enrichPoll(poll),
            pollId: poll.id,
            shareUrl: `/poll/${poll.id}`,
        }, { status: 201 });
    } catch {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
}
