import { Button, DropdownMenu } from "@porto/ui";
import type * as React from "react";
import { css } from "styled-system/css";

export function DropdownSelector<T extends { name: string; icon?: string }>(
  props: DropdownSelector.Props<T>,
) {
  const {
    items,
    selectedItem,
    onSelect,
    onContinue,
    renderItem,
    continueButtonLabel = "Continue",
    continueButtonDisabled,
    className,
    placeholder = "Select an option",
  } = props;

  const handleSelect = (item: T, index: number) => {
    onSelect(item, index);
  };

  return (
    <div
      className={
        className ?? css({ display: "flex", flexDirection: "column", gap: 12 })
      }
    >
      <DropdownMenu>
        <DropdownMenu.Trigger placeholder={placeholder}>
          {selectedItem ? (
            renderItem ? (
              renderItem(selectedItem, true)
            ) : (
              <span
                className={css({
                  alignItems: "center",
                  display: "flex",
                  gap: 8,
                })}
              >
                {selectedItem.icon && (
                  <img
                    alt=""
                    className={css({ height: 20, width: 20 })}
                    src={selectedItem.icon}
                  />
                )}
                {selectedItem.name}
              </span>
            )
          ) : null}
        </DropdownMenu.Trigger>

        <DropdownMenu.Content
          align="start"
          className="w-full p-2! transition-all"
        >
          {items.map((item, index) => {
            const isSelected = selectedItem?.name === item.name;

            return (
              <div key={item.name}>
                <DropdownMenu.Item
                  className={`rounded! ${isSelected ? "bg-th_base-alt!" : ""}`}
                  onClick={() => handleSelect(item, index)}
                >
                  {renderItem ? (
                    renderItem(item, isSelected)
                  ) : (
                    <span
                      className={css({
                        alignItems: "center",
                        display: "flex",
                        gap: 8,
                      })}
                    >
                      {item.icon && (
                        <img
                          alt=""
                          className={css({
                            height: 20,
                            width: 20,
                          })}
                          src={item.icon}
                        />
                      )}
                      {item.name}
                    </span>
                  )}
                </DropdownMenu.Item>
                {items.length - 1 !== index && <DropdownMenu.Separator />}
              </div>
            );
          })}
        </DropdownMenu.Content>
      </DropdownMenu>

      {onContinue && (
        <Button
          disabled={continueButtonDisabled ?? !selectedItem}
          onClick={() => {
            if (selectedItem) {
              onContinue(selectedItem);
            }
          }}
          variant="primary"
          width="full"
        >
          {continueButtonLabel}
        </Button>
      )}
    </div>
  );
}

export declare namespace DropdownSelector {
  export type Props<T extends { name: string; icon?: string }> = {
    /** Array of items to display in the dropdown */
    items: T[];
    /** Currently selected item */
    selectedItem?: T | undefined;
    /** Callback when an item is selected */
    onSelect: (item: T, index: number) => void;
    /** Optional callback when continue button is clicked */
    onContinue?: ((item: T) => void) | undefined;
    /** Optional custom render function for items */
    renderItem?:
    | ((item: T, isSelected: boolean) => React.ReactNode)
    | undefined
    | ((item: T, isSelected: boolean) => React.ReactNode);
    continueButtonLabel?: string | undefined;
    /** Disable the continue button */
    continueButtonDisabled?: boolean | undefined;
    /** Optional className for the container */
    className?: string | undefined;
    /** Placeholder text when no item is selected */
    placeholder?: string | undefined;
  };
}
