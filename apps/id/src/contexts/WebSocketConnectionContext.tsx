import type React from 'react'
import { createContext, useCallback, useContext, useMemo } from 'react'
import { useWebSocket } from '~/hooks/perps/useWebSocket'
import { useWebSocketMessageBus } from './WebSocketMessageBus'

type WebSocketConnectionContextState = {
  isConnected: boolean
  reconnect: () => void
  disconnect: () => void
  send: (data: string | object) => void
}

const WebSocketConnectionContext = createContext<
  WebSocketConnectionContextState | undefined
>(undefined)

export function useWebSocketConnection() {
  const context = useContext(WebSocketConnectionContext)
  if (!context) {
    throw new Error(
      'useWebSocketConnection must be used within a WebSocketConnectionProvider',
    )
  }
  return context
}

type WebSocketConnectionProviderProps = {
  children: React.ReactNode
  autoConnect?: boolean
  onClose?: () => void
  onError?: (error: Event) => void
}

export function WebSocketConnectionProvider({
  children,
  autoConnect = true,
  onClose,
  onError,
}: Readonly<WebSocketConnectionProviderProps>) {
  const { publish } = useWebSocketMessageBus()

  const { send, isConnected, connect, close } = useWebSocket({
    autoConnect,
    onClose: () => {
      console.log('Perps WebSocket disconnected')
      onClose?.()
    },
    onError: (error) => {
      console.error('Perps WebSocket error:', error)
      onError?.(error)
    },
    onMessage: (event) => {
      try {
        const message = JSON.parse(event.data)
        const { channel, type, data } = message

        // Publish to message bus
        publish(channel, type, data)
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error)
      }
    },
    onOpen: () => {
      console.log('Perps WebSocket connected')
      // TODO: positions and orders need to authenticate first before subscription
      // send({ method: 'subscribe', params: { channel: 'positions' } })
      // send({ method: 'subscribe', params: { channel: 'orders' } })

      // No authentication required for orderbook channel
      // send({ method: 'subscribe', params: { channel: 'orderbook' } })
    },
  })

  const reconnect = useCallback(() => {
    connect()
  }, [connect])

  const disconnect = useCallback(() => {
    close()
  }, [close])

  const value: WebSocketConnectionContextState = useMemo(() => {
    return {
      disconnect,
      isConnected,
      reconnect,
      send,
    }
  }, [disconnect, isConnected, reconnect, send])

  return (
    <WebSocketConnectionContext.Provider value={value}>
      {children}
    </WebSocketConnectionContext.Provider>
  )
}
