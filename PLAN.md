# taylr implementation notes

Internal, not published. The site docs (`src/content/docs/docs/`) are the spec for what taylr
does; this file only holds what's needed to **build** it that the docs don't say. Don't repeat
user-facing behavior here.

The reference implementation is Swift-App-Template, checked out by `mise run vendor` at
`vendor/Swift-App-Template/` (it can be stale: also check AtLeast for apps and MistKit for
packages). Its direction is ADR-0001 (`docs/decisions/0001-scaffold-delivery-and-skills.md`,
still *Proposed*).

## Build order (ADR-0001)

1. **ScaffoldKit**: make `TemplateGenerator` a library; add `ProjectConfig` (= the answers
   struct) and `TokenSubstitutor`; pin SyntaxKit by tag.
2. **Claude Code plugin + marketplace** (independent of the CLI): `taylr@brightdigit` in
   `brightdigit/claude-plugins`.
3. **taylr CLI**: `profile`, `project` and `package` command groups on ScaffoldKit, resources
   embedded.

## Architecture

- **Prompts:** Noora, pinned to an exact version, modeled on `tuist init`. Answers form one
  `Codable` struct; the prompter sits behind a protocol for tests; a hidden
  `--answers <base64 JSON>` option takes the whole struct.
- **Manifest:** a `TaylrDescription` module, like Tuist's `ProjectDescription`. taylr writes
  `Manifest.swift` as Swift source; reading it back means compile + run + decode JSON, cached,
  as Tuist does. `Package` is `ExpressibleByStringLiteral`; packages are identified by name, so
  a string and a constant with the same name are the same package.
- **Profiles:** read every `.yml` under `~/.taylr/profiles/` at any depth; the name is the
  `name:` key, never the file name; duplicate names are an error naming both files.
- **Detection only suggests:** GitHub org via `gh`; Xcode team via
  `IDEProvisioningTeamByIdentifier` in Xcode's prefs (private format, experimental).
  `profile add` must work without it.

## Mapping to the template

| taylr | Template today |
| --- | --- |
| `profile` values | `setup.sh` flags `--org-name`, `--team-id`, `--apple-id`, `--itc-team-id`, `--certs-repo`, `--github-org` |
| `project create` answers | `--app-name`, `--platform`, `--server`, `--package-name`, URLs; `--server-port` dropped (always 8080); `--year` becomes automatic |
| Bundle ID | `com.<org lowercased, non-alphanumerics removed>.<Name>`; app group `group.<bundle ID>`. The default `bundleIDPrefix` is derived the same way |
| Platform settings | `setup.sh` lines 194–233 (fastlane `ios`/`mac`, produce `ios`/`osx`/`appletvos`/`watchos`/`xros`, destinations, artifact) |
| Generated Swift | `Packages/TemplateGenerator` (7 SyntaxKit generators) → ScaffoldKit |
| Everything else | 21 `{{TEMPLATE_*}}` tokens → `TokenSubstitutor` over embedded resources |
| `taylr project <sub>` | Wraps the template's `make` targets. Renamed: `setup-app`+`setup-groups` → `register`, `add-dev-device` → `add-device`, `sync-app-store` → `metadata`, `privacy-details` → `privacy`, `capture-all` → `screenshots`, `release-build` → `build --release`, `capture-ios` → `screenshots --no-frame` |
| `AGENTS.md` | The template's `CLAUDE.template.md`, renamed; `CLAUDE.md` is a git symlink to it (Windows checkouts need `core.symlinks`) |

## How it's done

