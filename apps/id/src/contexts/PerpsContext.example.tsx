/**
 * Example usage of the PerpsContext
 * This demonstrates how to use the Perps context in components
 */

import { PerpsProvider, usePerps } from './PerpsContext'

// Example 1: Wrap your app with PerpsProvider
export function AppWithPerps() {
  return (
    <PerpsProvider autoConnect={true}>
      <YourPerpsApp />
    </PerpsProvider>
  )
}

// Example 2: Access orderbook data
export function OrderBookComponent() {
  const { orderbook, orderbookLoading, isConnected } = usePerps()

  if (orderbookLoading) {
    return <div>Loading orderbook...</div>
  }

  if (!orderbook) {
    return <div>No orderbook data</div>
  }

  return (
    <div>
      <h2>Order Book</h2>
      <p>Status: {isConnected ? 'Connected' : 'Disconnected'}</p>
      <div>
        <h3>Asks</h3>
        {orderbook.asks.slice(0, 10).map((ask) => (
          <div key={ask.price}>
            {ask.price} - {ask.size}
          </div>
        ))}
      </div>
      <div>
        <h3>Bids</h3>
        {orderbook.bids.slice(0, 10).map((bid) => (
          <div key={bid.price}>
            {bid.price} - {bid.size}
          </div>
        ))}
      </div>
    </div>
  )
}

// Example 3: Access positions data
export function PositionsComponent() {
  const { positions, positionsLoading, closePosition, closeAllPositions } =
    usePerps()

  if (positionsLoading) {
    return <div>Loading positions...</div>
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2>Positions</h2>
        {positions.length > 0 && (
          <button onClick={closeAllPositions} type="button">
            Close All Positions
          </button>
        )}
      </div>
      {positions.length === 0 ? (
        <p>No open positions</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Market</th>
              <th>Side</th>
              <th>Size</th>
              <th>Entry</th>
              <th>Mark</th>
              <th>PnL</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {positions.map((position) => (
              <tr key={position.market}>
                <td>{position.market}</td>
                <td>{position.side}</td>
                <td>{position.size}</td>
                <td>{position.entry}</td>
                <td>{position.mark}</td>
                <td
                  className={
                    position.isPositive ? 'text-green-600' : 'text-red-600'
                  }
                >
                  {position.pnl} ({position.pnlPercent}%)
                </td>
                <td>
                  <button
                    onClick={() => closePosition(position.market)}
                    type="button"
                  >
                    Close
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

// Example 4: Access orders data
export function OrdersComponent() {
  const { orders, ordersLoading, cancelOrder } = usePerps()

  if (ordersLoading) {
    return <div>Loading orders...</div>
  }

  return (
    <div>
      <h2>Orders</h2>
      {orders.length === 0 ? (
        <p>No open orders</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Market</th>
              <th>Side</th>
              <th>Type</th>
              <th>Size</th>
              <th>Price</th>
              <th>Filled</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.market}>
                <td>{order.market}</td>
                <td>{order.side}</td>
                <td>{order.type}</td>
                <td>{order.size}</td>
                <td>{order.price}</td>
                <td>{order.filled}</td>
                <td>{order.status}</td>
                <td>
                  <button
                    onClick={() => cancelOrder(order.market)}
                    type="button"
                  >
                    Cancel
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

// Example 5: Market selection
export function MarketSelectorComponent() {
  const { selectedMarket, setSelectedMarket, subscribeToOrderbook } = usePerps()

  const handleMarketChange = (market: any) => {
    setSelectedMarket(market)
    // Orderbook subscription happens automatically in the context
  }

  return (
    <div>
      <h2>Selected Market</h2>
      {selectedMarket ? (
        <div>
          <p>Market ID: {selectedMarket.market_id}</p>
          <p>Display Name: {selectedMarket.display_name}</p>
          <p>Mark Price: {selectedMarket.mark_price}</p>
        </div>
      ) : (
        <p>No market selected</p>
      )}
    </div>
  )
}

// Example 6: WebSocket connection control
export function ConnectionControlComponent() {
  const { isConnected, reconnect, disconnect } = usePerps()

  return (
    <div>
      <h2>Connection Control</h2>
      <p>Status: {isConnected ? '🟢 Connected' : '🔴 Disconnected'}</p>
      <div className="flex gap-2">
        <button disabled={isConnected} onClick={reconnect} type="button">
          Connect
        </button>
        <button disabled={!isConnected} onClick={disconnect} type="button">
          Disconnect
        </button>
      </div>
    </div>
  )
}

// Example 7: All-in-one Perps Dashboard
export function PerpsDashboard() {
  const {
    orderbook,
    orderbookLoading,
    positions,
    positionsLoading,
    orders,
    ordersLoading,
    selectedMarket,
    isConnected,
  } = usePerps()

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div>
        <h2>Connection Status</h2>
        <p>{isConnected ? '🟢 Live' : '🔴 Offline'}</p>
      </div>

      <div>
        <h2>Selected Market</h2>
        <p>{selectedMarket?.display_name || 'None'}</p>
      </div>

      <div>
        <h2>Order Book</h2>
        {orderbookLoading ? (
          <p>Loading...</p>
        ) : (
          <p>
            {orderbook?.bids.length || 0} bids, {orderbook?.asks.length || 0}{' '}
            asks
          </p>
        )}
      </div>

      <div>
        <h2>Positions</h2>
        {positionsLoading ? <p>Loading...</p> : <p>{positions.length} open</p>}
      </div>

      <div>
        <h2>Orders</h2>
        {ordersLoading ? <p>Loading...</p> : <p>{orders.length} active</p>}
      </div>
    </div>
  )
}

// Placeholder component
function YourPerpsApp() {
  return (
    <div>
      <PerpsDashboard />
      <OrderBookComponent />
      <PositionsComponent />
      <OrdersComponent />
    </div>
  )
}
