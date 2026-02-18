import { ReactNode, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, http } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { getDefaultConfig, RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { MiniKitProvider } from './context/MiniKitContext';

const config = getDefaultConfig({
    appName: 'Quick Poll',
    projectId: 'YOUR_PROJECT_ID', // Replace with your WalletConnect ID
    chains: [baseSepolia],
    ssr: true,
});

export default function Providers({ children }: { children: ReactNode }) {
    const [queryClient] = useState(() => new QueryClient());

    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider theme={darkTheme()}>
                    <OnchainKitProvider
                        chain={baseSepolia}
                        config={{
                            appearance: {
                                mode: 'dark',
                            },
                        }}
                    >
                        <MiniKitProvider>
                            {children}
                        </MiniKitProvider>
                    </OnchainKitProvider>
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}
