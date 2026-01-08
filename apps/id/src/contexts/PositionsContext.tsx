import type React from 'react'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { PositionInfo } from '~/hooks'
import { useWebSocketConnection } from './WebSocketConnectionContext'
import { useWebSocketMessageBus } from './WebSocketMessageBus'

type PositionsContextState = {
  positions: PositionInfo[]
  loading: boolean
  closePosition: (marketId: string) => void
  closeAllPositions: () => void
}

const PositionsContext = createContext<PositionsContextState | undefined>(
  undefined,
)

export function usePositions() {
  const context = useContext(PositionsContext)
  if (!context) {
    throw new Error('usePositions must be used within a PositionsProvider')
  }
  return context
}

type PositionsProviderProps = {
  children: React.ReactNode
}

export function PositionsProvider({
  children,
}: Readonly<PositionsProviderProps>) {
  const { send, isConnected } = useWebSocketConnection()
  const { subscribe } = useWebSocketMessageBus()

  const [positions, setPositions] = useState<PositionInfo[]>([])
  const [loading, setLoading] = useState(true)

  // This will be called from parent when WebSocket messages arrive
  const handlePositionsMessage = useCallback((type: string, data: any) => {
    if (type === 'snapshot') {
      setPositions(data)
      setLoading(false)
    } else if (type === 'update') {
      setPositions((prev) => {
        const index = prev.findIndex((p) => p.market === data.market)
        if (index !== -1) {
          const updated = [...prev]
          updated[index] = data
          return updated
        }
        return [...prev, data]
      })
    } else if (type === 'close') {
      setPositions((prev) => prev.filter((p) => p.market !== data.market))
    }
  }, [])

  const closePosition = useCallback(
    (marketId: string) => {
      if (!isConnected) return
      send({
        method: 'close_position',
        params: {
          market_id: marketId,
        },
      })
    },
    [isConnected, send],
  )

  const closeAllPositions = useCallback(() => {
    if (!isConnected) return
    send({
      method: 'close_all_positions',
      params: {},
    })
  }, [isConnected, send])

  // Subscribe to positions messages from the message bus
  useEffect(() => {
    const unsubscribe = subscribe('positions', handlePositionsMessage)
    return unsubscribe
  }, [subscribe, handlePositionsMessage])

  const value = useMemo<PositionsContextState>(
    () => ({
      closeAllPositions,
      closePosition,
      loading,
      positions,
    }),
    [positions, loading, closePosition, closeAllPositions],
  )

  return (
    <PositionsContext.Provider value={value}>
      {children}
    </PositionsContext.Provider>
  )
}

// Export message handler for parent to call
export type PositionsMessageHandler = (type: string, data: any) => void
