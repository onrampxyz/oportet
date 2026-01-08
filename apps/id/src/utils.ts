import { Value } from 'ox'
import { hexToBigInt } from 'viem'
import type { Spend } from './types/session'

export namespace ArrayUtils {
  export function sum(array: number[]) {
    return array.reduce(
      (accumulator, currentValue) => accumulator + currentValue,
      0,
    )
  }
}

export namespace StringFormatter {
  export function truncate(
    str: string,
    { start = 8, end = 6 }: { start?: number; end?: number } = {},
  ) {
    if (str.length <= start + end) return str
    return `${str.slice(0, start)}\u2026${str.slice(-end)}`
  }
}

export namespace AddressFormatter {
  /**
   * Masks an Ethereum address to show only the first and last few characters.
   * @param address - The Ethereum address to mask (e.g., "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb")
   * @param options - Configuration options
   * @param options.start - Number of characters to show at the start (default: 6, includes "0x")
   * @param options.end - Number of characters to show at the end (default: 4)
   * @returns Masked address (e.g., "0x742d...0bEb")
   *
   * @example
   * AddressFormatter.mask("0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb")
   * // Returns: "0x742d...0bEb"
   *
   * @example
   * AddressFormatter.mask("0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb", { start: 8, end: 6 })
   * // Returns: "0x742d35...5f0bEb"
   */
  export function mask(
    address: string | undefined,
    { start = 6, end = 4 }: { start?: number; end?: number } = {},
  ): string {
    if (!address) return ''
    if (address.length <= start + end) return address
    return `${address.slice(0, start)}...${address.slice(-end)}`
  }

  /**
   * Formats an Ethereum address with checksum capitalization and masking.
   * @param address - The Ethereum address to format
   * @param options - Configuration options (same as mask function)
   * @returns Masked address string
   *
   * @example
   * AddressFormatter.format("0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb")
   * // Returns: "0x742d...0bEb"
   */
  export function format(
    address: string | undefined,
    options?: { start?: number; end?: number },
  ): string {
    return mask(address, options)
  }

  /**
   * Gets the short form of an address (first 6 chars including 0x and last 4 chars).
   * This is a convenience wrapper around mask with commonly used defaults.
   * @param address - The Ethereum address
   * @returns Masked address (e.g., "0x742d...0bEb")
   */
  export function short(address: string | undefined): string {
    return mask(address, { end: 4, start: 6 })
  }

  /**
   * Gets the long form of an address (first 10 chars and last 8 chars).
   * @param address - The Ethereum address
   * @returns Masked address (e.g., "0x742d35Cc66...95f0bEb")
   */
  export function long(address: string | undefined): string {
    return mask(address, { end: 8, start: 10 })
  }

  export function formatSignature(signature: string) {
    if (signature.length !== 132) {
      return signature
    }
    const sigNoPrefix = signature.startsWith('0x')
      ? signature.substring(2)
      : signature
    const r = sigNoPrefix.substring(0, 64) // first 32 bytes
    let s = hexToBigInt(`0x${sigNoPrefix.substring(64, 128)}`) // next 32 bytes
    let v = sigNoPrefix.substring(128, 130) // last bytes
    if (v === '00') {
      v = '1b'
    } else if (v === '01') {
      v = '1c'
    }
    if (v !== '1b' && v !== '1c') {
      throw new Error('Invalid signature')
    }
    const secp256k1n = hexToBigInt(
      '0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141',
    )

    if (s > secp256k1n / BigInt(2)) {
      s = secp256k1n - s
      v = v === '1b' ? '1c' : '1b'
    }

    const formattedS = s.toString(16).padStart(64, '0')
    const formattedSignature = `0x${r}${formattedS}${v}`
    return formattedSignature
  }
}

export namespace ValueFormatter {
  const numberIntl = new Intl.NumberFormat('en-US', {
    maximumSignificantDigits: 6,
  })

  export function format(num: bigint | number | undefined, units = 18) {
    if (!num) return '0'
    return numberIntl.format(
      typeof num === 'bigint' ? Number(Value.format(num, units)) : num,
    )
  }

