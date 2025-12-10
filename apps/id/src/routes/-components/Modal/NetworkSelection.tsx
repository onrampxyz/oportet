import { Button } from '@porto/apps/components'
import { useState } from 'react'
import { useModal } from '~/contexts/ModalContext'
import AssetSelection from './AssetSelection'

export const SupportedChain = [
  { label: 'Ethereum', logo: '' },
  { label: 'Base Sepolia', logo: '' },
  { label: 'RISE', logo: '' },
]

export default function NetworkSelection() {
  const [selectedChain, setSelectedChain] = useState('')
  const { openModal } = useModal()

  return (
    <div className="space-y-2">
      {SupportedChain.map((chain) => {
        return (
          <Button
            // TODO: Fix why variant outline bg does not take effect
            className="flex w-full items-center justify-start rounded-lg"
            data-selected={selectedChain === chain.label}
            key={chain.label}
            onClick={() => {
              setSelectedChain(chain.label)
            }}
            type="button"
            variant="outline"
          >
            {/* {chain.logo} */}
            {chain.label}
          </Button>
        )
      })}
      <Button
        className="flex w-full items-center rounded-lg"
        onClick={() => {
          openModal({
            closePreviousModal: true,
            content: <AssetSelection chain={selectedChain} />,
            description: 'Choose an Asset',
            title: 'Select Token to be deposited to RISE',
          })
        }}
        type="button"
        variant="primary"
      >
        Continue
      </Button>
    </div>
  )
}
