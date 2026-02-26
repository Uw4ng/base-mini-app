import { ReactNode, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, http } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { getDefaultConfig, RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { Attribution } from 'ox/erc8021';
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { MiniKitProvider } from './context/MiniKitContext';

const DATA_SUFFIX = Attribution.toDataSuffix({ codes: ["quick-poll"] });

const config = getDefaultConfig({
    appName: 'Quick Poll',
    projectId: 'YOUR_PROJECT_ID', // Replace with your WalletConnect ID
    chains: [baseSepolia],
    ssr: true,
    // @ts-ignore - dataSuffix is passed to wagmi's createConfig
    dataSuffix: DATA_SUFFIX,
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
