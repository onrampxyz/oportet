import * as Ariakit from '@ariakit/react'
import { Button } from '@porto/apps/components'
import { useState } from 'react'
import LucideX from '~icons/lucide/x'

export type GenericModalProps = {
  title?: string
  description?: string
  triggerLabel: string | React.ReactNode
  children: React.ReactNode
}

export function GenericModal(props: Readonly<GenericModalProps>) {
  const { title, description, triggerLabel, children } = props

  const [open, setOpen] = useState(false)

  return (
    <div>
      {typeof triggerLabel === 'string' ? (
        <Button
          onClick={() => {
            setOpen(true)
          }}
          type="button"
        >
          {triggerLabel}
        </Button>
      ) : (
        triggerLabel
      )}

      <Ariakit.Dialog
        className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'
        onClose={() => setOpen(false)}
        open={open}
      >
        <div className="w-full max-w-md rounded-lg border border-gray5 bg-white p-6 shadow-lg dark:bg-gray2">
          {/* Modal Header */}
          <div className="relative mb-4 flex justify-between">
            {title && (
              <div>
                <h2 className="font-semibold text-gray12 text-xl">{title}</h2>
                <p className="mt-1 text-gray10 text-sm">{description}</p>
              </div>
            )}
            <Button
              className="-top-2 -right-2 absolute"
              onClick={() => {
                setOpen(false)
              }}
              size="small"
              type="button"
              variant="ghost"
            >
              <LucideX className="size-5" />
            </Button>
          </div>

          {children}
        </div>
      </Ariakit.Dialog>
    </div>
  )
}
