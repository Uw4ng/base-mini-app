'use client';

import { useState } from 'react';
import BottomSheet from '../ui/BottomSheet';

interface Voter {
    fid: number;
    username: string;
    avatar: string | null;
    optionId?: string;
    optionText?: string;
    isFollowing?: boolean;
}

interface VoterAvatarsProps {
    pollId: string;
    totalVotes: number;
    limit?: number;
    voters?: Voter[];
    isAnonymous?: boolean;
}

export default function VoterAvatars({
    pollId,
    totalVotes,
    limit = 5,
    voters = [],
    isAnonymous = false,
}: VoterAvatarsProps) {
    const [showVoterList, setShowVoterList] = useState(false);
    const [allVoters, setAllVoters] = useState<Voter[]>([]);
    const [loadingVoters, setLoadingVoters] = useState(false);

    const shown = voters.slice(0, limit);
    const remaining = totalVotes - shown.length;

    if (isAnonymous || totalVotes === 0) return null;

    const handleOpenVoterList = async () => {
        setShowVoterList(true);
        if (allVoters.length > 0) return;

        setLoadingVoters(true);
        try {
            const res = await fetch(`/api/polls/${pollId}/voters?fid=9999`);
            const data = await res.json();
            setAllVoters(data.voters || []);
        } catch {
            setAllVoters(voters);
        } finally {
            setLoadingVoters(false);
        }
    };

    return (
        <>
            <button
                onClick={handleOpenVoterList}
                className="flex items-center transition-opacity"
                style={{
                    gap: '2px',
                    background: 'none',
                    border: 'none',
                    padding: '2px 0',
                    cursor: 'pointer',
                }}
            >
                <div className="avatar-stack flex">
                    {shown.map((voter) => (
                        <div
                            key={voter.fid}
                            className="avatar flex items-center justify-center text-[10px] font-bold text-white"
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
                    <span className="text-[11px] tabular-nums" style={{ color: 'var(--text-tertiary)', marginLeft: 'var(--space-1)' }}>
                        +{remaining} others voted
                    </span>
                )}
            </button>

            {/* Expanded Voter List */}
            <BottomSheet
                isOpen={showVoterList}
                onClose={() => setShowVoterList(false)}
                title={`Voters (${totalVotes})`}
            >
                {loadingVoters ? (
                    <div className="flex flex-col" style={{ gap: 'var(--space-2)' }}>
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="flex items-center" style={{ gap: 'var(--space-3)', padding: '8px 0' }}>
                                <div className="skeleton" style={{ width: '36px', height: '36px', borderRadius: '50%' }} />
                                <div className="flex-1">
                                    <div className="skeleton" style={{ width: '100px', height: '14px', marginBottom: '4px' }} />
                                    <div className="skeleton" style={{ width: '60px', height: '11px' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col" style={{ gap: '2px', maxHeight: '50vh', overflow: 'auto' }}>
                        {allVoters.map(voter => (
                            <div
                                key={voter.fid}
                                className="flex items-center justify-between"
                                style={{
                                    padding: '10px 4px',
                                    borderBottom: '1px solid var(--border-subtle)',
                                }}
                            >
                                <div className="flex items-center" style={{ gap: 'var(--space-3)' }}>
                                    <div
                                        className="rounded-full flex items-center justify-center text-[12px] font-bold text-white flex-shrink-0"
                                        style={{
                                            width: '36px', height: '36px',
                                            background: `hsl(${(voter.fid * 137.508) % 360}, 55%, 45%)`,
                                        }}
                                    >
                                        {voter.username.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="flex items-center" style={{ gap: '6px' }}>
                                            <span className="text-[14px] font-medium" style={{ color: 'var(--text-primary)' }}>
                                                @{voter.username}
                                            </span>
                                            {voter.isFollowing && (
                                                <span
                                                    className="text-[10px] font-medium"
                                                    style={{
                                                        padding: '1px 6px',
                                                        borderRadius: 'var(--radius-full)',
                                                        background: 'rgba(59, 130, 246, 0.12)',
                                                        color: 'var(--accent-blue)',
                                                    }}
                                                >
                                                    follows you
                                                </span>
                                            )}
                                        </div>
                                        {voter.optionText && (
                                            <span className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
                                                Voted: {voter.optionText}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </BottomSheet>
        </>
    );
}
