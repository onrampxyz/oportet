import { PortoConfig } from '@porto/apps'
import { Mode } from 'rise-wallet'
import { porto } from 'rise-wallet/wagmi'
import { createConfig, createStorage } from 'wagmi'

const config = PortoConfig.getConfig()

export const wagmiConfig = createConfig({
  chains: config.chains,
  connectors: [
    porto({
      ...config,
      mode: Mode.dialog({
        host: PortoConfig.getDialogHost(),
      }),
    }),
  ],
  multiInjectedProviderDiscovery: false,
  storage: createStorage({ storage: localStorage }),
  transports: config.transports,
})

declare module 'wagmi' {
  interface Register {
    config: typeof wagmiConfig
  }
}
