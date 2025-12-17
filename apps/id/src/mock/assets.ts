/**
 * Dummy asset data matching the Response type from porto/wagmi
 * This represents multi-chain asset balances across different networks
 */

import type { AssetsByChain } from '~/types/asset'

export const DUMMY_ASSETS: AssetsByChain = {
  // Ethereum Mainnet (Chain ID: 1 / 0x1)
  '0x1': [
    {
      address: 'native',
      balance: 2450000000000000000n, // 2.45 ETH
      metadata: {
        decimals: 18,
        name: 'Ether',
        symbol: 'ETH',
      },
      type: 'native',
    },
    {
      address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      balance: 5000000000n, // 5,000 USDC (6 decimals)
      metadata: {
        decimals: 6,
        name: 'USD Coin',
        symbol: 'USDC',
      },
      type: 'erc20',
    },
    {
      address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      balance: 1500000000000000000n, // 1.5 WETH
      metadata: {
        decimals: 18,
        name: 'Wrapped Ether',
        symbol: 'WETH',
      },
      type: 'erc20',
    },
    {
      address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
      balance: 10000000n, // 0.1 WBTC (8 decimals)
      metadata: {
        decimals: 8,
        name: 'Wrapped Bitcoin',
        symbol: 'WBTC',
      },
      type: 'erc20',
    },
  ],

  // RISE Testnet (Chain ID: 11155931 / 0xAA39DB)
  '0xAA39DB': [
    {
      address: 'native',
      balance: 100000000000000000000n, // 100 RISE
      metadata: {
        decimals: 18,
        name: 'RISE',
        symbol: 'RISE',
      },
      type: 'native',
    },
    {
      address: '0x1234567890123456789012345678901234567890',
      balance: 2450000000n, // 2,450 USDC
      metadata: {
        decimals: 6,
        name: 'USD Coin',
        symbol: 'USDC',
      },
      type: 'erc20',
    },
    {
      address: '0x2345678901234567890123456789012345678901',
      balance: 1000000000000000000n, // 1 WETH
      metadata: {
        decimals: 18,
        name: 'Wrapped Ether',
        symbol: 'WETH',
      },
      type: 'erc20',
    },
  ],
}
