// Farcaster context helpers
// In production, user info comes from MiniKit context / @farcaster/frame-sdk

export interface FarcasterUser {
    fid: number;
    username: string;
    displayName: string;
    avatar: string | null;
}

// Default dev user when running outside Farcaster client
const DEV_USER: FarcasterUser = {
    fid: 9999,
    username: 'quickpoll.dev',
    displayName: 'Quick Poll Dev',
    avatar: null,
};

export function getDevUser(): FarcasterUser {
    return DEV_USER;
}

export function formatFid(fid: number): string {
    return `@fid:${fid}`;
}

export function getAvatarUrl(fid: number): string {
    // Generate a deterministic gradient avatar for demo
    const hue = (fid * 137.508) % 360;
    return `https://api.dicebear.com/7.x/shapes/svg?seed=${fid}&backgroundColor=${Math.floor(hue).toString(16).padStart(2, '0')}`;
}

export function timeAgo(dateString: string): string {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
}
