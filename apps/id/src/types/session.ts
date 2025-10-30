// Dummy sessions data (not currently used - for reference only)
export const DUMMY_SESSIONS: Permission[] = [
  {
    address: '0x1234567890123456789012345678901234567890',
    chainId: '0x1',
    expiry: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
    id: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
    key: {
      publicKey:
        '0x8f2c8d3a4b5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a',
      type: 'p256',
    },
    permissions: {
      calls: [
        {
          signature: 'transfer(address,uint256)',
          to: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        },
        {
          signature: 'approve(address,uint256)',
          to: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        },
      ],
      spend: [
        {
          limit: BigInt('50000000000000000000'), // 50 tokens
          period: 'hour',
          token: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        },
      ],
    },
    publicKey:
      '0x8f2c8d3a4b5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a',
    type: 'p256',
  },
]

export type Spend = {
  limit: bigint
  period: 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year'
  token?: `0x${string}`
}

export type Call = {
  signature?: string
  to?: `0x${string}`
}

export type Permission = {
  address: `0x${string}`
  chainId: `0x${string}`
  expiry: number
  id: `0x${string}`
  key: {
    publicKey: `0x${string}`
    type: 'address' | 'p256' | 'secp256k1' | 'webauthn-p256'
  }
  permissions: {
    calls: Call[]
    spend: Spend[]
  }
  publicKey: `0x${string}`
  type: 'address' | 'p256' | 'secp256k1' | 'webauthn-p256'
}
