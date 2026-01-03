# Perps Context Architecture

Nested context architecture designed to prevent unnecessary re-renders.

## Structure

```
PerpsProvider
├── WebSocketMessageBusProvider
├── WebSocketConnectionProvider
├── OrderbookProvider
├── PositionsProvider
├── OrdersProvider
└── MarketProvider
```

## Usage

```typescript
import {
  PerpsProvider,
  useOrderbook,
  usePositions,
  useOrders,
  useMarket,
  useWebSocketConnection
} from '~/contexts/PerpsProvider'

// Wrap app
<PerpsProvider autoConnect={true}>
  <TradingApp />
</PerpsProvider>

// In components - only re-render when specific data changes
const { orderbook } = useOrderbook()
const { positions } = usePositions()
const { orders } = useOrders()
const { selectedMarket, setSelectedMarket } = useMarket()
const { isConnected } = useWebSocketConnection()
```

## Benefits

- ✅ No unnecessary re-renders
- ✅ Clean separation of concerns
- ✅ Message bus for efficient routing
- ✅ Type-safe
- ✅ Easy to test
