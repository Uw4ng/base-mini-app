import { Metadata } from 'next';
import PollDetailClient from './PollDetailClient';
import { getPollById } from '@/lib/db';

type Props = {
    params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    const poll = getPollById(id);

    if (!poll) {
        return {
            title: 'Poll Not Found',
        };
    }

    const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://quickpoll.base.app';
    const imageUrl = `${baseUrl}/api/og?id=${id}`;

    return {
        title: poll.question,
        description: `Vote now on Quick Poll! ${poll.total_votes} votes so far.`,
        openGraph: {
            title: poll.question,
            description: `Vote now on Quick Poll! ${poll.total_votes} votes so far.`,
            images: [imageUrl],
        },
        other: {
            'fc:frame': 'vNext',
            'fc:frame:image': imageUrl,
            'fc:frame:button:1': 'Vote',
        },
    };
}

export default function PollPage() {
    return <PollDetailClient />;
}
