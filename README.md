# taylr.sh

The documentation + marketing website for **[taylr](https://taylr.sh)** — a Swift CLI
from [BrightDigit](https://brightdigit.com) that scaffolds and upgrades Swift apps.

Built with [Astro](https://astro.build) + [Starlight](https://starlight.astro.build).
This repo is the **website only**; taylr's source code (and its DocC API reference)
live in [brightdigit/taylr](https://github.com/brightdigit/taylr), which also tracks the
work in [milestones and issues](https://github.com/brightdigit/taylr/milestones).

## Develop

This project uses [mise](https://mise.jdx.dev) to manage the Node version **and** run
tasks (defined in `mise.toml`; there are no `package.json` scripts).

```sh
mise install       # install the pinned Node version (first time only)
mise run install   # install dependencies
mise run dev       # http://localhost:4321
```

## Build

```sh
mise run build     # → dist/
mise run preview   # serve the production build
mise run check     # type + content validation
```

## Structure

| Path | What |
| --- | --- |
| `src/pages/index.astro` | Marketing landing page (`/`) |
| `src/content/docs/docs/**` | Documentation (`/docs/**`), authored in Markdown |
| `astro.config.mjs` | Astro + Starlight config, including the docs sidebar |
| `public/api/` | DocC API reference — placeholder for now (see below) |
| `.github/workflows/deploy.yml` | Build + deploy to GitHub Pages |

## API reference (DocC)

The DocC API reference is generated from taylr's **source** repo, not here. The
`/api/` route currently serves a placeholder; the real archive is injected into
`dist/api/` at deploy time. The injection step is stubbed in the deploy workflow —
see [`AGENTS.md`](./AGENTS.md) for details.

## Deploy

Pushes to `main` build and publish to GitHub Pages at the apex domain `taylr.sh`.

## License

[MIT](./LICENSE) © BrightDigit
