import { readContract } from '@wagmi/core/actions'
import { useState } from 'react'
import type { Address } from 'viem'
import { useSendCallsSync, useSignTypedData } from 'wagmi'
import {
  DEFAULT_CHAIN_ID,
  DEFAULT_EXPIRATION_DAYS,
  RISEX_AUTH_ABI,
  RISEX_AUTH_CONTRACT,
} from '~/constants/auth'
import { config } from '~/lib/Wagmi'
import { getAccountSignature } from './useGetAccountSignature'
import { getSigner } from './useGetSigner'

/**
 * Calls the RiseX contract to register the signer.
 *
 * @param params - All parameters needed for the contract call
 * @param sendCallsSyncAsync - Function to send the contract call
 * @returns Contract call response
 */
async function registerSignerContract(
  params: {
    account: Address
    signerAddress: Address
    message: string
    nonce: string
    expiration: number
    accountSignature: `0x${string}`
    signingKeySignature: `0x${string}`
    chainId: number
  },
  sendCallsSyncAsync: ReturnType<typeof useSendCallsSync>['sendCallsSyncAsync'],
) {
  const {
    account,
    accountSignature,
    chainId,
    expiration,
    message,
    nonce,
    signerAddress,
    signingKeySignature,
  } = params

  const response = await sendCallsSyncAsync({
    calls: [
      {
        abi: RISEX_AUTH_ABI,
        args: [
          account,
          signerAddress,
          message,
          BigInt(nonce),
          expiration,
          accountSignature,
          signingKeySignature,
        ],
        functionName: 'registerSigner',
        to: RISEX_AUTH_CONTRACT,
      },
    ],
    chainId: chainId as any,
    timeout: 180_000,
  })

  console.log('registerSignerContract response:', response)

  return response
}

/**
 * Custom hook for registering a signer with the RiseX contract.
 *
 * This hook handles the complete flow:
 * 1. Generates a new private key for the signer
 * 2. Creates a signer signature using the VerifySigner typed data
 * 3. Creates an account signature using the RegisterSigner typed data
 * 4. Registers the signer via the contract call
 *
 * @see https://docs.risechain.com/docs/risex/api/register-signer
 *
 * @example
 * ```tsx
 * const { authenticate, isPending } = useRegisterSigner()
 *
 * const handleRegister = async () => {
 *   const result = await authenticate({
 *     account: '0x1234...',
 *     chainId: 11155931,
 *     expirationDays: 7
 *   })
 *
 *   if (result) {
 *     console.log('Signer registered:', result.signer)
 *     console.log('Transaction hash:', result.hash)
 *   }
 * }
 * ```
 */
export function useRegisterSigner() {
  const [isPending, setIsPending] = useState(false)

  const { signTypedDataAsync } = useSignTypedData()
  const { sendCallsSyncAsync } = useSendCallsSync({
    mutation: {
      retry: false,
    },
  })

  const authenticate = async ({
    account,
    chainId = DEFAULT_CHAIN_ID,
    expirationDays = DEFAULT_EXPIRATION_DAYS,
  }: {
    account: Address
    chainId?: number
    expirationDays?: number
  }) => {
    try {
      setIsPending(true)

      // Calculate expiration timestamp (in seconds)
      const expiration = Math.floor(Date.now() / 1000) + expirationDays * 86400

      // Step 1: Generate signer and create signer signature
      const { signingKey, signerAddress, signingKeySignature, nonce } =
        await getSigner({
          account,
          chainId,
        })

      // Step 2: Create account signature
      const { message, accountSignature } = await getAccountSignature({
        chainId,
        expiration,
        nonce,
        signerAddress,
        signTypedDataAsync,
      })

      // Step 3: Register signer via contract call
      const response = await registerSignerContract(
        {
          account,
          accountSignature,
          chainId,
          expiration,
          message,
          nonce,
          signerAddress,
          signingKeySignature,
        },
        sendCallsSyncAsync,
      )

      console.log('authenticate response:', response)

      // Get transaction hash from receipts
      const hash = response.receipts?.[0]?.transactionHash

      const isSessionKeyValid = await readContract(config, {
        abi: RISEX_AUTH_ABI,
        address: RISEX_AUTH_CONTRACT,
        args: [account, signerAddress],
        functionName: 'getSessionKeyStatus',
      })

      console.log('isSessionKeyValid:: ', isSessionKeyValid)
      // Store authentication info in localStorage
      if (isSessionKeyValid) {
        localStorage.setItem(
          'risex-authInfo',
          JSON.stringify({
            permissionExpiration: expiration,
            signer: signerAddress,
            signingKey,
            signingKeySignature, // signingKeySignature
          }),
        )
      }

      return {
        accountSignature,
        expiration,
        hash,
        nonce,
        response,
        signer: signerAddress,
        signingKey, // IMPORTANT: Store this securely - it authorizes all transactions
        signingKeySignature,
      }
    } catch (e) {
      console.error('Error in authenticate:', e)
      throw e
    } finally {
      setIsPending(false)
    }
  }

  return {
    authenticate,
    isPending,
  }
}

// Re-export utility functions for backward compatibility
export {
  encodeCancelOrderData,
  encodePlaceOrderData,
} from '~/lib/utils/auth'

export {
  signCancelOrderData,
  signPlaceOrderData,
} from './useSignOrder'