  const priceIntl = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  })

  export function formatToPrice(
    num: string | bigint | number | undefined,
    units = 18,
  ) {
    if (!num) return '0'
    return priceIntl.format(
      typeof num === 'bigint' ? Number(Value.format(num, units)) : Number(num),
    )
  }

  const dollarIntl = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  })

  /**
   * Formats a number as a dollar amount with commas and up to 2 decimal places.
   * Shows decimals only if they exist and are non-zero.
   * @param num - The number to format (can be string, bigint, or number)
   * @param units - The number of decimal units (default: 18 for wei)
   * @returns Formatted dollar string (e.g., "1,234.56" or "1,234")
   *
   * @example
   * ValueFormatter.formatDollar(1234.56)
   * // Returns: "1,234.56"
   *
   * @example
   * ValueFormatter.formatDollar(1234)
   * // Returns: "1,234"
   *
   * @example
   * ValueFormatter.formatDollar("1234.567")
   * // Returns: "1,234.57"
   */
  export function formatDollar(
    num: string | bigint | number | undefined,
    units = 18,
  ) {
    if (!num) return '0'
    const value =
      typeof num === 'bigint' ? Number(Value.format(num, units)) : Number(num)
    return dollarIntl.format(value)
  }

  /**
   * Formats a number with suffix notation (B for Billion, M for Million, K for Thousand).
   * Automatically determines the appropriate suffix based on the number's magnitude.
   * @param num - The number to format (can be string, bigint, or number)
   * @param units - The number of decimal units (default: 18 for wei)
   * @param options - Formatting options
   * @param options.decimals - Number of decimal places to show (default: 2)
   * @returns Formatted number with suffix (e.g., "1.23B", "456.78M", "12.34K")
   *
   * @example
   * ValueFormatter.formatWithSuffix(1234567890)
   * // Returns: "1.23B"
   *
   * @example
   * ValueFormatter.formatWithSuffix(1234567)
   * // Returns: "1.23M"
   *
   * @example
   * ValueFormatter.formatWithSuffix(12345)
   * // Returns: "12.35K"
   *
   * @example
   * ValueFormatter.formatWithSuffix(123)
   * // Returns: "123"
   *
   * @example
   * ValueFormatter.formatWithSuffix(1234567890, 18, { decimals: 1 })
   * // Returns: "1.2B"
   *
   * @example
   * ValueFormatter.formatWithSuffix(12345000000000)
   * // Returns: "12,345T"
   */
  export function formatWithSuffix(
    num: string | bigint | number | undefined,
    units = 18,
    { decimals = 2 }: { decimals?: number } = {},
  ) {
    if (!num) return '0'

    const value =
      typeof num === 'bigint' ? Number(Value.format(num, units)) : Number(num)

    if (Number.isNaN(value)) return '0'

    const absValue = Math.abs(value)
    const sign = value < 0 ? '-' : ''

    // Trillion (1,000,000,000,000)
    if (absValue >= 1_000_000_000_000) {
      const trillionValue = absValue / 1_000_000_000_000
      // Add comma formatting when the number has more than 4 digits (e.g., 1,234.56T)
      if (trillionValue >= 1000) {
        const formatter = new Intl.NumberFormat('en-US', {
          maximumFractionDigits: decimals,
          minimumFractionDigits: decimals,
        })
        return `${sign}${formatter.format(trillionValue)}T`
      }
      return `${sign}${trillionValue.toFixed(decimals)}T`
    }

    // Billion (1,000,000,000)
    if (absValue >= 1_000_000_000) {
      return `${sign}${(absValue / 1_000_000_000).toFixed(decimals)}B`
    }

    // Million (1,000,000)
    if (absValue >= 1_000_000) {
      return `${sign}${(absValue / 1_000_000).toFixed(decimals)}M`
    }

    // Thousand (1,000)
    if (absValue >= 1_000) {
      return `${sign}${(absValue / 1_000).toFixed(decimals)}K`
    }

    // Less than 1,000 - show as is with decimals
    return `${sign}${absValue.toFixed(decimals)}`
  }

  export const anyToFloat = (value: any, fallback: any = 0) => {
    const calcValue = value?.toString?.().replace(',', '')

    if (Number.isNaN(calcValue) || !calcValue) return fallback
    return Number.parseFloat(calcValue)
  }
}

