/**
 * Example usage of the Modal Context
 *
 * This file demonstrates how to use the modal context to programmatically
 * open and manage modals from anywhere in your application.
 */

import { Button } from '@porto/apps/components'
import { useModal } from './ModalContext'

// Example 1: Basic modal with title and description
export function BasicModalExample() {
  const { openModal } = useModal()

  const handleOpenModal = () => {
    openModal({
      content: (
        <div>
          <p className="text-gray11">
            This is the modal content. You can put any React component here.
          </p>
        </div>
      ),
      description: 'This is a basic modal example',
      title: 'Welcome',
    })
  }

  return <Button onClick={handleOpenModal}>Open Basic Modal</Button>
}

// Example 2: Modal with custom ID and close handler
export function CustomModalExample() {
  const { openModal, closeModal } = useModal()

  const handleOpenModal = () => {
    openModal({
      content: (
        <div>
          <p className="mb-4 text-gray11">This modal has a custom ID</p>
          <Button onClick={() => closeModal('custom-modal')}>
            Close This Modal
          </Button>
        </div>
      ),
      id: 'custom-modal',
      onClose: () => {
        console.log('Modal closed!')
      },
      title: 'Custom Modal',
    })
  }

  return <Button onClick={handleOpenModal}>Open Custom Modal</Button>
}

// Example 3: Modal without close button and custom styling
export function NoCloseButtonExample() {
  const { openModal, closeModal } = useModal()

  const handleOpenModal = () => {
    const modalId = openModal({
      className: 'max-w-sm',
      closeOnOverlayClick: false,
      content: (
        <div className="flex gap-2">
          <Button
            onClick={() => {
              // Perform action
              console.log('Confirmed!')
              closeModal(modalId)
            }}
            variant="primary"
          >
            Confirm
          </Button>
          <Button onClick={() => closeModal(modalId)} variant="ghost">
            Cancel
          </Button>
        </div>
      ),
      description: 'Are you sure you want to proceed?',
      showCloseButton: false,
      title: 'Confirm Action',
    })
  }

  return <Button onClick={handleOpenModal}>Open Confirmation Modal</Button>
}

// Example 4: Nested modal content with form
export function FormModalExample() {
  const { openModal, closeModal } = useModal()

  const handleOpenModal = () => {
    const modalId = openModal({
      content: (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            const formData = new FormData(e.currentTarget)
            console.log('Form submitted:', Object.fromEntries(formData))
            closeModal(modalId)
          }}
        >
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-gray11 text-sm" htmlFor="name">
                Name
              </label>
              <input
                className="w-full rounded border border-gray6 bg-gray1 px-3 py-2 text-gray12"
                id="name"
                name="name"
                required
                type="text"
              />
            </div>
            <div>
              <label className="mb-1 block text-gray11 text-sm" htmlFor="email">
                Email
              </label>
              <input
                className="w-full rounded border border-gray6 bg-gray1 px-3 py-2 text-gray12"
                id="email"
                name="email"
                required
                type="email"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" variant="primary">
                Submit
              </Button>
              <Button
                onClick={() => closeModal(modalId)}
                type="button"
                variant="ghost"
              >
                Cancel
              </Button>
            </div>
          </div>
        </form>
      ),
      description: 'Please fill in the details below',
      title: 'Submit Form',
    })
  }

  return <Button onClick={handleOpenModal}>Open Form Modal</Button>
}

// Example 5: Update modal content dynamically
export function DynamicModalExample() {
  const { openModal, updateModal, closeModal } = useModal()

  const handleOpenModal = () => {
    let step = 1

    const modalId = openModal({
      content: (
        <div>
          <p className="mb-4 text-gray11">This is step {step}</p>
          <Button
            onClick={() => {
              step++
              if (step > 3) {
                closeModal(modalId)
              } else {
                updateModal(modalId, {
                  content: (
                    <div>
                      <p className="mb-4 text-gray11">This is step {step}</p>
                      <Button onClick={() => handleNext()}>Next</Button>
                    </div>
                  ),
                  title: `Step ${step} of 3`,
                })
              }
            }}
          >
            Next
          </Button>
        </div>
      ),
      title: `Step ${step} of 3`,
    })

    const handleNext = () => {
      step++
      if (step > 3) {
        closeModal(modalId)
      } else {
        updateModal(modalId, {
          content: (
            <div>
              <p className="mb-4 text-gray11">This is step {step}</p>
              <Button onClick={() => handleNext()}>
                {step === 3 ? 'Finish' : 'Next'}
              </Button>
            </div>
          ),
          title: `Step ${step} of 3`,
        })
      }
    }
  }

  return <Button onClick={handleOpenModal}>Open Multi-Step Modal</Button>
}

// Example 6: Close all modals at once
export function MultipleModalsExample() {
  const { openModal, closeAllModals } = useModal()

  const handleOpenMultipleModals = () => {
    openModal({
      content: <p>This is the first modal</p>,
      title: 'Modal 1',
    })

    setTimeout(() => {
      openModal({
        content: <p>This is the second modal</p>,
        title: 'Modal 2',
      })
    }, 500)

    setTimeout(() => {
      openModal({
        content: (
          <div>
            <p className="mb-4">This is the third modal</p>
            <Button onClick={closeAllModals}>Close All Modals</Button>
          </div>
        ),
        title: 'Modal 3',
      })
    }, 1000)
  }

  return (
    <Button onClick={handleOpenMultipleModals}>Open Multiple Modals</Button>
  )
}
