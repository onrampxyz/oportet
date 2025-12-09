# Modal Context

A flexible and powerful modal management system for the Porto ID application. The modal context allows programmatic control of modals from anywhere in the application using React Context.

## Features

- **Programmatic Modal Control**: Open, close, and update modals from anywhere in the application
- **Multiple Modals**: Support for multiple simultaneous modals with proper z-index stacking
- **Customizable**: Configure titles, descriptions, close buttons, overlay behavior, and custom styling
- **TypeScript Support**: Fully typed API for better developer experience
- **Ariakit Integration**: Built on top of Ariakit for accessibility and best practices
- **Flexible Content**: Support for any React component as modal content

## Installation

The modal context is already integrated into the application through [App.tsx](../App.tsx).

## Usage

### Basic Usage

```tsx
import { useModal } from '~/contexts/ModalContext'

function MyComponent() {
  const { openModal } = useModal()

  const handleClick = () => {
    openModal({
      title: 'Welcome',
      description: 'This is a modal',
      content: <div>Modal content goes here</div>,
    })
  }

  return <button onClick={handleClick}>Open Modal</button>
}
```

### API Reference

#### `useModal()`

Returns an object with the following methods:

##### `openModal(config: ModalConfig): string`

Opens a modal and returns its unique ID.

**ModalConfig Properties:**

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `id` | `string` | auto-generated | Optional custom ID for the modal |
| `title` | `string` | `undefined` | Modal title |
| `description` | `string` | `undefined` | Modal description (shown below title) |
| `content` | `React.ReactNode` | required | The content to display in the modal |
| `onClose` | `() => void` | `undefined` | Callback fired when modal closes |
| `className` | `string` | `undefined` | Additional CSS classes for modal container |
| `showCloseButton` | `boolean` | `true` | Whether to show the close button |
| `closeOnOverlayClick` | `boolean` | `true` | Whether clicking overlay closes the modal |

##### `closeModal(id: string): void`

Closes a specific modal by its ID.

##### `closeAllModals(): void`

Closes all open modals.

##### `updateModal(id: string, config: Partial<ModalConfig>): void`

Updates the configuration of an open modal.

## Examples

### Simple Confirmation Modal

```tsx
import { useModal } from '~/contexts/ModalContext'
import { Button } from '@porto/apps/components'

function DeleteButton() {
  const { openModal, closeModal } = useModal()

  const handleDelete = () => {
    const modalId = openModal({
      title: 'Confirm Delete',
      description: 'Are you sure you want to delete this item?',
      showCloseButton: false,
      closeOnOverlayClick: false,
      content: (
        <div className="flex gap-2">
          <Button
            onClick={() => {
              // Perform delete action
              closeModal(modalId)
            }}
            variant="danger"
          >
            Delete
          </Button>
          <Button onClick={() => closeModal(modalId)} variant="secondary">
            Cancel
          </Button>
        </div>
      ),
    })
  }

  return <Button onClick={handleDelete}>Delete Item</Button>
}
```

### Form Modal

```tsx
import { useModal } from '~/contexts/ModalContext'
import { Button } from '@porto/apps/components'

function AddUserButton() {
  const { openModal, closeModal } = useModal()

  const handleAddUser = () => {
    const modalId = openModal({
      title: 'Add New User',
      content: (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            // Handle form submission
            closeModal(modalId)
          }}
        >
          <div className="space-y-4">
            <input
              className="w-full rounded border px-3 py-2"
              name="name"
              placeholder="Name"
              type="text"
            />
            <input
              className="w-full rounded border px-3 py-2"
              name="email"
              placeholder="Email"
              type="email"
            />
            <Button type="submit">Add User</Button>
          </div>
        </form>
      ),
    })
  }

  return <Button onClick={handleAddUser}>Add User</Button>
}
```

### Multi-Step Modal

