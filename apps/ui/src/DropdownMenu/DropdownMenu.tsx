import type { ReactNode } from 'react'
import { createContext, useContext, useState } from 'react'
import { css, cva, cx } from 'styled-system/css'
import LucideChevronDown from '~icons/lucide/chevron-down'
import { Frame } from '../Frame/Frame.js'

const DropdownMenuContext = createContext<{
  isOpen: boolean
  setIsOpen: (open: boolean) => void
} | null>(null)

function useDropdownMenuContext() {
  const context = useContext(DropdownMenuContext)
  if (!context) {
    throw new Error(
      'DropdownMenu components must be used within a DropdownMenu',
    )
  }
  return context
}

export function DropdownMenu({
  children,
  defaultOpen = false,
}: DropdownMenu.RootProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <DropdownMenuContext.Provider value={{ isOpen, setIsOpen }}>
      <div className={css({ position: 'relative' })}>{children}</div>
    </DropdownMenuContext.Provider>
  )
}

export namespace DropdownMenu {
  export interface RootProps {
    children: ReactNode
    defaultOpen?: boolean
  }

  export type Size = 'small' | 'medium' | 'large'

  export interface TriggerProps {
    children?: ReactNode
    className?: string
    disabled?: boolean
    placeholder?: string
    size?: Size | Record<Frame.ModeName, Size>
    showChevron?: boolean
  }

  export interface ContentProps {
    align?: 'start' | 'center' | 'end'
    children: ReactNode
    className?: string
  }

  export interface ItemProps {
    children: ReactNode
    className?: string
    disabled?: boolean
    onClick?: () => void
  }

  export function useResolvedSize(
    size?: Size | Record<Frame.ModeName, Size>,
  ): Size {
    const frame = Frame.useFrame(true)
    const resolvedSize = size ?? { dialog: 'medium', full: 'large' }
    return typeof resolvedSize === 'string'
      ? resolvedSize
      : (frame && resolvedSize[frame.mode]) || 'medium'
  }

  export function Trigger({
    children,
    className,
    disabled,
    placeholder,
    showChevron = true,
    size,
  }: TriggerProps) {
    const { isOpen, setIsOpen } = useDropdownMenuContext()
    const resolvedSize = useResolvedSize(size)

    return (
      <button
        aria-expanded={isOpen}
        aria-haspopup="true"
        className={cx(
          css({
            _active: {
              transform: 'translateY(1px)',
            },
            _disabled: {
              pointerEvents: 'none',
            },
            _focusVisible: {
              outline: '2px solid var(--color-th_focus)',
              outlineOffset: -1,
            },
            alignItems: 'center',
            backgroundColor: 'var(--background-color-th_field)',
            border: '1px solid var(--border-color-th_field)',
            borderRadius: 'var(--radius-th_medium)',
            color: 'var(--text-color-th_field)',
            cursor: 'pointer!',
            display: 'flex',
            justifyContent: 'space-between',
            position: 'relative',
            width: '100%',
          }),
          cva({
            variants: {
              size: {
                large: {
                  borderRadius: 21,
                  fontSize: 16,
                  height: 42,
                  paddingInline: 20,
                },
                medium: {
                  borderRadius: 8,
                  fontSize: 15,
                  height: 38,
                  paddingInline: 16,
                },
                small: {
                  borderRadius: 6,
                  fontSize: 13,
                  height: 28,
                  paddingInline: 8,
                },
              },
            },
          })({ size: resolvedSize }),
          disabled &&
          css({
            backgroundColor: 'var(--background-color-th_disabled)',
            borderColor: 'var(--border-color-th_disabled)',
            color: 'var(--text-color-th_disabled)',
          }),
          className,
        )}
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <span
          className={css({
            flex: 1,
            overflow: 'hidden',
            textAlign: 'left',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          })}
        >
          {children || (
            <span
              className={css({ color: 'var(--text-color-th_field-tertiary)' })}
            >
              {placeholder ?? 'Select an option'}
            </span>
          )}
        </span>
        {showChevron && (
          <LucideChevronDown
            className={cx(
              css({
                flex: '0 0 auto',
                marginLeft: 8,
                transition: '0.2s transform',
              }),
              isOpen && css({ transform: 'rotate(180deg)' }),
            )}
            style={{ height: 16, width: 16 }}
          />
        )}
      </button>
    )
  }

  export function Content({
    align = 'start',
    children,
    className,
  }: ContentProps) {
    const { isOpen, setIsOpen } = useDropdownMenuContext()

    if (!isOpen) return null

    // Close dropdown when clicking outside
    const handleBackdropClick = () => {
      setIsOpen(false)
    }

    return (
      <>
        <button
          aria-label="Close dropdown menu"
          className={css({
            background: 'transparent',
            border: 'none',
            cursor: 'default',
            inset: 0,
            padding: 0,
            position: 'fixed',
            zIndex: 40,
          })}
          onClick={handleBackdropClick}
          type="button"
        />
        <div
          className={cx(
            css({
              backgroundColor: 'var(--background-color-th_field)',
              border: '1px solid var(--border-color-th_field)',
              borderRadius: 'var(--radius-th_medium)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              marginTop: 4,
              maxHeight: 240,
              minWidth: 160,
              overflowY: 'auto',
              paddingBlock: 4,
              position: 'absolute',
              top: '100%',
              zIndex: 50,
            }),
            align === 'start' && css({ left: 0 }),
            align === 'center' &&
            css({ left: '50%', transform: 'translateX(-50%)' }),
            align === 'end' && css({ right: 0 }),
            className,
          )}
        >
          {children}
        </div>
      </>
    )
  }

  export function Item({ children, className, disabled, onClick }: ItemProps) {
    const { setIsOpen } = useDropdownMenuContext()

    const handleClick = () => {
      if (disabled) return
      onClick?.()
      setIsOpen(false)
    }

    return (
      <button
        className={cx(
          css({
            _active: {
              transform: 'translateY(1px)',
            },
            _disabled: {
              color: 'var(--text-color-th_disabled)',
              pointerEvents: 'none',
            },
            _focusVisible: {
              backgroundColor: 'var(--background-color-th_base-hovered)',
              outline: 'none',
            },
            _hover: {
              backgroundColor: 'var(--background-color-th_base-hovered)',
            },
            alignItems: 'center',
            background: 'transparent',
            color: 'var(--text-color-th_field)',
            cursor: 'pointer!',
            display: 'flex',
            fontSize: 15,
            paddingBlock: 8,
            paddingInline: 12,
            textAlign: 'left',
            transition: 'background-color 0.15s',
            width: '100%',
          }),
          className,
        )}
        disabled={disabled}
        onClick={handleClick}
        type="button"
      >
        {children}
      </button>
    )
  }

  export function Separator() {
    return (
      <div
        className={css({
          backgroundColor: 'var(--border-color-th_field)',
          height: 1,
          marginBlock: 4,
        })}
      />
    )
  }

  export function Label({ children }: { children: ReactNode }) {
    return (
      <div
        className={css({
          color: 'var(--text-color-th_field-secondary)',
          fontSize: 12,
          fontWeight: 600,
          paddingBlock: 4,
          paddingInline: 12,
          textTransform: 'uppercase',
        })}
      >
        {children}
      </div>
    )
  }
}
