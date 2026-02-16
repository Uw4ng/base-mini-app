import { baseSepolia } from 'wagmi/chains';

/**
 * QuickPollRegistry contract configuration
 * Deploy the contract in contracts/QuickPollRegistry.sol to Base Sepolia
 * and update the address below.
 */

// Base Sepolia testnet — change to `base` for mainnet
export const CHAIN = baseSepolia;

// Replace with your deployed contract address
export const QUICKPOLL_REGISTRY_ADDRESS = '0x0000000000000000000000000000000000000000' as const;

// BaseScan explorer URL
export const BASESCAN_URL = CHAIN.id === baseSepolia.id
    ? 'https://sepolia.basescan.org'
    : 'https://basescan.org';

// ABI extracted from QuickPollRegistry.sol
export const QUICKPOLL_REGISTRY_ABI = [
    {
        type: 'function',
        name: 'savePollResult',
        inputs: [
            { name: 'pollId', type: 'bytes32', internalType: 'bytes32' },
            { name: 'questionHash', type: 'string', internalType: 'string' },
            { name: 'optionsHash', type: 'string', internalType: 'string' },
            { name: 'totalVotes', type: 'uint256', internalType: 'uint256' },
        ],
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        name: 'getPollResult',
        inputs: [
            { name: 'pollId', type: 'bytes32', internalType: 'bytes32' },
        ],
        outputs: [
            {
                name: '',
                type: 'tuple',
                internalType: 'struct QuickPollRegistry.PollResult',
                components: [
                    { name: 'questionHash', type: 'string', internalType: 'string' },
                    { name: 'optionsHash', type: 'string', internalType: 'string' },
                    { name: 'totalVotes', type: 'uint256', internalType: 'uint256' },
                    { name: 'timestamp', type: 'uint256', internalType: 'uint256' },
                    { name: 'creator', type: 'address', internalType: 'address' },
                ],
            },
        ],
        stateMutability: 'view',
    },
    {
        type: 'function',
        name: 'polls',
        inputs: [
            { name: '', type: 'bytes32', internalType: 'bytes32' },
        ],
        outputs: [
            { name: 'questionHash', type: 'string', internalType: 'string' },
            { name: 'optionsHash', type: 'string', internalType: 'string' },
            { name: 'totalVotes', type: 'uint256', internalType: 'uint256' },
            { name: 'timestamp', type: 'uint256', internalType: 'uint256' },
            { name: 'creator', type: 'address', internalType: 'address' },
        ],
        stateMutability: 'view',
    },
    {
        type: 'event',
        name: 'PollSaved',
        inputs: [
            { name: 'pollId', type: 'bytes32', indexed: true, internalType: 'bytes32' },
            { name: 'creator', type: 'address', indexed: true, internalType: 'address' },
            { name: 'totalVotes', type: 'uint256', indexed: false, internalType: 'uint256' },
        ],
        anonymous: false,
    },
] as const;

// Coinbase Paymaster for gas sponsorship (Base Sepolia)
// Set your CDP API Key in .env as NEXT_PUBLIC_CDP_API_KEY
export const PAYMASTER_URL = process.env.NEXT_PUBLIC_CDP_API_KEY
    ? `https://api.developer.coinbase.com/rpc/v1/base-sepolia/${process.env.NEXT_PUBLIC_CDP_API_KEY}`
    : undefined;
