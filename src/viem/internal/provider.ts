import * as Mipd from 'mipd'
import * as MipdPostMessage from 'mipd-postmessage/child'

const mipdPMStore = MipdPostMessage.createStore()
const mipdStore = Mipd.createStore()

export async function getProvider(parameters: { rdns: string }) {
  const parentProviders = mipdPMStore
    .getProviders()
    .filter((p) => p.info.rdns !== 'com.risechain.wallet')
  const providers = mipdStore
    .getProviders()
    .filter((p) => p.info.rdns !== 'com.risechain.wallet')

  return (
    providers.find((p) => p.info.rdns === parameters.rdns) ??
    parentProviders.find((p) => p.info.rdns === parameters.rdns)
  )
}
