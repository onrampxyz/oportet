import type * as Mipd from 'mipd'
import { useState } from 'react'

export function InjectedSigner(props: Readonly<InjectedSigner.Props>) {
  const { onSelect, providers, disabled, signingIn } = props

  const [rdns, setRdns] = useState('')

  if (providers.length === 0) return null

  return (
    <div className="rounded-xl text-center">
      <span className="text-th_base-secondary">Use Injected Signer</span>
      <div className="flex flex-wrap items-center justify-center gap-2 py-3">
        {providers.map((provider) => {
          return (
            <button
              className='rounded-xl border border-gray7 p-2 hover:bg-gray3 focus:outline-none focus:ring-2 focus:ring-gray8 data-[connecting=true]:animate-bounce'
              data-connecting={signingIn && provider.info.rdns === rdns}
              disabled={disabled}
              key={provider.info.uuid}
              onClick={() => {
                setRdns(provider.info.rdns)
                onSelect(provider.info.rdns)
              }}
              title={`Connect with ${provider.info.name}`}
              type="button"
            >
              <img
                alt={provider.info.name}
                height={32}
                src={provider.info.icon}
                width={32}
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}

export namespace InjectedSigner {
  export type Props = {
    disabled?: boolean
    onSelect: (providerRdns: string) => void
    providers: Mipd.EIP6963ProviderDetail[]
    signingIn?: boolean
  }
}