```tsx
import { useModal } from '~/contexts/ModalContext'
import { Button } from '@porto/apps/components'

function WizardButton() {
  const { openModal, updateModal, closeModal } = useModal()

  const handleStartWizard = () => {
    let currentStep = 1
    const totalSteps = 3

    const modalId = openModal({
      title: `Step ${currentStep} of ${totalSteps}`,
      content: renderStep(currentStep),
    })

    const nextStep = () => {
      currentStep++
      if (currentStep > totalSteps) {
        closeModal(modalId)
      } else {
        updateModal(modalId, {
          title: `Step ${currentStep} of ${totalSteps}`,
          content: renderStep(currentStep),
        })
      }
    }

    const renderStep = (step: number) => (
      <div>
        <p>Step {step} content</p>
        <Button onClick={nextStep}>
          {step === totalSteps ? 'Finish' : 'Next'}
        </Button>
      </div>
    )
  }

  return <Button onClick={handleStartWizard}>Start Wizard</Button>
}
```

### Custom Styled Modal

```tsx
import { useModal } from '~/contexts/ModalContext'

function CustomStyledModal() {
  const { openModal } = useModal()

  const handleOpen = () => {
    openModal({
      title: 'Custom Styled Modal',
      className: 'max-w-2xl bg-gradient-to-br from-purple-50 to-blue-50',
      content: (
        <div className="p-4">
          <p>This modal has custom styling applied</p>
        </div>
      ),
    })
  }

  return <button onClick={handleOpen}>Open Custom Modal</button>
}
```

## Best Practices

1. **Always store the modal ID** if you need to close or update it programmatically
2. **Use `closeOnOverlayClick: false`** for critical actions that require explicit user confirmation
3. **Provide an `onClose` callback** when you need to perform cleanup or state updates when the modal closes
4. **Use descriptive titles and descriptions** to make the modal purpose clear to users
5. **Keep modal content focused** - modals should have a single, clear purpose
6. **Consider accessibility** - the modal already handles focus management through Ariakit

## Advanced Usage

### Conditional Modal Content

```tsx
const { openModal, updateModal } = useModal()

const modalId = openModal({
  title: 'Loading...',
  content: <div>Please wait...</div>,
})

// Later, after async operation
fetchData().then((data) => {
  updateModal(modalId, {
    title: 'Success',
    content: <div>Data loaded: {data}</div>,
  })
})
```

### Modal with Custom Hook Integration

```tsx
function useConfirm() {
  const { openModal, closeModal } = useModal()

  const confirm = (message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const modalId = openModal({
        title: 'Confirm',
        description: message,
        showCloseButton: false,
        closeOnOverlayClick: false,
        content: (
          <div className="flex gap-2">
            <Button
              onClick={() => {
                closeModal(modalId)
                resolve(true)
              }}
            >
              Confirm
            </Button>
            <Button
              onClick={() => {
                closeModal(modalId)
                resolve(false)
              }}
            >
              Cancel
            </Button>
          </div>
        ),
      })
    })
  }

  return { confirm }
}

// Usage
function MyComponent() {
  const { confirm } = useConfirm()

  const handleDelete = async () => {
    const confirmed = await confirm('Are you sure?')
    if (confirmed) {
      // Perform delete
    }
  }

  return <button onClick={handleDelete}>Delete</button>
}
```

## Migration from GenericModal

If you're migrating from the existing `GenericModal` component:

**Before:**
```tsx
<GenericModal
  title="My Modal"
  description="Modal description"
  triggerLabel="Open"
>
  <div>Content</div>
</GenericModal>
```

**After:**
```tsx
const { openModal } = useModal()

<Button
  onClick={() =>
    openModal({
      title: 'My Modal',
      description: 'Modal description',
      content: <div>Content</div>,
    })
  }
>
  Open
</Button>
```

## Troubleshooting

### Modal not appearing

- Ensure `ModalProvider` is wrapping your component tree (it's already in [App.tsx](../App.tsx))
- Check that you're calling `openModal` correctly
- Verify there are no z-index conflicts with other UI elements

### Modal closes unexpectedly

- Set `closeOnOverlayClick: false` if you don't want overlay clicks to close the modal
- Check if there are conflicting close handlers

### TypeScript errors

- Ensure you're importing types correctly: `import type { ModalConfig } from '~/contexts/ModalContext'`
- The `content` property requires a React node - use JSX or `createElement`

## See Also

- [ModalContext.example.tsx](./ModalContext.example.tsx) - Complete examples
- [GenericModal.tsx](../routes/-components/GenericModal.tsx) - Original modal component (still available for backward compatibility)
