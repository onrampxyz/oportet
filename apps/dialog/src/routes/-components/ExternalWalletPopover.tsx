import * as Ariakit from '@ariakit/react'
import { Button } from '@porto/ui'
import type * as Mipd from 'mipd'
import LucideChevronDown from '~icons/lucide/chevron-down'

export function ExternalWalletPopover(props: ExternalWalletPopover.Props) {
  const { disabled, onSelect, providers, variant = 'primary' } = props

  if (providers.length === 0) return null

  return (
    <Ariakit.PopoverProvider>
      <Ariakit.PopoverDisclosure
        className={
          variant === 'primary'
            ? 'flex h-[38px] w-[38px] items-center justify-center rounded-e-[8px] border border-[var(--border-color-th_primary)] bg-[var(--background-color-th_primary)] text-[var(--text-color-th_primary)] hover:brightness-95 active:translate-y-px disabled:pointer-events-none'
            : 'flex h-[38px] w-[38px] items-center justify-center rounded-e-[8px] border border-[var(--border-color-th_secondary)] bg-[var(--background-color-th_secondary)] text-[var(--text-color-th_secondary)] hover:brightness-95 active:translate-y-px disabled:pointer-events-none'
        }
        disabled={disabled}
        style={{
          borderLeftColor:
            variant === 'primary'
              ? 'color-mix(in srgb, var(--text-color-th_primary) 30%, transparent)'
              : 'color-mix(in srgb, var(--text-color-th_secondary) 30%, transparent)',
        }}
      >
        <LucideChevronDown className="size-4" />
      </Ariakit.PopoverDisclosure>
      <Ariakit.Popover
        className="z-50 flex flex-col gap-2 rounded-[var(--radius-th_medium)] border border-[var(--color-th_separator)] bg-[var(--background-color-th_base)] p-3 shadow-lg"
        gutter={8}
      >
        <div className="text-[12px] text-th_base-secondary">
          Using an external wallet
        </div>
        <div className="flex gap-2">
          {providers.map((provider) => (
            <Button
              key={provider.info.uuid}
              onClick={() => onSelect(provider.info.rdns)}
              title={`Connect with ${provider.info.name}`}
              variant="secondary"
              width="grow"
            >
              <img
                alt={provider.info.name}
                height={24}
                src={provider.info.icon}
                width={24}
              />
            </Button>
          ))}
        </div>
      </Ariakit.Popover>
    </Ariakit.PopoverProvider>
  )
}

export namespace ExternalWalletPopover {
  export type Props = {
    disabled?: boolean
    onSelect: (providerRdns: string) => void
    providers: Mipd.EIP6963ProviderDetail[]
    variant?: 'primary' | 'secondary'
  }
}
