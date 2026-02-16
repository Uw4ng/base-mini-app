'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import sdk, { type Context } from '@farcaster/frame-sdk';

interface MiniKitContextType {
    user: {
        fid: number;
        username?: string;
        pfpUrl?: string;
        displayName?: string;
    } | null;
    isLoaded: boolean;
    signIn: () => Promise<void>;
    sharePoll: (pollId: string, question: string) => void;
    addFrame: () => Promise<void>;
}

const MiniKitContext = createContext<MiniKitContextType | undefined>(undefined);

export function MiniKitProvider({ children }: { children: ReactNode }) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [user, setUser] = useState<MiniKitContextType['user']>(null);

    useEffect(() => {
        const init = async () => {
            try {
                // visual: { mode: 'dark' } is optional but good for consistency
                // setFrameReady is sdk.actions.ready()
                await sdk.actions.ready();

                const context = await sdk.context;
                if (context?.user) {
                    setUser({
                        fid: context.user.fid,
                        username: context.user.username,
                        pfpUrl: context.user.pfpUrl,
                        displayName: context.user.displayName,
                    });
                }
            } catch (error) {
                console.error('MiniKit init failed:', error);
            } finally {
                setIsLoaded(true);
            }
        };

        init();
    }, []);

    const signIn = useCallback(async () => {
        try {
            const result = await sdk.actions.signIn({ nonce: 'test-nonce' });
            // SignInResult typically contains signature/message for backend verification
            // For now, we rely on sdk.context.user which is already loaded
            console.log('Signed in:', result);
        } catch (error) {
            console.error('Sign in failed:', error);
        }
    }, []);

    const sharePoll = useCallback((pollId: string, question: string) => {
        const shareUrl = `${window.location.origin}/poll/${pollId}`;
        sdk.actions.openUrl(`https://warpcast.com/~/compose?text=${encodeURIComponent(`I just asked: "${question}" — Vote now! 🗳️`)}&embeds[]=${encodeURIComponent(shareUrl)}`);
    }, []);

    const addFrame = useCallback(async () => {
        try {
            await sdk.actions.addFrame();
        } catch (error) {
            console.error('Add frame failed:', error);
        }
    }, []);

    return (
        <MiniKitContext.Provider value={{ user, isLoaded, signIn, sharePoll, addFrame }}>
            {children}
        </MiniKitContext.Provider>
    );
}

export function useMiniKit() {
    const context = useContext(MiniKitContext);
    if (context === undefined) {
        throw new Error('useMiniKit must be used within a MiniKitProvider');
    }
    return context;
}
