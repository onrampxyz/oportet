import { Button, DropdownMenu } from '@porto/ui'
import type * as React from 'react'
import { css } from 'styled-system/css'

export function DropdownSelector<T extends { label: string }>(
  props: DropdownSelector.Props<T>,
) {
  const {
    items,
    selectedItem,
    onSelect,
    onContinue,
    renderItem,
    continueButtonLabel = 'Continue',
    continueButtonDisabled,
    className,
    placeholder = 'Select an option',
  } = props

  const handleSelect = (item: T, index: number) => {
    onSelect(item, index)
  }

  return (
    <div
      className={
        className ?? css({ display: 'flex', flexDirection: 'column', gap: 12 })
      }
    >
      <DropdownMenu>
        <DropdownMenu.Trigger placeholder={placeholder}>
          {selectedItem
            ? renderItem
              ? renderItem(selectedItem, true)
              : selectedItem.label
            : null}
        </DropdownMenu.Trigger>

        <DropdownMenu.Content align="start">
          {items.map((item, index) => {
            const isSelected = selectedItem?.label === item.label
            return (
              <DropdownMenu.Item
                className={
                  isSelected
                    ? css({
                        backgroundColor: 'var(--background-color-th_primary)!',
                        color: 'var(--text-color-th_primary)!',
                      })
                    : undefined
                }
                key={item.label}
                onClick={() => handleSelect(item, index)}
              >
                {renderItem ? renderItem(item, isSelected) : item.label}
              </DropdownMenu.Item>
            )
          })}
        </DropdownMenu.Content>
      </DropdownMenu>

      {onContinue && (
        <Button
          disabled={continueButtonDisabled ?? !selectedItem}
          onClick={() => {
            if (selectedItem) {
              onContinue(selectedItem)
            }
          }}
          variant="primary"
          width="full"
        >
          {continueButtonLabel}
        </Button>
      )}
    </div>
  )
}

export declare namespace DropdownSelector {
  export type Props<T extends { label: string }> = {
    /** Array of items to display in the dropdown */
    items: T[]
    /** Currently selected item */
    selectedItem?: T | undefined
    /** Callback when an item is selected */
    onSelect: (item: T, index: number) => void
    /** Optional callback when continue button is clicked */
    onContinue?: ((item: T) => void) | undefined
    /** Optional custom render function for items */
    renderItem?: ((item: T, isSelected: boolean) => React.ReactNode) | undefined
    /** Label for the continue button */
    continueButtonLabel?: string | undefined
    /** Disable the continue button */
    continueButtonDisabled?: boolean | undefined
    /** Optional className for the container */
    className?: string | undefined
    /** Placeholder text when no item is selected */
    placeholder?: string | undefined
  }
}
