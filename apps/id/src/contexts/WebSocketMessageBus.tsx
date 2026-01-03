import type React from 'react'
import { createContext, useCallback, useContext, useMemo, useRef } from 'react'

type MessageHandler = (type: string, data: any) => void

type WebSocketMessageBusContextState = {
  subscribe: (channel: string, handler: MessageHandler) => () => void
  publish: (channel: string, type: string, data: any) => void
}

const WebSocketMessageBusContext = createContext<
  WebSocketMessageBusContextState | undefined
>(undefined)

export function useWebSocketMessageBus() {
  const context = useContext(WebSocketMessageBusContext)
  if (!context) {
    throw new Error(
      'useWebSocketMessageBus must be used within a WebSocketMessageBusProvider',
    )
  }
  return context
}

type WebSocketMessageBusProviderProps = {
  children: React.ReactNode
}

/**
 * Message Bus for WebSocket messages
 * Allows child contexts to subscribe to specific channels without causing re-renders
 */
export function WebSocketMessageBusProvider({
  children,
}: Readonly<WebSocketMessageBusProviderProps>) {
  const handlersRef = useRef<Map<string, Set<MessageHandler>>>(new Map())

  const subscribe = useCallback((channel: string, handler: MessageHandler) => {
    if (!handlersRef.current.has(channel)) {
      handlersRef.current.set(channel, new Set())
    }
    handlersRef.current.get(channel)?.add(handler)

    // Return unsubscribe function
    return () => {
      handlersRef.current.get(channel)?.delete(handler)
      if (handlersRef.current.get(channel)?.size === 0) {
        handlersRef.current.delete(channel)
      }
    }
  }, [])

  const publish = useCallback((channel: string, type: string, data: any) => {
    const handlers = handlersRef.current.get(channel)
    if (handlers) {
      for (const handler of Array.from(handlers)) {
        handler(type, data)
      }
    }
  }, [])

  const value: WebSocketMessageBusContextState = useMemo(() => {
    return {
      publish,
      subscribe,
    }
  }, [publish, subscribe])

  return (
    <WebSocketMessageBusContext.Provider value={value}>
      {children}
    </WebSocketMessageBusContext.Provider>
  )
}
