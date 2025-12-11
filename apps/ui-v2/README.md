# @rise-wallet/ui-v2

Modern UI component library for rise-wallet built with shadcn/ui, Tailwind CSS v4, and React.

## Features

- **shadcn/ui Components**: Pre-built, accessible components
- **Tailwind CSS v4**: Latest CSS framework with modern features
- **TypeScript**: Full type safety
- **Tree-shakeable**: Import only what you need

## Components

- **Button**: Versatile button component with multiple variants
- **Card**: Container component for content
- **Dialog**: Modal dialog component
- **Dropdown Menu**: Customizable dropdown menu

## Installation

```bash
pnpm install @rise-wallet/ui-v2
```

## Usage

```tsx
import { Button, Card, Dialog, DropdownMenu } from '@rise-wallet/ui-v2'
import '@rise-wallet/ui-v2/styles.css'

function App() {
  return (
    <Card>
      <Button variant="default">Click me</Button>
    </Card>
  )
}
```

## Development

```bash
# Build the library
pnpm build

# Watch mode for development
pnpm dev

# Type checking
pnpm check:types

# Linting and formatting
pnpm check
```

## License

Private - rise-wallet Rise
