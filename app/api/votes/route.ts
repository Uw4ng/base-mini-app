import { NextRequest, NextResponse } from 'next/server';
import {
    getPollById,
    createVote,
    addReaction,
    getVoteCountsByOption,
    getMajorityOptionId,
    hasUserVoted,
} from '@/lib/db';

/**
 * POST /api/votes
 * Body: { pollId, optionId, voterFid, voterUsername, voterAvatar?, prediction?, reaction? }
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const { pollId, optionId, voterFid, voterUsername, voterAvatar, prediction, reaction } = body;

        if (!pollId || !optionId || !voterFid) {
            return NextResponse.json(
                { error: 'pollId, optionId, and voterFid are required' },
                { status: 400 }
            );
        }

        // Check poll exists
        const poll = getPollById(pollId);
        if (!poll) {
            return NextResponse.json({ error: 'Poll not found' }, { status: 404 });
        }

        // Check poll not expired
        if (poll.expires_at && new Date(poll.expires_at) < new Date()) {
            return NextResponse.json({ error: 'Poll has expired' }, { status: 400 });
        }

        // Check valid option
        const validOption = poll.options.find(o => o.id === optionId);
        if (!validOption) {
            return NextResponse.json({ error: 'Invalid option' }, { status: 400 });
        }

        // Check duplicate
        const existingVote = hasUserVoted(pollId, voterFid);
        if (existingVote) {
            // If they already voted, allow adding a reaction only
            if (reaction) {
                addReaction(pollId, voterFid, reaction);
            }
            const voteCounts = getVoteCountsByOption(pollId);
            return NextResponse.json({
                error: 'Already voted',
                voteCounts,
                totalVotes: poll.total_votes,
                userVotedOptionId: existingVote.option_id,
            }, { status: 409 });
        }

        // Create the vote
        const vote = createVote({
            poll_id: pollId,
            voter_fid: voterFid,
            voter_username: voterUsername || 'anon',
            voter_avatar: voterAvatar || null,
            option_id: optionId,
            prediction: prediction || null,
            reaction: reaction || null,
        });

        if (!vote) {
            return NextResponse.json({ error: 'Failed to create vote' }, { status: 500 });
        }

        // Build response
        const voteCounts = getVoteCountsByOption(pollId);
        const majorityId = getMajorityOptionId(pollId);
        const predictionCorrect = prediction ? prediction === majorityId : null;

        return NextResponse.json({
            success: true,
            voteId: vote.id,
            voteCounts,
            totalVotes: poll.total_votes,
            majorityOptionId: majorityId,
            predictionCorrect,
        }, { status: 201 });
    } catch {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
}
