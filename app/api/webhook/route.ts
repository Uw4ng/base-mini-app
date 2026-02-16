import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { event } = body;

        // Handle Farcaster webhook events
        switch (event) {
            case 'frame_added':
                console.log('[Webhook] Frame added by user');
                break;
            case 'frame_removed':
                console.log('[Webhook] Frame removed by user');
                break;
            case 'notifications_enabled':
                console.log('[Webhook] Notifications enabled');
                break;
            case 'notifications_disabled':
                console.log('[Webhook] Notifications disabled');
                break;
            default:
                console.log(`[Webhook] Unknown event: ${event}`);
        }

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: 'Invalid webhook payload' }, { status: 400 });
    }
}
