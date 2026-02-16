import { NextRequest, NextResponse } from 'next/server';
import { sendPollNotification } from '@/lib/notifications';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { targetFid, pollId, pollQuestion, message } = body;

        if (!targetFid || !message) {
            return NextResponse.json(
                { error: 'targetFid and message are required' },
                { status: 400 }
            );
        }

        const result = await sendPollNotification({
            targetFid,
            pollId: pollId || '',
            pollQuestion: pollQuestion || '',
            message,
        });

        return NextResponse.json(result);
    } catch {
        return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 });
    }
}
