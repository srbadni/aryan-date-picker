# Aryan Date Picker Repository

This repository contains the source for [`aryan-date-picker`](https://www.npmjs.com/package/aryan-date-picker), a lightweight React date picker component library with Gregorian and Jalali calendar adapters.

## Workspace layout

```text
packages/date-picker  # publishable npm package
apps/playground       # local Vite + React development app
```

The package documentation that is published to npm lives in [`packages/date-picker/README.md`](packages/date-picker/README.md). Keep this root README focused on repository development and contribution workflows.

## Requirements

- Node.js 18 or newer
- pnpm 9 or newer

## Development

Install dependencies from the repository root:

```sh
pnpm install
```

Start the playground app:

```sh
pnpm dev
```

The playground imports the package source directly through Vite aliases so component changes are visible during local development.

## Workspace scripts

```sh
pnpm build              # build the publishable date-picker package
pnpm build:all          # build every workspace package/app
pnpm typecheck          # run TypeScript checks in every workspace
pnpm clean              # remove generated build output
pnpm pack:date-picker   # create a local package tarball for publish verification
```

## Publishing checklist

Before publishing `aryan-date-picker`:

1. Update `packages/date-picker/package.json` version.
2. Update package documentation in `packages/date-picker/README.md` if the public API changed.
3. Run `pnpm typecheck` and `pnpm build:all`.
4. Run `pnpm pack:date-picker` and inspect the tarball contents.
5. Publish from `packages/date-picker` or with an equivalent workspace-aware command.

## Contributing notes

- Keep public exports stable unless a breaking change is intentional and documented.
- Prefer small, reviewable changes.
- Keep runtime dependencies minimal; React and React DOM should remain peer dependencies for the package.
- Use `packages/date-picker/README.md` for user-facing npm package docs and this README for repository workflow docs.