- **Git, with GitHub:** create the repo first, then clone it. `single`: ordinary clone, forcing
  branch `main` (an empty clone uses the user's `init.defaultBranch`). `worktrees`:
  `git clone --bare` into `<Name>/.bare/`, a `<Name>/.git` file containing `gitdir: ./.bare`,
  set `remote.origin.fetch` so branches fetch normally, then
  `git worktree add --orphan -b main main` (git ≥ 2.42; plain `worktree add` fails on an empty
  repo). Run `git lfs install` before the first worktree. Without GitHub: `git init` or
  `git init --bare .bare` + worktree.
- **License file:** written by taylr from bundled texts (GitHub's licenses API), filling
  `[year]`/`[fullname]` with the creation year and the profile's organization. Never
  `gh repo create --license`: the non-empty repo breaks the worktree bootstrap, and it fills the
  owner, not the organization.
- **File header:** keep the template's bash `header.sh`; change it to read
  `Scripts/header.mustache` and take `-l <SPDX>`, nothing else. Plain variables only, no
  Mustache sections. Every line must be `//` or `//  …` (its awk strip).
- **Certs-repo deploy key:** `profile add` generates an SSH key, adds the public half read-only
  with `gh repo deploy-key add` (needs admin on the repo), and keeps the private half in the
  Keychain.
- **match secrets in CI** (verified against fastlane `match/lib/match/options.rb`): match has
  no env var for GCS key *contents*, so the workflow writes `MATCH_GOOGLE_CLOUD_KEYS` to a file
  and sets `MATCH_GOOGLE_CLOUD_KEYS_FILE`. GitLab reads `PRIVATE_TOKEN`, so the workflow maps
  `MATCH_GITLAB_PRIVATE_TOKEN` to it.
- **Nightly:** check Docker Hub for `swiftlang/swift:nightly-<next>.x` at create; offline
  `create` skips it silently. Never fall back to `nightly-main`.
- **GitHub-hosted Xcode:** `.xcode("26.4")` is installed with setup-xcode.
- **Plugin install:** the generated `.claude/settings.json` lists the plugin
  (`extraKnownMarketplaces` + `enabledPlugins`) so Claude Code offers to install it.
- **Package linking:** each taylr-created local package has one library named after the
  package; taylr links it with `.product(name:package:)`. App targets link only the client.

## Template changes needed

Found comparing the template (71dada4) with AtLeast and MistKit. Fix in the template or in
taylr's generator.

- **Bugs:** `ServerCommandGenerator` overwrites the hand-written server file and imports
  `ArgumentParser`, which the Server package doesn't declare. The server binds `127.0.0.1`,
  unreachable from outside Docker. `.claude.template/` tokens are never replaced.
  `Scripts/lint.sh` tells users to run `make install-mise`, which isn't a target.
  `validate-template.yml` isn't removed by `setup.sh`. `setup.sh:550-557` prints
  `APP_STORE_CONNECT_API_KEY_CONTENT`/`_API_ISSUER_ID` instead of the workflow's names.
  `FASTLANE_KEYCHAIN_PASSWORD` is passed but never read. The Build Archive step passes no
  `MATCH_GIT_*`.
- **App/Kit split:** comments say full-stack setup splits App out of Kit; `setup.sh` doesn't.
  taylr always splits them. App targets link Kit too (`Project.swift:57,61`; AtLeast
  `Project.swift:89-90`), and the Kit exports two libraries (`…Kit`, `…App`): split them.
- **GitHub-hosted app CI is unproven:** no app repo runs on GitHub-hosted macOS (MistKit does,
  as a package). Self-hosted assumptions in `app.workflow.yml`: `cache_save: false` for mise
  tools; the RubyGems cache is a no-op (no `BUNDLE_PATH`); hard-coded `/Applications/Xcode.app`
  (MistKit pins `Xcode_26.6.app`); preinstalled simulator runtimes (MistKit uses
  `download-platform: true`); match clones the certs repo with the runner's SSH; comments
  assume a persistent working tree.
- **CI:** the Ubuntu job builds only `<Name>Kit` (build every package; guard the App package
  with `canImport(SwiftUI)`); CI runs on every push except `*WIP` (limit pushes to
  `main`/semver); push-to-main skips Windows/Android; Periphery is in `.mise.toml` but nothing
  runs it.
- **Worktrees:** `make clean` trashes `~/Library/Developer/Xcode/DerivedData/<Name>-*` for
  every worktree (scope it to this checkout); `.devcontainer` mounts only the worktree, but
  `main/.git` points into `../.bare/` (mount it, or use relative worktree paths).
- **Missing:** no `LICENSE`, one dev container only (MistKit/AtLeast have one per Swift
  version), no String Catalog (localizations need one), only one platform per app (needs
  per-platform Tuist targets and fastlane lanes), no package-only variant.
- **Not shipped by taylr:** Codecov steps and `.codecov.yml`, `.github/actions/private-spm-dependency`,
  `Scripts/mermaid-to-pptx.py`.

## Acceptance checks

1. **Fidelity:** same answers via `setup.sh` and `taylr project create --answers`; `diff -r`
   matches (apart from the template changes above, `Manifest.swift`, and git); both
   `tuist generate` and build. Every platform, with and without server.
2. `--no-interactive` with a missing required option exits non-zero, never prompts.
3. No secret appears in the manifest, the project, or `~/.taylr/`.
4. `profile add` completes without Xcode detection (Linux, no Xcode, changed format).
5. Optional: built-in agent runtime on ClaudeKit with prompt caching (ADR "Layer 3").

## Open questions

- **Where `profile add` gets Apple data from**, instead of asking for IDs:
  - *App Store Connect API key first.* It's team-scoped and fastlane needs only it for match,
    TestFlight and metadata. The team ID could come from the API (e.g. a bundle ID's `seedId`;
    verify). Apple ID and ASC team ID are then only needed for `produce`, which the ASC API
    can't do.
  - *Apple ID sign-in* (spaceship, same flow as `secrets renew-session`) lists developer and
    ASC teams to pick from.
  - *Local detection:* code-signing certificates in the Keychain (team ID is the subject's OU)
    and Xcode's account prefs.
- **Package graph:** should `Package.server` get its own type so it can't sit in `client` or
  another package's `dependencies`? Can the presets' `AcmeApp` be renamed without a custom
  `Packages`? Is `dependencies` on a top-level `Package` an error or ignored?
- **Swift packages:** does `package create` ask what the package holds (library, executable,
  macro, plugin)? 1.0 creates one library target.
- **Multi-platform apps:** watchOS bundle ID conventions (companion vs. standalone).
- **Vapor:** does `.vapor` exist in `TaylrDescription` 1.0 (and fail `validate`/`create`), or
  is it added later?
- **Git layout for existing projects:** add a `taylr project clone --git-layout`, or document
  the manual steps?
- **CI:** should profile `projects.ci.runners` accept custom labels and `xcodes`? Should taylr
  rewrite workflows when `ci` changes, given there's no `project upgrade`?
- **OpenAPI without a server** (a client in `<Name>Kit` against someone else's API)?
- Options passed without `--no-interactive`: pre-fill the dialog instead of erroring?
- Reading secrets from environment variables when `profile add` runs on CI.
- Does ADR-0001 get accepted? (Runner-up: template + copier, 66 vs 70.) What does the template
  repo become (ADR: an optional "Use this template" front door)?
- Where ScaffoldKit and the skill sources live; how non-Swift resources are embedded.
- **Later:** `project upgrade` with skill migrations (`x-swift-app:` blocks, `skillsApplied`)
  and the ADR's Layer 3 runtime; Developer ID distribution; App Store Connect, screenshot,
  generator, agent and CI-provider alternatives; commands to toggle options after create.
