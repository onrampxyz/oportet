import { createClient, http } from 'viem'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import * as Http from '../../test/src/http.js'
import * as Chains from './Chains.js'
import * as Transport from './Transport.js'

describe('relayProxy', () => {
  let requests = 0
  let server: Http.Server
  beforeAll(async () => {
    server = await Http.createServer((_request, response) => {
      requests++
      response.writeHead(500).end()
    })
  })
  afterAll(async () => {
    await server.closeAsync()
  })

  function getClient() {
    return createClient({
      chain: Chains.anvil,
      transport: Transport.relayProxy({
        public: http(server.url),
        relay: http(server.url),
      }),
    })
  }

  test('behavior: retries a failed relay request in one layer', async () => {
    requests = 0
    await expect(
      getClient().request({ method: 'wallet_getCapabilities', params: [] }),
    ).rejects.toThrow()
    expect(requests).toMatchInlineSnapshot('4')
  })

  test('behavior: sends a relay request once when `retryCount` is 0', async () => {
    requests = 0
    await expect(
      getClient().request(
        { method: 'wallet_getCapabilities', params: [] },
        { retryCount: 0 },
      ),
    ).rejects.toThrow()
    expect(requests).toMatchInlineSnapshot('1')
  })
})
