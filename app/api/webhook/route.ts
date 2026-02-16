import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Log the event for debugging
        console.log('Farcaster Webhook:', JSON.stringify(body, null, 2));

        // Handle specific events
        switch (body.event) {
            case 'frame_added':
                // Handle app installation
                if (body.notificationDetails) {
                    console.log(`Frame added by FID ${body.fid}. Token: ${body.notificationDetails.token}`);
                }
                break;

            case 'frame_removed':
                console.log(`Frame removed by FID ${body.fid}`);
                break;

            case 'notifications_enabled':
                console.log(`Notifications enabled for FID ${body.fid}`);
                break;

            case 'notifications_disabled':
                console.log(`Notifications disabled for FID ${body.fid}`);
                break;
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Webhook error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
