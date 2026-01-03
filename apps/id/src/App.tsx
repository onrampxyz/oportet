import { Query } from '@porto/apps'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { RouterProvider } from '@tanstack/react-router'
import { WagmiProvider } from 'wagmi'
import { ModalProvider } from '~/contexts/ModalContext.tsx'
import * as Router from '~/lib/Router.tsx'
import * as Wagmi from '~/lib/Wagmi.ts'
import { PerpsProvider } from './contexts/PerpsProvider'

export function App() {
  return (
    <WagmiProvider config={Wagmi.config}>
      <PersistQueryClientProvider
        client={Query.client}
        persistOptions={{ persister: Query.persister }}
      >
        <PerpsProvider autoConnect={true}>
          <ModalProvider>
            <RouterProvider router={Router.router} />
          </ModalProvider>
        </PerpsProvider>
      </PersistQueryClientProvider>
    </WagmiProvider>
  )
}
