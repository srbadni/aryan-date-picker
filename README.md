# Aryan Date Picker

A lightweight React date picker component library.

## Installation

```sh
pnpm add aryan-date-picker
```

## Usage

```tsx
import { DatePicker } from 'aryan-date-picker';
import 'aryan-date-picker/styles.css';

export function App() {
  return <DatePicker />;
}
```

## Workspace

This repository is a minimal pnpm workspace:

- `packages/date-picker` contains the publishable library.
- `playground` contains a local Vite + React + TypeScript development app.

## Development

```sh
pnpm install
pnpm dev
```

## Build

```sh
pnpm build
```
