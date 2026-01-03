/**
 * WebSocket service for connecting to Rise Trade API
 * Provides a managed WebSocket connection with automatic reconnection
 */

const WS_URL = 'wss://ws.testnet.rise.trade/ws'

export type WebSocketMessage = {
  type: string
  data: unknown
}

export type WebSocketEventHandlers = {
  onOpen?: (event: Event) => void
  onMessage?: (event: MessageEvent) => void
  onClose?: (event: CloseEvent) => void
  onError?: (event: Event) => void
}

export type WebSocketOptions = WebSocketEventHandlers & {
  reconnect?: boolean
  reconnectInterval?: number
  maxReconnectAttempts?: number
}

export class WebSocketService {
  private socket: WebSocket | null = null
  private url: string
  private handlers: WebSocketEventHandlers
  private reconnect: boolean
  private reconnectInterval: number
  private maxReconnectAttempts: number
  private reconnectAttempts = 0
  private shouldReconnect = true
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null

  constructor(url: string = WS_URL, options: WebSocketOptions = {}) {
    this.url = url
    this.handlers = {
      onClose: options.onClose,
      onError: options.onError,
      onMessage: options.onMessage,
      onOpen: options.onOpen,
    }
    this.reconnect = options.reconnect ?? true
    this.reconnectInterval = options.reconnectInterval ?? 3000
    this.maxReconnectAttempts = options.maxReconnectAttempts ?? 5
  }

  /**
   * Connect to the WebSocket server
   */
  connect(): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      console.warn('WebSocket is already connected')
      return
    }

    try {
      this.socket = new WebSocket(this.url)

      this.socket.onopen = (event) => {
        console.log('WebSocket connected:', this.url)
        this.reconnectAttempts = 0
        this.handlers.onOpen?.(event)
      }

      this.socket.onmessage = (event) => {
        this.handlers.onMessage?.(event)
      }

      this.socket.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason)
        this.handlers.onClose?.(event)

        // Attempt to reconnect if enabled
        if (this.shouldReconnect && this.reconnect) {
          this.attemptReconnect()
        }
      }

      this.socket.onerror = (event) => {
        console.error('WebSocket error:', event)
        this.handlers.onError?.(event)
      }
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error)
      if (this.shouldReconnect && this.reconnect) {
        this.attemptReconnect()
      }
    }
  }

  /**
   * Attempt to reconnect to the WebSocket server
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error(
        `Max reconnection attempts (${this.maxReconnectAttempts}) reached`,
      )
      return
    }

    this.reconnectAttempts++
    console.log(
      `Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`,
    )

    this.reconnectTimeout = setTimeout(() => {
      this.connect()
    }, this.reconnectInterval)
  }

  /**
   * Send a message through the WebSocket
   */
  send(data: string | object): void {
    if (this.socket?.readyState !== WebSocket.OPEN) {
      console.error('WebsSocket is not connected')
      return
    }

    const message = typeof data === 'string' ? data : JSON.stringify(data)
    this.socket.send(message)
  }

  /**
   * Close the WebSocket connection
   */
  close(code?: number, reason?: string): void {
    this.shouldReconnect = false

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }

    if (this.socket) {
      this.socket.close(code, reason)
      this.socket = null
    }
  }

  /**
   * Get the current connection state
   */
  getReadyState(): number | null {
    return this.socket?.readyState ?? null
  }

  /**
   * Check if the WebSocket is connected
   */
  isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN
  }

  /**
   * Update event handlers
   */
  updateHandlers(handlers: Partial<WebSocketEventHandlers>): void {
    this.handlers = {
      ...this.handlers,
      ...handlers,
    }
  }
}

/**
 * Create a new WebSocket connection
 * @param options - WebSocket configuration options
 * @returns WebSocketService instance
 *
 * @example
 * const ws = createSocket({
 *   onOpen: (event) => console.log('Connected'),
 *   onMessage: (event) => console.log('Message:', event.data),
 *   onClose: (event) => console.log('Disconnected'),
 *   onError: (event) => console.error('Error:', event),
 * })
 *
 * ws.connect()
 */
export function createSocket(options?: WebSocketOptions): WebSocketService {
  return new WebSocketService(WS_URL, options)
}

/**
 * Create a WebSocket connection with custom URL
 * @param url - WebSocket server URL
 * @param options - WebSocket configuration options
 * @returns WebSocketService instance
 */
export function createSocketWithUrl(
  url: string,
  options?: WebSocketOptions,
): WebSocketService {
  return new WebSocketService(url, options)
}
