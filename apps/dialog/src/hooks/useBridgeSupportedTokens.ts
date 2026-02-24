import { Value } from 'ox'
import { useMemo } from 'react'
import { type Address, zeroAddress } from 'viem'
import { mainnet, rise, riseTestnet, sepolia } from 'viem/chains'
import type { BridgeToken } from '~/routes/-components/GlobalDeposit/Bridge'

/**
 * Hook to get supported tokens based on environment
 * - prod: mainnet tokens (riseMainnet + mainnet)
 * - staging: testnet tokens (riseTestnet + sepolia)
 */
export function useBridgeSupportedTokens() {
  const isProd = import.meta.env.VITE_VERCEL_ENV === 'production'

  const tokens = useMemo<Record<number, BridgeToken[]>>(() => {
    if (isProd) {
      // Mainnet tokens
      return {
        [rise.id as number]: [
          // Hide canonical
          //   {
          //     adapter: zeroAddress, // canonical does not need lz
          //     address: zeroAddress,
          //     bridgeContract: zeroAddress,
          //     bridgeType: 'canonical',
          //     bridgeWrapper: zeroAddress,
          //     decimals: 18,
          //     icon: '/tokens/eth.svg',
          //     isNative: true,
          //     minDeposit: 0n,
          //     name: 'Ethereum',
          //     symbol: 'ETH',
          //   },
          {
            adapter: '0xf463d5CbC64916Caa2775a8e9b264f8c35F4b8a4',
            address: '0x07Ba7Ec2CcBCD7eeE97aC6A28aACdebb707F325D',
            bridgeContract: zeroAddress,
            bridgeType: 'layerzero',
            bridgeWrapper: zeroAddress,
            decimals: 6,
            icon: '/dialog/ui/token-icons/usdc.svg',
            lzEndpointId: 30401,
            minDeposit: 0n,
            name: 'USDC',
            symbol: 'USDC',
          },
          // TODO: Add mainnet USDC, USDT, and other tokens
        ],
        [mainnet.id as number]: [
          //   {
          //     adapter: zeroAddress, // adapter is for rise only
          //     address: zeroAddress,
          //     bridgeContract:
          //       '0x1b5e291d146add070437c1af757025d0f1600327' as Address,
          //     bridgeType: 'canonical',
          //     bridgeWrapper: zeroAddress,
          //     decimals: 18,
          //     icon: '/tokens/eth.svg',
          //     isNative: true,
          //     minDeposit: 0n,
          //     name: 'Ethereum',
          //     symbol: 'ETH',
          //   },
          {
            adapter: zeroAddress, // adapter is for rise only
            address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
            bridgeContract:
              '0x3192B9211029336A14346783AA4eC5eF5749a9FB' as Address,
            bridgeType: 'layerzero',
            bridgeWrapper: '0xf463d5CbC64916Caa2775a8e9b264f8c35F4b8a4',
            decimals: 6,
            icon: '/dialog/ui/token-icons/usdc.svg',
            lzEndpointId: 30101,
            minDeposit: 0n,
            name: 'USDC',
            symbol: 'USDC',
          },
          // TODO: Add mainnet USDC, USDT official tokens
        ],

        /**
         * TODO:
         * - Arbitrum - only LZ
         * - Add mainnet USDC, USDT official tokens
         */

        /**
         * TODO:
         * - Base - only LZ
         * - Add mainnet USDC, USDT official tokens
         */
      }
    }
    // Testnet tokens
    return {
      [riseTestnet.id]: [
        {
          adapter: zeroAddress, // canonical does not need lz
          address: '0x0ead66d71fad42509314912f84c35f20d012b66a' as Address,
          bridgeContract:
            '0x1D361eA3AFb5fDe75E3f261831998154e1351dC2' as Address,
          bridgeType: 'layerzero',
          bridgeWrapper: zeroAddress,
          decimals: 6,
          icon: '/dialog/ui/token-icons/usdc.svg',
          lzEndpointId: 40438,
          minDeposit: Value.from('10', 6),
          name: 'USDC',
          symbol: 'USDC',
        },
        {
          adapter: '0xC0335f36C9697c84EA9De1823082066060136912',
          address: '0x57BfEf022E97Ad3877381a72b7E32F019596919e' as Address,
          bridgeContract:
            '0x57BfEf022E97Ad3877381a72b7E32F019596919e' as Address,
          bridgeType: 'layerzero',
          bridgeWrapper: zeroAddress,
          decimals: 18,
          icon: '/dialog/ui/token-icons/usdt.svg',
          lzEndpointId: 40438,
          minDeposit: Value.from('10', 18),
          name: 'USDT',
          symbol: 'USDT',
        },
      ],
      [sepolia.id]: [
        {
          adapter: zeroAddress, // adapter is for rise only
          address: '0x70315897fe28Dbe36DA81F10E1158bae1373C5b1' as Address,
          bridgeContract:
            '0x2C752f3E245A89828590B30c93daAAD19f31c801' as Address,
          bridgeType: 'layerzero',
          bridgeWrapper: '0x226cefe884c9425377954fB9B5Cb9AD4BdCD398D',
          decimals: 18,
          icon: '/dialog/ui/token-icons/usdc.svg',
          lzEndpointId: 40161,
          minDeposit: Value.from('10', 18),
          name: 'USDC',
          symbol: 'USDC',
        },
        {
          adapter: zeroAddress, // adapter is for rise only
          address: '0x9Fe63D450edC97D700fA1D0081b84569102e5C1D' as Address,
          bridgeContract:
            '0x046832405512D508b873E65174E51613291083bC' as Address,
          bridgeType: 'layerzero',
          bridgeWrapper: '0x226cefe884c9425377954fB9B5Cb9AD4BdCD398D',
          decimals: 18,
          icon: '/dialog/ui/token-icons/usdt.svg',
          lzEndpointId: 40161,
          minDeposit: Value.from('10', 18),
          name: 'USDT',
          symbol: 'USDT',
        },
      ],
    }
  }, [])

  return {
    isProd,
    tokens,
  }
}
