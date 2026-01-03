/**
 * Example usage of the WebSocket service
 * This file demonstrates various ways to use the WebSocket connection
 */

import { createSocket } from './websocket'

// Example 1: Basic usage with all event handlers
export function basicExample() {
  const ws = createSocket({
    onClose: (event) => {
      console.log('WebSocket closed:', event.code, event.reason)
    },
    onError: (event) => {
      console.error('WebSocket error:', event)
    },
    onMessage: (event) => {
      const data = JSON.parse(event.data)
      console.log('Received message:', data)
    },
    onOpen: (event) => {
      console.log('WebSocket connected:', event)
      // Subscribe to a channel after connection
      ws.send({
        channel: 'trades',
        type: 'subscribe',
      })
    },
  })

  // Connect to the WebSocket
  ws.connect()

  // Send a message
  setTimeout(() => {
    ws.send({
      data: { market_id: '1' },
      type: 'get_market',
    })
  }, 1000)

  // Close connection after 10 seconds
  setTimeout(() => {
    ws.close()
  }, 10000)
}

// Example 2: Subscribing to market data
export function subscribeToMarkets() {
  const ws = createSocket({
    onMessage: (event) => {
      const data = JSON.parse(event.data)

      // Handle different message types
      switch (data.type) {
        case 'market_update':
          console.log('Market update:', data)
          break
        case 'trade':
          console.log('New trade:', data)
          break
        case 'orderbook':
          console.log('Orderbook update:', data)
          break
        default:
          console.log('Unknown message type:', data)
      }
    },
    onOpen: () => {
      // Subscribe to multiple channels
      ws.send({ channel: 'markets', type: 'subscribe' })
      ws.send({ channel: 'trades', type: 'subscribe' })
      ws.send({ channel: 'orderbook', market_id: '1', type: 'subscribe' })
    },
  })

  ws.connect()
  return ws
}

// Example 3: With custom reconnection settings
export function customReconnectionExample() {
  const ws = createSocket({
    maxReconnectAttempts: 10,

    onClose: () => {
      console.log('Connection closed, will attempt to reconnect...')
    },
    onOpen: () => {
      console.log('Connected successfully!')
    },
    reconnect: true,
    reconnectInterval: 5000, // 5 seconds
  })

  ws.connect()
  return ws
}

// Example 4: Without auto-reconnect
export function noReconnectExample() {
  const ws = createSocket({
    onClose: () => {
      console.log('Connection closed, will not reconnect')
    },
    onOpen: () => {
      console.log('Connected')
    },
    reconnect: false,
  })

  ws.connect()
  return ws
}

// Example 5: Checking connection state
export function connectionStateExample() {
  const ws = createSocket({
    onOpen: () => {
      console.log('Is connected:', ws.isConnected())
      console.log('Ready state:', ws.getReadyState())
    },
  })

  ws.connect()

  // Check connection state periodically
  const interval = setInterval(() => {
    if (ws.isConnected()) {
      console.log('WebSocket is connected')
    } else {
      console.log('WebSocket is disconnected')
    }
  }, 1000)

  // Clean up
  setTimeout(() => {
    clearInterval(interval)
    ws.close()
  }, 10000)

  return ws
}
