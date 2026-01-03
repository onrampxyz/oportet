/**
 * Example usage of the useWebSocket React hook
 */

import { useState } from 'react'
import { useWebSocket } from './useWebSocket'

// Example 1: Basic market data subscription
export function MarketDataComponent() {
  const [marketData, setMarketData] = useState<any>(null)

  const { send, isConnected } = useWebSocket({
    autoConnect: true,
    onMessage: (event) => {
      const data = JSON.parse(event.data)
      if (data.type === 'market_update') {
        setMarketData(data)
      }
    },
    onOpen: () => {
      console.log('WebSocket connected')
      // Subscribe to markets channel
      send({ channel: 'markets', type: 'subscribe' })
    },
  })

  return (
    <div>
      <h2>Market Data</h2>
      <p>Status: {isConnected ? 'Connected' : 'Disconnected'}</p>
      {marketData && (
        <div>
          <p>Market: {marketData.market_id}</p>
          <p>Price: {marketData.mark_price}</p>
        </div>
      )}
    </div>
  )
}

// Example 2: Order updates
export function OrderUpdatesComponent() {
  const [orders, setOrders] = useState<any[]>([])

  const { send, isConnected, close } = useWebSocket({
    autoConnect: true,
    onMessage: (event) => {
      const data = JSON.parse(event.data)
      if (data.type === 'order_update') {
        setOrders((prev) => [...prev, data])
      }
    },
    onOpen: () => {
      // Subscribe to orders channel
      send({ channel: 'orders', type: 'subscribe' })
    },
  })

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2>Order Updates</h2>
        <div>
          <span className={isConnected ? 'text-green-600' : 'text-red-600'}>
            {isConnected ? '● Connected' : '● Disconnected'}
          </span>
          <button onClick={close} type="button">
            Disconnect
          </button>
        </div>
      </div>
      <ul>
        {orders.map((order) => (
          <li key={order.id}>
            Order #{order.id} - {order.status}
          </li>
        ))}
      </ul>
    </div>
  )
}

// Example 3: Multiple subscriptions
export function MultiChannelComponent() {
  const [trades, setTrades] = useState<any[]>([])
  const [orderbook, setOrderbook] = useState<any>(null)

  const { send, isConnected } = useWebSocket({
    autoConnect: true,
    onMessage: (event) => {
      const data = JSON.parse(event.data)

      switch (data.type) {
        case 'trade':
          setTrades((prev) => [...prev.slice(-9), data])
          break
        case 'orderbook':
          setOrderbook(data)
          break
      }
    },
    onOpen: () => {
      // Subscribe to multiple channels
      send({ channel: 'trades', market_id: '1', type: 'subscribe' })
      send({ channel: 'orderbook', market_id: '1', type: 'subscribe' })
    },
  })

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <h3>Recent Trades</h3>
        <p>Status: {isConnected ? 'Live' : 'Offline'}</p>
        <ul>
          {trades.map((trade) => (
            <li
              key={`${trade.price}-${trade.quantity}-${trade.timestamp || Date.now()}`}
            >
              {trade.price} @ {trade.quantity}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3>Orderbook</h3>
        {orderbook && (
          <div>
            <div>Bids: {orderbook.bids?.length ?? 0}</div>
            <div>Asks: {orderbook.asks?.length ?? 0}</div>
          </div>
        )}
      </div>
    </div>
  )
}

// Example 4: Manual connection control
export function ManualConnectionComponent() {
  const { connect, close, isConnected, send } = useWebSocket({
    autoConnect: false, // Don't connect automatically
    onClose: () => {
      console.log('WebSocket closed')
    },
    onOpen: () => {
      console.log('WebSocket opened')
    },
  })

  const handleConnect = () => {
    connect()
  }

  const handleDisconnect = () => {
    close()
  }

  const handleSubscribe = () => {
    send({ channel: 'markets', type: 'subscribe' })
  }

  return (
    <div>
      <h2>Manual Connection Control</h2>
      <p>Status: {isConnected ? 'Connected' : 'Disconnected'}</p>
      <div className="flex gap-2">
        <button disabled={isConnected} onClick={handleConnect} type="button">
          Connect
        </button>
        <button
          disabled={!isConnected}
          onClick={handleDisconnect}
          type="button"
        >
          Disconnect
        </button>
        <button disabled={!isConnected} onClick={handleSubscribe} type="button">
          Subscribe to Markets
        </button>
      </div>
    </div>
  )
}
