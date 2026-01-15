import type * as Mipd from 'mipd'
import type * as React from 'react'

export function InjectedSigner(props: Readonly<InjectedSignerContent.Props>) {
  // const { disabled, onSelect, providers, render, variant = 'primary' } = props
  const { onSelect, providers } = props

  if (providers.length === 0) return null

  return (
    <div className="rounded-xl text-center">
      <span className="text-th_base-secondary">Use Injected Signer</span>
      <div className="flex flex-wrap items-center justify-center gap-2 py-3">
        {providers.map((provider) => {
          return (
            <button
              className="rounded-xl border border-gray7 p-2 hover:bg-gray3 focus:outline-none focus:ring-2 focus:ring-gray8"
              key={provider.info.uuid}
              onClick={() => onSelect(provider.info.rdns)}
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

export namespace InjectedSignerContent {
  export type Props = {
    disabled?: boolean
    onSelect: (providerRdns: string) => void
    providers: Mipd.EIP6963ProviderDetail[]
    render?: React.ReactElement
    variant?: 'primary' | 'secondary'
  }
}
