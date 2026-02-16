'use client';

interface VoterAvatarsProps {
    pollId: string;
    limit?: number;
    voters?: { fid: number; username: string; avatar: string | null }[];
}

export default function VoterAvatars({ pollId: _pollId, limit = 3, voters }: VoterAvatarsProps) {
    // In production, fetch from API. For now use mock data.
    const mockVoters = voters || [
        { fid: 2000, username: 'alice', avatar: null },
        { fid: 2001, username: 'bob', avatar: null },
        { fid: 2002, username: 'charlie', avatar: null },
        { fid: 2003, username: 'dave', avatar: null },
        { fid: 2004, username: 'eve', avatar: null },
    ];

    const shown = mockVoters.slice(0, limit);
    const remaining = mockVoters.length - limit;

    return (
        <div className="flex items-center">
            <div className="avatar-stack flex">
                {shown.map((voter) => (
                    <div
                        key={voter.fid}
                        className="w-5 h-5 rounded-full border border-card flex items-center justify-center text-[8px] font-bold text-white"
                        style={{
                            background: `hsl(${(voter.fid * 137.508) % 360}, 55%, 45%)`,
                        }}
                        title={voter.username}
                    >
                        {voter.username.charAt(0).toUpperCase()}
                    </div>
                ))}
            </div>
            {remaining > 0 && (
                <span className="text-[10px] text-muted ml-1">+{remaining}</span>
            )}
        </div>
    );
}
