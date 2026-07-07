import { describe, expect, test } from 'vitest'
import { createReactNativePasskeyAdapter } from './passkeyAdapter.js'
import type { PasskeysModule } from './passkeys.js'

type WebAuthn = ReturnType<typeof createReactNativePasskeyAdapter>['webAuthn']
type CreateOptions = Parameters<NonNullable<WebAuthn['createFn']>>[0]
type RequestOptions = Parameters<NonNullable<WebAuthn['getFn']>>[0]

function adapterWith(module: PasskeysModule): WebAuthn {
  return createReactNativePasskeyAdapter({ passkeysModule: module }).webAuthn
}

const creationOptions = {
  publicKey: {
    challenge: new Uint8Array([1, 2, 3]),
    pubKeyCredParams: [],
    rp: { id: 'onramp.xyz', name: 'Onramp' },
    user: {
      displayName: 'User',
      id: new Uint8Array([4, 5, 6]),
      name: 'user',
    },
  },
} as unknown as CreateOptions

const requestOptions = {
  publicKey: { challenge: new Uint8Array([1, 2, 3]) },
} as unknown as RequestOptions

// A native module whose create/get reject with a given dismissal error.
function cancellingModule(makeError: () => Error): PasskeysModule {
  return {
    create: async () => {
      throw makeError()
    },
    get: async () => {
      throw makeError()
    },
  }
}

describe('createReactNativePasskeyAdapter cancellation → 4001', () => {
  test('createFn maps Android "UserCancelled" to code 4001', async () => {
    const webAuthn = adapterWith(
      cancellingModule(() => new Error('UserCancelled')),
    )
    await expect(webAuthn.createFn?.(creationOptions)).rejects.toMatchObject({
      code: 4001,
    })
  })

  test('getFn maps iOS UserCancelledException to code 4001', async () => {
    const webAuthn = adapterWith(
      cancellingModule(() => {
        const error = new Error('cancelled')
        error.name = 'UserCancelledException'
        return error
      }),
    )
    await expect(webAuthn.getFn?.(requestOptions)).rejects.toMatchObject({
      code: 4001,
    })
  })

  test('getFn maps Android NotAllowedError to code 4001', async () => {
    const webAuthn = adapterWith(
      cancellingModule(
        () =>
          new Error(
            'androidx.credentials.exceptions.domerrors.NotAllowedError: dismissed',
          ),
      ),
    )
    await expect(webAuthn.getFn?.(requestOptions)).rejects.toMatchObject({
      code: 4001,
    })
  })

  test('non-dismissal errors propagate unchanged (no 4001)', async () => {
    const webAuthn = adapterWith(
      cancellingModule(() => new Error('network down')),
    )
    let caught: unknown
    try {
      await webAuthn.getFn?.(requestOptions)
    } catch (error) {
      caught = error
    }
    expect(caught).toBeInstanceOf(Error)
    expect((caught as Error).message).toBe('network down')
    expect((caught as { code?: number }).code).toBeUndefined()
  })
})
