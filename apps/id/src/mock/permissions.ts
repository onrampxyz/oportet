export const permissions = [
  {
    address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1',
    chainId: 1,
    expiry: 1735689600,
    id: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
    key: {
      publicKey:
        '0x04a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2',
      type: 'secp256k1',
    },
    permissions: {
      calls: [
        {
          signature: 'transfer(address,uint256)',
          to: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        },
        {
          signature: 'approve(address,uint256)',
        },
        {
          to: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
        },
      ],
      signatureVerification: {
        addresses: [
          '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed',
          '0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359',
        ],
      },
      spend: [
        {
          limit: 1000000000000000000n,
          period: 'day',
          token: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        },
        {
          limit: 5000000000000000000n,
          period: 'week',
        },
      ],
    },
  },
]
