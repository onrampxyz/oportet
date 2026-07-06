import { Porto } from 'oportet'
import { RelayClient } from 'oportet/viem'
import { describe, expect, test } from 'vitest'

describe('fromPorto', () => {
  test('default', async () => {
    const porto = Porto.create()
    const client = RelayClient.fromPorto(porto)
    expect({ ...client, uid: null }).toMatchInlineSnapshot(`
      {
        "account": undefined,
        "batch": undefined,
        "cacheTime": 1000,
        "ccipRead": undefined,
        "chain": {
          "blockExplorers": {
            "default": {
              "apiUrl": "https://explorer.testnet.riselabs.xyz/api",
              "name": "Blockscout",
              "url": "https://explorer.testnet.riselabs.xyz/",
            },
          },
          "contracts": {
            "multicall3": {
              "address": "0xca11bde05977b3631167028862be2a173976ca11",
            },
          },
          "extend": [Function],
          "fees": undefined,
          "formatters": undefined,
          "id": 11155931,
          "name": "RISE Testnet",
          "nativeCurrency": {
            "decimals": 18,
            "name": "RISE Testnet Ether",
            "symbol": "ETH",
          },
          "rpcUrls": {
            "default": {
              "http": [
                "https://testnet.riselabs.xyz",
              ],
              "webSocket": [
                "wss://testnet.riselabs.xyz/ws",
              ],
            },
          },
          "serializers": undefined,
          "testnet": true,
        },
        "dataSuffix": undefined,
        "extend": [Function],
        "key": "base",
        "name": "Base Client",
        "pollingInterval": 1000,
        "request": [Function],
        "tokens": undefined,
        "transport": {
          "key": "relayProxy",
          "methods": undefined,
          "name": "Relay Proxy",
          "request": [Function],
          "retryCount": 3,
          "retryDelay": 150,
          "timeout": undefined,
          "type": "relayProxy",
        },
        "type": "base",
        "uid": null,
      }
    `)
  })
})
