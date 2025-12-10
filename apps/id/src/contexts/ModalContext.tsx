import * as Ariakit from '@ariakit/react'
import { Button } from '@porto/apps/components'
import type React from 'react'
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'
import LucideX from '~icons/lucide/x'

export type ModalConfig = {
  id?: string
  title?: string
  description?: string
  content: React.ReactNode
  onClose?: () => void
  className?: string
  showCloseButton?: boolean
  closeOnOverlayClick?: boolean
  closePreviousModal?: boolean
}

type ModalContextValue = {
  openModal: (config: ModalConfig) => string
  closeModal: (id: string) => void
  closeAllModals: () => void
  updateModal: (id: string, config: Partial<ModalConfig>) => void
}

const ModalContext = createContext<ModalContextValue | undefined>(undefined)

export function useModal() {
  const context = useContext(ModalContext)
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider')
  }
  return context
}

type ModalState = ModalConfig & {
  id: string
  isOpen: boolean
}

export function ModalProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [modals, setModals] = useState<ModalState[]>([])

  const openModal = useCallback((config: ModalConfig) => {
    const id = config.id || `modal-${Date.now()}-${Math.random()}`
    setModals((prev) => {
      // Close previous modal(s) if flag is set
      const updatedModals = config.closePreviousModal ? [] : prev

      // Call onClose for closed modals if they exist
      if (config.closePreviousModal && prev.length > 0) {
        for (const modal of prev) {
          if (modal.onClose) {
            modal.onClose()
          }
        }
      }

      return [
        ...updatedModals,
        {
          ...config,
          closeOnOverlayClick: config.closeOnOverlayClick ?? true,
          id,
          isOpen: true,
          showCloseButton: config.showCloseButton ?? true,
        },
      ]
    })
    return id
  }, [])

  const closeModal = useCallback((id: string) => {
    setModals((prev) => {
      const modal = prev.find((m) => m.id === id)
      if (modal?.onClose) {
        modal.onClose()
      }
      return prev.filter((m) => m.id !== id)
    })
  }, [])

  const closeAllModals = useCallback(() => {
    setModals((prev) => {
      for (const modal of prev) {
        if (modal.onClose) {
          modal.onClose()
        }
      }
      return []
    })
  }, [])

  const updateModal = useCallback(
    (id: string, config: Partial<ModalConfig>) => {
      setModals((prev) =>
        prev.map((modal) =>
          modal.id === id ? { ...modal, ...config } : modal,
        ),
      )
    },
    [],
  )

  const value = useMemo(
    () => ({
      closeAllModals,
      closeModal,
      openModal,
      updateModal,
    }),
    [openModal, closeModal, closeAllModals, updateModal],
  )

  return (
    <ModalContext.Provider value={value}>
      {children}
      <ModalContainer modals={modals} onClose={closeModal} />
    </ModalContext.Provider>
  )
}

type ModalContainerProps = {
  modals: ModalState[]
  onClose: (id: string) => void
}

function ModalContainer({ modals, onClose }: Readonly<ModalContainerProps>) {
  return (
    <>
      {modals.map((modal) => (
        <Ariakit.Dialog
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          key={modal.id}
          onClose={() => {
            if (modal.closeOnOverlayClick) {
              onClose(modal.id)
            }
          }}
          open={modal.isOpen}
        >
          <div
            className={`w-full max-w-md rounded-lg border border-gray5 bg-th_base p-4 shadow-lg dark:bg-gray2 ${modal.className || ''}`}
          >
            {/* Modal Header */}
            {(modal.title || modal.showCloseButton) && (
              <div className="relative mb-4 flex justify-between">
                {modal.title && (
                  <div>
                    <h2 className="font-semibold text-gray12 text-xl">
                      {modal.title}
                    </h2>
                    {modal.description && (
                      <p className="mt-1 text-gray10 text-sm">
                        {modal.description}
                      </p>
                    )}
                  </div>
                )}
                {modal.showCloseButton && (
                  <Button
                    className="-top-2 -right-2 absolute"
                    onClick={() => {
                      onClose(modal.id)
                    }}
                    size="small"
                    type="button"
                    variant="ghost"
                  >
                    <LucideX className="size-5" />
                  </Button>
                )}
              </div>
            )}

            {/* Modal Content */}
            <div>{modal.content}</div>
          </div>
        </Ariakit.Dialog>
      ))}
    </>
  )
}
