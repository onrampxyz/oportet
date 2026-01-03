import type React from 'react'
import { OrderbookProvider } from './OrderbookContext'
import { OrdersProvider } from './OrdersContext'
import { PositionsProvider } from './PositionsContext'
import { WebSocketConnectionProvider } from './WebSocketConnectionContext'
import { WebSocketMessageBusProvider } from './WebSocketMessageBus'

type PerpsProviderProps = {
  children: React.ReactNode
  autoConnect?: boolean
}

/**
 * Main Perps Provider that composes all nested contexts
 * This architecture prevents unnecessary re-renders by splitting state into separate contexts
 *
 * Structure:
 * - WebSocketConnectionProvider: Manages WebSocket connection
 * - WebSocketMessageBusProvider: Routes messages to appropriate contexts
 * - OrderbookProvider: Manages orderbook data
 * - PositionsProvider: Manages positions data
 * - OrdersProvider: Manages orders data
 * - MarketProvider: Manages selected market
 *
 * Components only re-render when their specific data changes
 */
export function PerpsProvider({
  children,
  autoConnect = true,
}: Readonly<PerpsProviderProps>) {
  return (
    <WebSocketMessageBusProvider>
      <WebSocketConnectionProvider autoConnect={autoConnect}>
        <OrderbookProvider>
          <PositionsProvider>
            <OrdersProvider>{children}</OrdersProvider>
          </PositionsProvider>
        </OrderbookProvider>
      </WebSocketConnectionProvider>
    </WebSocketMessageBusProvider>
  )
}

// Re-export all hooks for convenience
export { useOrderbook } from './OrderbookContext'
export { useOrders } from './OrdersContext'
export { usePositions } from './PositionsContext'
export { useWebSocketConnection } from './WebSocketConnectionContext'
