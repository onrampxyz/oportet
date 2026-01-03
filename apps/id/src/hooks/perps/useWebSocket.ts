import { useEffect, useRef, useState } from 'react'
import {
  createSocket,
  type WebSocketOptions,
  type WebSocketService,
} from '~/services/websocket'

export type UseWebSocketOptions = WebSocketOptions & {
  autoConnect?: boolean
}

export type UseWebSocketReturn = {
  send: (data: string | object) => void
  close: () => void
  connect: () => void
  isConnected: boolean
  readyState: number | null
}

/**
 * React hook for managing WebSocket connections
 * @param options - WebSocket configuration options
 * @returns WebSocket connection utilities
 *
 * @example
 * function Component() {
 *   const { send, isConnected } = useWebSocket({
 *     autoConnect: true,
 *     onMessage: (event) => {
 *       const data = JSON.parse(event.data)
 *       console.log('Received:', data)
 *     },
 *     onOpen: () => console.log('Connected'),
 *     onClose: () => console.log('Disconnected'),
 *   })
 *
 *   return (
 *     <button onClick={() => send({ type: 'subscribe', channel: 'trades' })}>
 *       Subscribe
 *     </button>
 *   )
 * }
 */
export function useWebSocket(
  options: UseWebSocketOptions = {},
): UseWebSocketReturn {
  const wsRef = useRef<WebSocketService | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [readyState, setReadyState] = useState<number | null>(null)

  const { autoConnect = true, ...wsOptions } = options

  // biome-ignore lint/correctness/useExhaustiveDependencies: WebSocket should only be created once
  useEffect(() => {
    // Create WebSocket instance with enhanced handlers
    wsRef.current = createSocket({
      ...wsOptions,
      onClose: (event) => {
        setIsConnected(false)
        setReadyState(WebSocket.CLOSED)
        wsOptions.onClose?.(event)
      },
      onError: (event) => {
        setIsConnected(false)
        wsOptions.onError?.(event)
      },
      onMessage: (event) => {
        wsOptions.onMessage?.(event)
      },
      onOpen: (event) => {
        setIsConnected(true)
        setReadyState(WebSocket.OPEN)
        wsOptions.onOpen?.(event)
      },
    })

    // Auto-connect if enabled
    if (autoConnect) {
      wsRef.current.connect()
    }

    // Cleanup on unmount
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
    }
  }, []) // Empty dependency array - only run once on mount

  const send = (data: string | object) => {
    wsRef.current?.send(data)
  }

  const close = () => {
    wsRef.current?.close()
    setIsConnected(false)
    setReadyState(WebSocket.CLOSED)
  }

  const connect = () => {
    wsRef.current?.connect()
  }

  return {
    close,
    connect,
    isConnected,
    readyState,
    send,
  }
}
