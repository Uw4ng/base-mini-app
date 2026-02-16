import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { getPollById } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) return new Response('Missing ID', { status: 400 });

        const poll = getPollById(id);

        if (!poll) return new Response('Poll not found', { status: 404 });

        return new ImageResponse(
            (
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#0F172A', // Using Slate-900 or similar dark bg
                        color: 'white',
                        padding: '40px',
                        fontFamily: 'sans-serif',
                    }}
                >
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                        maxWidth: '90%'
                    }}>
                        <div style={{ fontSize: 60, fontWeight: 'bold', marginBottom: 20, color: '#FFFFFF' }}>
                            {poll.question}
                        </div>
                        <div style={{ fontSize: 30, color: '#94A3B8' }}>
                            Quick Poll on Farcaster
                        </div>
                    </div>

                    <div style={{ display: 'flex', marginTop: 60, gap: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
                        {poll.options.slice(0, 4).map((opt: any, i: number) => (
                            <div key={i} style={{
                                background: '#1E293B',
                                border: '2px solid #334155',
                                padding: '16px 32px',
                                borderRadius: 16,
                                fontSize: 28,
                                color: '#E2E8F0'
                            }}>
                                {opt.text}
                            </div>
                        ))}
                        {poll.options.length > 4 && (
                            <div style={{ padding: '16px 32px', fontSize: 24, color: '#64748B' }}>
                                +{poll.options.length - 4} more
                            </div>
                        )}
                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 630,
            },
        );
    } catch (e: any) {
        console.error(e);
        return new Response(`Failed to generate the image`, {
            status: 500,
        });
    }
}
