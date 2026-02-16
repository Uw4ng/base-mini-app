import { NextRequest, NextResponse } from 'next/server';
import { getPolls, createPoll, getTrendingPolls, getVoteCountsByOption } from '@/lib/db';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const trending = searchParams.get('trending');

    let polls;
    if (trending === 'true') {
        polls = getTrendingPolls(5);
    } else {
        polls = getPolls();
    }

    // Attach vote counts to each poll
    const pollsWithCounts = polls.map(poll => ({
        ...poll,
        voteCounts: getVoteCountsByOption(poll.id),
    }));

    return NextResponse.json({ polls: pollsWithCounts });
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { question, options, poll_type, is_anonymous, expires_at, is_onchain, creator_fid, creator_username, creator_avatar } = body;

        if (!question || !options || options.length < 2) {
            return NextResponse.json(
                { error: 'Question and at least 2 options are required' },
                { status: 400 }
            );
        }

        const poll = createPoll({
            creator_fid: creator_fid || 9999,
            creator_username: creator_username || 'anonymous',
            creator_avatar: creator_avatar || null,
            question,
            poll_type: poll_type || 'standard',
            options,
            is_anonymous: is_anonymous || false,
            expires_at: expires_at || null,
            is_onchain: is_onchain || false,
        });

        return NextResponse.json({ poll }, { status: 201 });
    } catch {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}
