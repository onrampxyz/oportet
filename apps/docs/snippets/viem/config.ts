import { Porto } from 'rise-wallet'
import { createClient, custom } from 'viem'

export const porto = Porto.create()

export const client = createClient({
  transport: custom(porto.provider),
})
