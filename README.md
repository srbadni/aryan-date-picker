# Aryan Date Picker

Aryan Date Picker is a React date-picker package with Gregorian and Jalali calendar adapters. The package now targets real application forms rather than only inline calendar demos: popover fields, labels, helper/error copy, clear actions, min/max constraints, RTL behavior, and keyboard navigation are first-class.

This repository is a pnpm monorepo. The npm package documentation lives in [`packages/date-picker/README.md`](packages/date-picker/README.md).

## Repository structure

```text
packages/date-picker   Publishable React component package
apps/playground        Local Vite playground for manual development and demos
```

## Development

```sh
pnpm install
pnpm dev
```

The default development command starts the Vite playground and aliases `aryan-date-picker` to the package source.

## Workspace scripts

```sh
pnpm build             Build the publishable package
pnpm build:playground  Type-check and build the playground
pnpm typecheck         Type-check the package and playground
pnpm check             Type-check and build everything
pnpm clean             Remove generated dist folders
pnpm pack:package      Create the package tarball from packages/date-picker
```

## Package publishing notes

The publishable package is `packages/date-picker`. Its `package.json` owns the npm-facing metadata, export map, published file list, peer dependencies, and package README.

Before publishing, run:

```sh
pnpm install
pnpm check
pnpm pack:package
```

## Current product direction

The library should be sold as a small, adapter-driven date input system for booking, scheduling, dashboards, and Persian-language forms. Inline calendars are still supported with `displayMode="inline"`, but the default is now a field + popover experience because that is what most product teams expect from a date-picker package.

Keep public imports stable through the package root:

```tsx
import { DatePicker, DateRangePicker } from 'aryan-date-picker';
import 'aryan-date-picker/styles.css';
```

Avoid moving or renaming exported components, adapter factories, or public types without a deliberate breaking-change release.
