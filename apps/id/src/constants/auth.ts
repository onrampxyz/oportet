import type { Address } from 'viem'

/**
 * RISEx Auth Contract Address
 * Used for signer registration and authentication
 */
export const RISEX_AUTH_CONTRACT =
  '0x8d8708f9d87ef522c1f99dd579bf6a051e34c28e' as Address

/**
 * RISEx Perpetuals Contract Address
 * Used for placing and canceling orders
 */
export const RISEX_PERP_CONTRACT =
  '0x68cacd54a8c93a3186bf50be6b78b761f728e1b4' as Address

/**
 * RISEx USDC Contract Address
 * Used for collateral and settlements
 */
export const RISEX_USDC_CONTRACT =
  '0x8d17fc7db6b4fcf40afb296354883dec95a12f58' as Address

/**
 * ABI for the RISEx Auth Contract
 * Contains the registerSigner function definition
 */
export const RISEX_AUTH_ABI = [
  {
    inputs: [
      { internalType: 'address', name: 'account', type: 'address' },
      { internalType: 'address', name: 'signer', type: 'address' },
      { internalType: 'string', name: 'message', type: 'string' },
      { internalType: 'uint256', name: 'nonce', type: 'uint256' },
      { internalType: 'uint40', name: 'expiration', type: 'uint40' },
      { internalType: 'bytes', name: 'accountSignature', type: 'bytes' },
      { internalType: 'bytes', name: 'signerSignature', type: 'bytes' },
    ],
    name: 'registerSigner',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'signer',
        type: 'address',
      },
    ],
    name: 'getSessionKeyStatus',
    outputs: [
      {
        internalType: 'enum IRISExAuthorization.SessionKeyStatus',
        name: '',
        type: 'uint8',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const

/**
 * EIP-712 typed data structure for RegisterSigner and VerifySigner
 */
export const REGISTER_TYPES = {
  EIP712Domain: [
    { name: 'name', type: 'string' },
    { name: 'version', type: 'string' },
    { name: 'chainId', type: 'uint256' },
    { name: 'verifyingContract', type: 'address' },
  ],
  RegisterSigner: [
    { name: 'signer', type: 'address' },
    { name: 'message', type: 'string' },
    { name: 'expiration', type: 'uint40' },
    { name: 'nonce', type: 'uint256' },
  ],
  VerifySigner: [
    { name: 'account', type: 'address' },
    { name: 'nonce', type: 'uint256' },
  ],
}

/**
 * EIP-712 typed data structure for VerifySignature
 * Used when signing order operations
 */
export const VERIFY_SIGNATURE_TYPES = {
  VerifySignature: [
    { name: 'account', type: 'address' },
    { name: 'target', type: 'address' },
    { name: 'hash', type: 'bytes32' },
    { name: 'nonce', type: 'uint256' },
    { name: 'deadline', type: 'uint256' },
  ],
}

/**
 * Default expiration time for signer registration (7 days in seconds)
 */
export const DEFAULT_EXPIRATION_DAYS = 7

/**
 * Default chain ID for RISEx (RISE testnet)
 */
export const DEFAULT_CHAIN_ID = 11155931

/**
 * in ms
 */
export const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000
