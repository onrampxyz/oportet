import { describe, expect, test } from 'vitest'
import * as Utils from './utils.js'

describe('normalizeValue', () => {
  test('default', () => {
    const value = {
      id: '1',
      payload: { a: 1, b: new Function(), c: [new Date('2025-05-29'), 'foo'] },
      topic: 'test',
    }
    const normalized = Utils.normalizeValue(value)
    expect(normalized).toMatchInlineSnapshot(`
      {
        "id": "1",
        "payload": {
          "a": 1,
          "b": undefined,
          "c": [
            2025-05-29T00:00:00.000Z,
            "foo",
          ],
        },
        "topic": "test",
      }
    `)
  })
})

describe('uniqBy', () => {
  test('default', () => {
    const data = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 2 }]
    const result = Utils.uniqBy(data, (item) => item.id)
    expect(result).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }])
  })
})

describe('rethrowUserRejection', () => {
  // What ox does to anything `createFn`/`getFn` throws: wraps it, dropping the
  // EIP-1193 code viem needs to see a user rejection rather than a retryable
  // failure.
  class CredentialCreationFailedError extends Error {
    override name = 'CredentialCreationFailedError'
  }

  test('surfaces a rejection ox wrapped one level deep', () => {
    const rejected = Object.assign(new Error('User rejected'), { code: 4001 })
    const wrapped = new CredentialCreationFailedError('failed', {
      cause: rejected,
    })

    expect(() => Utils.rethrowUserRejection(wrapped)).toThrowError(rejected)
  })

  test('walks the whole cause chain, not just the first link', () => {
    const rejected = Object.assign(new Error('User rejected'), { code: 4001 })
    const wrapped = new Error('outer', {
      cause: new Error('inner', { cause: rejected }),
    })

    expect(() => Utils.rethrowUserRejection(wrapped)).toThrowError(rejected)
  })

  // The adapter that threw can come from a different copy of ox than the one
  // that caught, so the match is on `code`, never `instanceof`.
  test('matches on code alone, across module instances', () => {
    const foreign = Object.assign(new Error('from another ox'), { code: 4001 })

    expect(() => Utils.rethrowUserRejection(foreign)).toThrowError(foreign)
  })

  test('leaves a genuine failure untouched so it stays retryable', () => {
    const real = new CredentialCreationFailedError('authenticator exploded')

    expect(() => Utils.rethrowUserRejection(real)).toThrowError(real)
  })

  test('does not mistake a different EIP-1193 code for a rejection', () => {
    const disconnected = Object.assign(new Error('disconnected'), {
      code: 4900,
    })
    const wrapped = new CredentialCreationFailedError('failed', {
      cause: disconnected,
    })

    expect(() => Utils.rethrowUserRejection(wrapped)).toThrowError(wrapped)
  })
})