export namespace PercentFormatter {
  const numberIntl = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
    style: 'percent',
  })

  export function format(num: number | undefined) {
    if (!num) return '0%'
    return numberIntl.format(Number(num / 100))
  }
}

export namespace DateFormatter {
  const dateIntl = new Intl.DateTimeFormat('en-CA', {
    day: '2-digit',
    hour: '2-digit',
    hour12: false,
    minute: '2-digit',
    month: '2-digit',
    second: '2-digit',
    year: 'numeric',
  })

  export function format(date: string) {
    return dateIntl.format(new Date(date))
  }

  // given a timestamp, return a string that says how long ago it was
  export function ago(timestamp: Date) {
    const now = Date.now()
    const diff = now - timestamp.getTime()
    const seconds = Math.floor(diff / 1_000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    const weeks = Math.floor(days / 7)
    const months = Math.floor(days / 30)
    const years = Math.floor(days / 365)

    if (years > 0) return `${years}y`
    if (months > 0) return `${months}M`
    if (weeks > 0) return `${weeks}w`
    if (days > 0) return `${days}d`
    if (hours > 0) return `${hours}h`
    if (minutes > 0) return `${minutes}m`
    return `${seconds}s`
  }

  export function timeToDuration(timestamp: number) {
    const now = Date.now()
    const targetTime = new Date(timestamp)
    const diff = targetTime.getTime() - now

    if (diff < 0) return 'expired'

    const seconds = Math.floor(diff / 1_000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    const weeks = Math.floor(days / 7)
    const months = Math.floor(days / 30)
    const years = Math.floor(days / 365)

    if (years > 0) return `${years}y`
    if (months > 0) return `${months}M`
    if (weeks > 0) return `${weeks}w`
    if (days > 0) return `${days}d`
    if (hours > 0) return `${hours}h`
    if (minutes > 0) return `${minutes}m`
    return `${seconds}s`
  }
}

export namespace SessionFormatter {
  /**
   * Formats a Unix timestamp expiry time to human-readable duration.
   * @param expiry - Unix timestamp (in seconds) when the session expires
   * @returns Human-readable duration string (e.g., "2 hours", "30 minutes", "Expired")
   *
   * @example
   * SessionFormatter.formatExpiryTime(Math.floor(Date.now() / 1000) + 3600)
   * // Returns: "1 hour"
   */
  export function formatExpiryTime(expiry: number): string {
    const now = Math.floor(Date.now() / 1000)
    const diff = expiry - now

    if (diff <= 0) return 'Expired'

    const minutes = Math.floor(diff / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days} day${days > 1 ? 's' : ''}`
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}`
    return `${minutes} minute${minutes > 1 ? 's' : ''}`
  }

  /**
   * Formats spend limit from permission data to readable format.
   * @param spend - Array of spend limit objects from permission
   * @returns Formatted spend limit string (e.g., "50.00 tokens per hour", "No limit")
   *
   * @example
   * SessionFormatter.formatSpendLimit([{ limit: BigInt('50000000000000000000'), period: 'hour', token: '0x...' }])
   * // Returns: "50.00 tokens per hour"
   */
  export function formatSpendLimit(spend: Spend[]): string {
    if (spend.length === 0) return 'No limit'

    const firstSpend = spend[0]
    if (!firstSpend) return 'No limit'

    const amount = Number(firstSpend.limit) / 1e18 // Assuming 18 decimals
    return `${amount.toFixed(2)} tokens per ${firstSpend.period}`
  }

  /**
   * Truncates an Ethereum address to a shorter format for display.
   * @param address - The Ethereum address to truncate
   * @returns Truncated address (e.g., "0x1234...5678")
   *
   * @example
   * SessionFormatter.truncateAddress("0x1234567890123456789012345678901234567890")
   * // Returns: "0x1234...7890"
   */
  export function truncateAddress(address: string): string {
    if (address.length <= 10) return address
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }
}
