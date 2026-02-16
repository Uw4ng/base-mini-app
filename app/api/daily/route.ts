import { NextRequest, NextResponse } from 'next/server';
import {
    getDailyQuestionWithVotes,
    getYesterdayResult,
    getDayNumber,
    getDailyStreak,
    recordDailyVote,
    hasUserVoted,
    createVote,
    getVoteCountsByOption,
} from '@/lib/db';

/**
 * GET /api/daily
 * Returns today's daily question with vote counts, day number, yesterday result, streak
 * Query: ?fid=<user_fid>
 */
export async function GET(request: NextRequest) {
    const fid = request.nextUrl.searchParams.get('fid')
        ? parseInt(request.nextUrl.searchParams.get('fid')!, 10)
        : undefined;

    const data = getDailyQuestionWithVotes();
    if (!data) {
        return NextResponse.json({ question: null }, { status: 200 });
    }

    const userVote = fid ? hasUserVoted(data.question.id, fid) : undefined;
    const dayNumber = getDayNumber();
    const yesterdayResult = getYesterdayResult();
    const streak = fid ? getDailyStreak(fid) : null;

    return NextResponse.json({
        ...data,
        dayNumber,
        yesterdayResult,
        streak,
        userVotedOptionId: userVote?.option_id || null,
    });
}

/**
 * POST /api/daily
 * Vote on the daily question and update streak
 * Body: { optionId, voterFid, voterUsername }
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const data = getDailyQuestionWithVotes();

        if (!data) {
            return NextResponse.json({ error: 'No daily question today' }, { status: 404 });
        }

        const voterFid = body.voterFid || 9999;

        const vote = createVote({
            poll_id: data.question.id,
            voter_fid: voterFid,
            voter_username: body.voterUsername || 'anon',
            option_id: body.optionId,
        });

        if (!vote) {
            return NextResponse.json({ error: 'Already voted' }, { status: 409 });
        }

        // Update streak
        const updatedStreak = recordDailyVote(voterFid);

        const updatedCounts = getVoteCountsByOption(data.question.id);
        const total = Object.values(updatedCounts).reduce((a, b) => a + b, 0);

        return NextResponse.json({
            success: true,
            voteCounts: updatedCounts,
            totalVotes: total,
            streak: updatedStreak,
        }, { status: 201 });
    } catch {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}
