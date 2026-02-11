import { type Address, Value } from 'ox'

export namespace PriceFormatter {
  /**
   * Formats a number or bigint to a currency-formatted string.
   *
   * @param value - The number or bigint to format.
   * @returns The formatted string.
   */
  export function format(value: number | bigint) {
    if (typeof value === 'number' && value > 0 && value < 0.01) return '<$0.01'
    return numberIntl.format(value)
  }

  /** @internal */
  const numberIntl = new Intl.NumberFormat('en-US', {
    currency: 'USD',
    style: 'currency',
  })
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
  export function shorten(address: Address.Address, chars = 4) {
    return address.length < chars * 2 + 2
      ? address
      : address.slice(0, chars + 2) + '…' + address.slice(-chars)
  }
}

export namespace ValueFormatter {
  const numberIntl = new Intl.NumberFormat('en-US', {
    maximumSignificantDigits: 4,
  })

  export function format(num: bigint | number | undefined, units = 18) {
    if (!num) return '0'
    return numberIntl.format(
      typeof num === 'bigint' ? Number(Value.format(num, units)) : num,
    )
  }
}

export namespace ErrorFormatter {
  /**
   * Extracts the actual error message from an error string.
   * Looks for "Details:" or "Caused by:" patterns and returns the first sentence.
   *
   * @param errorMessage - The error message string to parse.
   * @returns The extracted error message or the original message if no pattern is found.
   */
  export function extractMessage(errorMessage: string): string {
    // Look for "Details:" or "Caused by:" patterns (case-insensitive)
    const detailsRegex = /Details:\s*(.+?)(?:\.|$)/i
    const causedByRegex = /Caused by:\s*(.+?)(?:\.|$)/i

    const detailsMatch = detailsRegex.exec(errorMessage)
    if (detailsMatch?.[1]) {
      return detailsMatch[1].trim()
    }

    const causedByMatch = causedByRegex.exec(errorMessage)
    if (causedByMatch?.[1]) {
      return causedByMatch[1].trim()
    }

    // If no pattern found, return the first sentence of the original message
    const firstSentenceRegex = /^(.+?)(?:\.|$)/
    const firstSentence = firstSentenceRegex.exec(errorMessage)
    return firstSentence?.[1]?.trim() || errorMessage
  }
}
