import { NextRequest, NextResponse } from 'next/server';
import { createVote, hasUserVoted, getPollById, getVoteCountsByOption, getVotesForPoll } from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { poll_id, voter_fid, voter_username, voter_avatar, option_id, prediction, reaction } = body;

        if (!poll_id || !option_id) {
            return NextResponse.json(
                { error: 'poll_id and option_id are required' },
                { status: 400 }
            );
        }

        const poll = getPollById(poll_id);
        if (!poll) {
            return NextResponse.json({ error: 'Poll not found' }, { status: 404 });
        }

        // Check if poll has expired
        if (poll.expires_at && new Date(poll.expires_at) < new Date()) {
            return NextResponse.json({ error: 'Poll has expired' }, { status: 400 });
        }

        // Check already voted
        const existing = hasUserVoted(poll_id, voter_fid || 9999);
        if (existing) {
            return NextResponse.json(
                { error: 'You have already voted on this poll' },
                { status: 409 }
            );
        }

        const vote = createVote({
            poll_id,
            voter_fid: voter_fid || 9999,
            voter_username: voter_username || 'anonymous',
            voter_avatar: voter_avatar || null,
            option_id,
            prediction: prediction || null,
            reaction: reaction || null,
        });

        if (!vote) {
            return NextResponse.json(
                { error: 'Failed to create vote' },
                { status: 500 }
            );
        }

        // Return updated counts
        const voteCounts = getVoteCountsByOption(poll_id);
        const updatedPoll = getPollById(poll_id);
        const recentVoters = getVotesForPoll(poll_id).slice(-5);

        return NextResponse.json({
            vote,
            voteCounts,
            totalVotes: updatedPoll?.total_votes || 0,
            recentVoters,
        }, { status: 201 });
    } catch {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}
