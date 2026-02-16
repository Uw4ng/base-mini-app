'use client';

export default function SkeletonCards({ count = 3 }: { count?: number }) {
    return (
        <div className="flex flex-col" style={{ gap: 'var(--space-4)' }}>
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className="poll-card animate-pulse"
                    style={{
                        height: '240px',
                        background: 'var(--bg-secondary)',
                        borderRadius: 'var(--radius-lg)',
                        border: '1px solid var(--border-subtle)',
                        padding: 'var(--space-4)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--space-3)'
                    }}
                >
                    <div className="flex items-center" style={{ gap: 'var(--space-3)' }}>
                        <div className="rounded-full bg-white/5" style={{ width: '40px', height: '40px' }} />
                        <div className="flex flex-col" style={{ gap: '4px' }}>
                            <div className="bg-white/5 rounded" style={{ width: '120px', height: '14px' }} />
                            <div className="bg-white/5 rounded" style={{ width: '80px', height: '12px' }} />
                        </div>
                    </div>

                    <div className="bg-white/5 rounded" style={{ width: '90%', height: '24px', margin: 'var(--space-2) 0' }} />

                    <div className="flex flex-col" style={{ gap: 'var(--space-2)' }}>
                        <div className="bg-white/5 rounded" style={{ width: '100%', height: '48px' }} />
                        <div className="bg-white/5 rounded" style={{ width: '100%', height: '48px' }} />
                    </div>
                </div>
            ))}
        </div>
    );
}
