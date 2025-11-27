import * as Mipd from 'mipd-postmessage/child'

const mipdStore = Mipd.createStore()

export async function getProvider(parameters: { rdns: string }) {
  const providers = mipdStore
    .getProviders()
    .filter((p) => p.info.rdns !== 'xyz.ithaca.porto')

  return providers.find((p) => p.info.rdns === parameters.rdns)
}
