import { describe, expect, test } from 'vitest'
import * as Porto from './Porto.js'
import * as Storage from './Storage.js'

describe('create', () => {
  test('behavior: restores accounts saved under the pre-rename store key', async () => {
    const storage = Storage.memory()
    const address = '0x0000000000000000000000000000000000000001'
    await storage.setItem('risewallet.store', {
      state: { accounts: [{ address, keys: [] }], chainIds: [] },
      version: 5,
    })

    const porto = Porto.create({ storage })
    await porto._internal.store.persist.rehydrate()

    expect(
      porto._internal.store.getState().accounts.map((a) => a.address),
    ).toEqual([address])
  })
})
