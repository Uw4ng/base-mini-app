'use client';

import { useState, useEffect, useRef } from 'react';

interface FarcasterUser {
    fid: number;
    username: string;
    displayName: string;
    avatar: string | null;
    isMutual: boolean;
}

interface FriendTaggerProps {
    isOpen: boolean;
    onClose: () => void;
    selectedFriends: { fid: number; username: string }[];
    onSelect: (friends: { fid: number; username: string }[]) => void;
    maxTags?: number;
}

export default function FriendTagger({
    isOpen,
    onClose,
    selectedFriends,
    onSelect,
    maxTags = 5,
}: FriendTaggerProps) {
    const [search, setSearch] = useState('');
    const [mutuals, setMutuals] = useState<FarcasterUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<Set<number>>(new Set(selectedFriends.map(f => f.fid)));
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!isOpen) return;
        setLoading(true);
        fetch(`/api/users/9999/mutuals?q=${encodeURIComponent(search)}`)
            .then(r => r.json())
            .then(data => setMutuals(data.mutuals || []))
            .catch(() => setMutuals([]))
            .finally(() => setLoading(false));
    }, [isOpen, search]);

    useEffect(() => {
        if (isOpen) setTimeout(() => inputRef.current?.focus(), 300);
    }, [isOpen]);

    const toggleSelect = (user: FarcasterUser) => {
        const newSet = new Set(selected);
        if (newSet.has(user.fid)) {
            newSet.delete(user.fid);
        } else if (newSet.size < maxTags) {
            newSet.add(user.fid);
        }
        setSelected(newSet);
    };

    const handleDone = () => {
        const friends = mutuals
            .filter(m => selected.has(m.fid))
            .map(m => ({ fid: m.fid, username: m.username }));
        // Also keep previously selected friends not in current search
        const extras = selectedFriends.filter(sf => selected.has(sf.fid) && !friends.find(f => f.fid === sf.fid));
        onSelect([...friends, ...extras]);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
            <div
                className="absolute inset-0 overlay animate-fade-in"
                onClick={onClose}
                role="button"
                aria-label="Close friend tagger"
                tabIndex={0}
                onKeyDown={e => e.key === 'Escape' && onClose()}
            />
            <div
                className="relative w-full max-w-lg animate-slide-up"
                style={{
                    background: 'var(--bg-secondary)',
                    borderTopLeftRadius: 'var(--radius-lg)',
                    borderTopRightRadius: 'var(--radius-lg)',
                    maxHeight: '70vh',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                {/* Header */}
                <div style={{ padding: 'var(--space-4) var(--space-4) var(--space-3)' }}>
                    <div className="flex justify-center" style={{ marginBottom: 'var(--space-3)' }}>
                        <div className="rounded-full" style={{ width: '36px', height: '4px', background: 'var(--border-default)' }} />
                    </div>
                    <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-3)' }}>
                        <h3 className="text-[16px] font-bold">Tag Friends</h3>
                        <span className="text-[12px] tabular-nums" style={{ color: 'var(--text-tertiary)' }}>
                            {selected.size}/{maxTags}
                        </span>
                    </div>
                    <input
                        ref={inputRef}
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search mutuals..."
                        className="w-full focus:outline-none"
                        style={{
                            background: 'var(--bg-tertiary)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: 'var(--radius-sm)',
                            padding: '12px 14px',
                            color: 'var(--text-primary)',
                            fontSize: '14px',
                        }}
                        onFocus={e => { e.currentTarget.style.borderColor = 'var(--border-focus)'; }}
                        onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
                    />
                </div>

                {/* Selected chips */}
                {selected.size > 0 && (
                    <div className="flex flex-wrap no-scrollbar" style={{ gap: '6px', padding: '0 var(--space-4) var(--space-2)' }}>
                        {Array.from(selected).map(fid => {
                            const user = mutuals.find(m => m.fid === fid) || selectedFriends.find(sf => sf.fid === fid);
                            if (!user) return null;
                            return (
                                <button
                                    key={fid}
                                    onClick={() => toggleSelect({ fid, username: 'username' in user ? user.username : '', displayName: '', avatar: null, isMutual: true })}
                                    className="flex items-center transition-all"
                                    style={{
                                        padding: '4px 10px 4px 6px',
                                        borderRadius: 'var(--radius-full)',
                                        background: 'rgba(59, 130, 246, 0.15)',
                                        color: 'var(--accent-blue)',
                                        fontSize: '12px',
                                        fontWeight: 600,
                                        border: 'none',
                                        gap: '4px',
                                    }}
                                >
                                    <span>@{user.username}</span>
                                    <span style={{ fontSize: '14px' }}>×</span>
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* User list */}
                <div className="flex-1 overflow-y-auto" style={{ padding: '0 var(--space-4)' }}>
                    {loading ? (
                        <div className="flex flex-col" style={{ gap: 'var(--space-2)', padding: 'var(--space-2) 0' }}>
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="flex items-center" style={{ gap: 'var(--space-3)', padding: '8px 0' }}>
                                    <div className="skeleton" style={{ width: '36px', height: '36px', borderRadius: '50%' }} />
                                    <div className="skeleton" style={{ width: '120px', height: '14px' }} />
                                </div>
                            ))}
                        </div>
                    ) : mutuals.length === 0 ? (
                        <div className="text-center" style={{ padding: 'var(--space-6) 0', color: 'var(--text-tertiary)', fontSize: '14px' }}>
                            {search ? 'No mutuals found' : 'No mutuals available'}
                        </div>
                    ) : (
                        <div className="flex flex-col" style={{ gap: '2px' }}>
                            {mutuals.map(user => {
                                const isSelected = selected.has(user.fid);
                                const isDisabled = !isSelected && selected.size >= maxTags;

                                return (
                                    <button
                                        key={user.fid}
                                        onClick={() => !isDisabled && toggleSelect(user)}
                                        className="flex items-center justify-between w-full touch-target transition-colors"
                                        style={{
                                            padding: '10px 8px',
                                            borderRadius: 'var(--radius-sm)',
                                            background: isSelected ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
                                            border: 'none',
                                            opacity: isDisabled ? 0.4 : 1,
                                            cursor: isDisabled ? 'not-allowed' : 'pointer',
                                        }}
                                    >
                                        <div className="flex items-center" style={{ gap: 'var(--space-3)' }}>
                                            <div
                                                className="rounded-full flex items-center justify-center text-[12px] font-bold text-white flex-shrink-0"
                                                style={{
                                                    width: '36px', height: '36px',
                                                    background: `hsl(${(user.fid * 137.508) % 360}, 55%, 45%)`,
                                                }}
                                            >
                                                {user.username.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="text-left">
                                                <div className="text-[14px] font-medium" style={{ color: 'var(--text-primary)' }}>
                                                    {user.displayName}
                                                </div>
                                                <div className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
                                                    @{user.username}
                                                </div>
                                            </div>
                                        </div>
                                        <div
                                            className="rounded-full flex items-center justify-center flex-shrink-0 transition-colors"
                                            style={{
                                                width: '24px', height: '24px',
                                                background: isSelected ? 'var(--accent-blue)' : 'var(--bg-tertiary)',
                                                border: isSelected ? 'none' : '2px solid var(--border-default)',
                                            }}
                                        >
                                            {isSelected && (
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="20 6 9 17 4 12" />
                                                </svg>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Done button */}
                <div style={{ padding: 'var(--space-3) var(--space-4) var(--space-4)' }}>
                    <button
                        onClick={handleDone}
                        className="w-full touch-target"
                        style={{
                            padding: '14px',
                            borderRadius: 'var(--radius-sm)',
                            background: 'var(--accent-blue)',
                            color: 'white',
                            fontSize: '15px',
                            fontWeight: 700,
                            border: 'none',
                            height: '48px',
                        }}
                    >
                        {selected.size > 0 ? `Tag ${selected.size} friend${selected.size > 1 ? 's' : ''}` : 'Done'}
                    </button>
                </div>
            </div>
        </div>
    );
}
