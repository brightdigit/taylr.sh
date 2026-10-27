# AGENTS.md

Guidance for coding agents (and humans) working in this repository. `CLAUDE.md` is a
symlink to this file, so Claude Code reads it too.

**Read [`.agents/agent-notes.md`](.agents/agent-notes.md) at the start of work** — it is a
running log of the user's corrections and standing "always/never" directives. Append a new
line to it for every such correction.

**Every memory is persisted into this repo**, not only into the private auto-memory store.
Each memory is written to `MEMORY.md` *and* to either this `AGENTS.md` or a file under
`.agents/`, routed by how quickly the fact must be read at launch: urgent/broad facts go in
`AGENTS.md` (always loaded); lower-urgency ones go in a `.agents/` file. (`.agents/` does not
mean `agent-notes.md` specifically — that file is only the corrections log.) Agent files live
in `.agents/` so they're tool-agnostic; `.claude/` only holds symlinks into it.

## What this is

This repo is **`taylr.sh`** — the documentation + marketing website for **taylr**, a
Swift CLI from BrightDigit that scaffolds and upgrades Swift apps. The site is
documentation-first: a marketing landing page, full CLI usage docs, and (later) a DocC
API reference.

taylr scaffolds apps **from [Swift-App-Template](https://github.com/brightdigit/Swift-App-Template)**
— that template is the source project the CLI generates and upgrades apps against.
The tool's phased direction and the caveats around it are tracked in
[Swift-App-Template#124](https://github.com/brightdigit/Swift-App-Template/issues/124)
(ADR-0001 roadmap: ScaffoldKit → AI Plugin & Marketplace → the CLI). Note that the
issue refers to the CLI as `sat`, which is a **placeholder name** (see #119) — the tool
is **taylr**. Keep the docs here aligned with that end-state, not the placeholder.

This repo is the **website only**. taylr's source code lives in a separate repository
(the DocC API reference is generated there — see "DocC seam" below).

## Conventions

Rules for this repo. Please follow them rather than reintroducing more common patterns.

- **Task runner is [mise](https://mise.jdx.dev), not npm scripts.** Commands are defined
  as `[tasks.<name>]` in `mise.toml` and run with `mise run <name>`. **Do not add a
  `scripts` block to `package.json`, and do not add a `Makefile`** — mise is the single
  task runner (it already manages Node, so there is no second tool to introduce).
- Add a new command by adding a `[tasks.<name>]` entry to `mise.toml`.
- Locally-installed CLIs (`astro`, …) are put on `PATH` for tasks via
  `[env] _.path = ["./node_modules/.bin"]` in `mise.toml`. Keep that entry — without it,
  raw shell tasks fail with `astro: command not found`.
- The Node version is pinned in `mise.toml`; CI uses the same file via `jdx/mise-action`
  so local and CI match. Bump the version in one place.

## Stack

- **[Astro](https://astro.build)** — the meta-framework. The marketing landing at `/`
  is a plain Astro page (`src/pages/index.astro`).
- **[Starlight](https://starlight.astro.build)** — Astro's docs framework. All docs
  live under `/docs/**` and are authored as Markdown in `src/content/docs/docs/`.
- **[Tailwind CSS v4](https://tailwindcss.com)** — via `@tailwindcss/vite` +
  `@astrojs/starlight-tailwind`, used for the landing page. Starlight keeps its own
  theme; brand tokens are in `src/styles/theme.css`.

## Node / toolchain

This project uses **[mise](https://mise.jdx.dev)** to both manage Node and run tasks
(see [Conventions](#conventions)). Run `mise install` once to get the pinned Node
version, then use the tasks below.

## Commands

```sh
mise install       # install the pinned Node version (first time only)
mise run install   # install npm dependencies (or just `npm install`)
mise run dev       # local dev server with hot reload
mise run build     # production build → dist/
mise run preview   # serve the production build locally
mise run check     # astro check (type + content validation)
mise run check-links  # fail on internal links that don't resolve in dist/ (after build)
mise run lighthouse   # Lighthouse CI against dist/ (after build; lighthouserc.json)
mise run vendor    # check out the template reference into vendor/ (dev only)
```

Tasks live in `mise.toml`. Add a new command by adding a `[tasks.<name>]` entry there,
not by adding a `package.json` script.

## Layout

```
src/
├─ pages/index.astro          Minimal landing (owns "/"): logo, one-liner, links
├─ layouts/Landing.astro      Standalone layout for the landing (its own <head>)
├─ content/docs/docs/**       Starlight docs (URLs are /docs/**)
├─ styles/theme.css           taylr brand tokens (light + dark)
├─ styles/tailwind.css        Tailwind + starlight-tailwind entry
└─ assets/taylr-logo.svg      The logo: one SVG, variants a–f via #taylr-a… (default d)
public/
├─ api/index.html             DocC placeholder (see below)
├─ CNAME                      taylr.sh (apex custom domain)
├─ robots.txt                 pre-launch: AI crawlers blocked (see Deploy)
└─ favicon.svg                copy of src/assets/taylr-logo.svg (keep in sync)
scripts/check-links.js        internal link checker; check-links.allow lists paths allowed to 404
vendor/Swift-App-Template/     sparse template checkout (mise run vendor; git-ignored)
astro.config.mjs              Astro + Starlight + sitemap; the docs sidebar lives here
lighthouserc.json             Lighthouse CI pages + thresholds (a11y ≥ 0.95, others ≥ 0.9)
```

## Swift-App-Template reference (`vendor/`)

`vendor/Swift-App-Template/` is a **git-ignored, sparse checkout** of the template taylr
generates from, created by `mise run vendor`. It is the reference implementation for building
taylr (see `PLAN.md`). It is never mentioned on the site. Treat it as read-only. Do not edit it here.

- **This repo is public: commit only what development needs, nothing redundant.** That is why the
  template isn't vendored. The task checks out only the paths the docs are checked against
  (`Scripts/`, `Packages/`, `Tuist/`, `.github/`, `fastlane/`, configs, `*.template.md`,
  `docs/decisions/`, …), not `_reference/`, `SyntaxKit/` or the template's talk material.
  Add a path to the `sparse-checkout` list in `mise.toml` if the docs start relying on it.
- The pinned commit is `TEMPLATE_REF` in `mise.toml`. Bump it there and re-run `mise run vendor`.
- **The template can be out of date.** When checking the docs against it, also check newer
  BrightDigit repos built on it: [AtLeast](https://github.com/brightdigit/AtLeast) (an app) and
  [MistKit](https://github.com/brightdigit/MistKit) (a Swift package). Clone them fresh rather
  than trusting local checkouts.
- Its files describe the *template*, not this website.
  The most relevant files are `docs/decisions/0001-scaffold-delivery-and-skills.md`
  (the ADR) and the `Scripts/` setup flow.

## Docs authoring notes

- Docs pages live in `src/content/docs/docs/<section>/<page>.md`. Their URL is
  `/docs/<section>/<page>/`.
- **Internal links between docs use absolute `/docs/...` paths** (not relative), so
  they resolve the same from any page and from the landing.
- The sidebar is configured explicitly in `astro.config.mjs`; add new pages there.
- **The CLI reference mirrors [tuist.dev/docs/cli](https://tuist.dev/en/docs/cli).** It lives
  under `/docs/cli/` with no overview page: just one sidebar group per command group
  (`cli/<group>/index.md`, a **Subcommands** table) and per subcommand
  (`cli/<group>/<sub>.mdx`). Each subcommand page has a short intro and examples, then an
  **Arguments** section: one `### <name> <Badge text="Optional" />` heading per argument (bare
  name, no dashes), a sentence, and a `sh` usage line. Sidebar labels are bare names (`add`).
- **The docs are written for users, as if taylr 1.0 ships today.** We work backwards: the
  docs are the spec, and the command is built to match them. No status labels, no
  "planned/draft" hedging beyond the one note on `/docs/`.
- **Never mention Swift-App-Template, ADR-0001, phases or other internals on the site.**
  Those live in [`PLAN.md`](PLAN.md) (not published), which holds only what's needed to
  build taylr that the docs don't say: template mapping, implementation details, template
  changes, acceptance checks and open questions. Don't repeat user-facing behavior there;
  the docs are the record of it.

## DocC seam (`/api`)

The DocC API reference is **not built in this repo**. `public/api/index.html` is a
placeholder. The real archive is generated in the taylr *source* repo with
`swift package generate-documentation --transform-for-static-hosting
--hosting-base-path api`, published as an artifact, and injected into `dist/api/` at
deploy time. The wiring is stubbed (commented) in `.github/workflows/deploy.yml`;
uncomment it once the source repo publishes the archive. Injected DocC output is
git-ignored so the placeholder stays the only committed file under `public/api/`.

## Deploy

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds the site and
publishes it to **GitHub Pages** at the apex domain `taylr.sh` (via `public/CNAME`).
Because it's an apex custom domain, `astro.config.mjs` sets `site` but no `base` path.

Every PR runs the same workflow without deploying (`astro check`, build, `check-links`), plus
`.github/workflows/lighthouse.yml` (`mise run lighthouse`). Fix a failing Lighthouse score
rather than lowering the threshold. The brand orange (`--taylr-accent-600`) is under 4.5:1 as
text on light backgrounds or behind white text, so text uses 700/800 (see `src/styles/theme.css`).

**The site is not indexed until taylr launches.** Every page carries
`<meta name="robots" content="noindex, nofollow">`: Starlight's `head` in `astro.config.mjs`,
`src/layouts/Landing.astro` and `public/api/index.html`. `public/robots.txt` blocks AI crawlers
but lets search engines in, so they see the tag (a `Disallow: /` would hide it). The sitemap
stays for launch. At launch, remove the three tags, drop `"skipAudits": ["is-crawlable"]` from
`lighthouserc.json` (it keeps the noindex tag from failing SEO), and decide whether to keep the AI-crawler
block. The injected DocC archive has no tag; only `robots.txt` covers it.
