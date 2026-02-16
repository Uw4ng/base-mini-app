import { NextResponse } from 'next/server';

const ROOT_URL = process.env.NEXT_PUBLIC_URL || 'https://quick-poll.vercel.app';

export async function GET() {
    const manifest = {
        accountAssociation: {
            header: "",
            payload: "",
            signature: ""
        },
        frame: {
            version: "1",
            name: "Quick Poll",
            subtitle: "Ask anything. Decide together.",
            description:
                "Create instant polls, vote with friends, see results in real time. The fastest way to make decisions on Base.",
            primaryCategory: "social",
            tags: ["polls", "voting", "social", "decisions", "community"],
            heroImageUrl: `${ROOT_URL}/hero.png`,
            iconUrl: `${ROOT_URL}/icon.png`,
            splashImageUrl: `${ROOT_URL}/splash.png`,
            splashBackgroundColor: "#0A0A0A",
            homeUrl: ROOT_URL,
            webhookUrl: `${ROOT_URL}/api/webhook`,
        },
    };

    return NextResponse.json(manifest);
}
