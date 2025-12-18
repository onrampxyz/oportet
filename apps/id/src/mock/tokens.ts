// Updated token addresses from degenRobot/devrel-trading-bot
export const TOKENS = {
  MockToken: {
    address: '0x6166a6e02b4CF0e1E0397082De1B4fc9CC9D6ceD' as `0x${string}`,
    decimals: 18,
    name: 'Mock Token',
    symbol: 'MockToken',
  },
  MockUSD: {
    address: '0x044b54e85D3ba9ae376Aeb00eBD09F21421f7f50' as `0x${string}`,
    decimals: 18,
    name: 'Mock USD',
    symbol: 'MockUSD',
  },
} as const
