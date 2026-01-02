import { useQueries } from '@tanstack/react-query'

interface SelectorSignature {
  id: number
  created_at: string
  text_signature: string
  hex_signature: string
  bytes_signature: string
}

interface FourByteResponse {
  count: number
  next: string | null
  previous: string | null
  results: SelectorSignature[]
}

interface DecodedSelector {
  count: number
  signatures: SelectorSignature[]
  primarySignature: string | undefined
}

/**
 * Decodes a function selector using the 4byte.directory API
 * Can be called in loops or map functions
 */
export async function decodeSelector(
  selector: string,
): Promise<DecodedSelector> {
  if (!selector) {
    throw new Error('Selector is required')
  }

  const response = await fetch(
    `https://www.4byte.directory/api/v1/signatures/?hex_signature=${selector}`,
  )

  if (!response.ok) {
    throw new Error(`Failed to fetch selector: ${response.statusText}`)
  }

  const data: FourByteResponse = await response.json()

  return {
    count: data.count,
    // Return the most common/first signature as the primary one
    primarySignature: data.results[0]?.text_signature,
    signatures: data.results,
  }
}

/**
 * React hook to decode multiple function selectors in parallel
 * Uses TanStack Query with infinite staleTime for permanent caching
 */
export function useSignatureSelector({
  enabled,
  selectors,
}: {
  enabled?: boolean | undefined
  selectors: string[]
}) {
  const queries = useQueries({
    queries: selectors.map((selector) => ({
      enabled: enabled && !!selector,
      queryFn: () => decodeSelector(selector),
      queryKey: ['selector', selector],
      refetchOnWindowFocus: false,
      staleTime: Number.POSITIVE_INFINITY,
    })),
  })

  // Transform queries into a more usable format
  const selectorMap = new Map<string, DecodedSelector | undefined>()
  selectors.forEach((selector, index) => {
    if (queries[index]?.data) {
      selectorMap.set(selector, queries[index].data)
    }
  })

  return {
    // Map of selector -> decoded data
    data: selectorMap,
    // Check if any query has an error
    isError: queries.some((q) => q.isError),
    // Check if all queries are loaded
    isLoading: queries.some((q) => q.isLoading),
    // Check if all queries are successful
    isSuccess: queries.every((q) => q.isSuccess),
    // Raw queries for advanced usage
    queries,
  }
}
