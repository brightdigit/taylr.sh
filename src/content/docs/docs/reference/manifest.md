---
title: The manifest
description: Manifest.swift — your project's settings, checked by the compiler.
---

`taylr project create` and `taylr package create` write `Manifest.swift` at the root of the
project. It records your answers: the name, the platforms, the GitHub and CI setup, the tools
and files the project has and, for an app, its profile, web links and packages.

It's Swift, like Tuist's `Project.swift`. It builds one value from the `TaylrDescription`
module, so the compiler checks every field: an [`App`](#app) in an app, a
[`Package`](#package) in a Swift package. Optional arguments have defaults, so leave
out anything you don't need. `create` does the same: it only writes a value that differs from
its default, whether it came from a question, an argument or your profile.

**Commit it.** Check it's in sync with the project with
[`taylr project validate`](/docs/cli/project/validate/) or
[`taylr package validate`](/docs/cli/package/validate/).

## Examples

An app with a server:

```swift
import TaylrDescription

let manifest = App(
  name: "Acme",
  profile: .named("default"),
  platforms: [.iOS(), .macOS()],
  urls: .base("https://acme.example"),
  server: .server(framework: .hummingbird(routing: .openAPI))
)
```

With the `default` profile's bundle ID prefix `com.acmecorp`, the bundle ID is
`com.acmecorp.Acme` and the app group is `group.com.acmecorp.Acme`.

An iPhone and iPad app that needs iOS 27.2, without a server, whose web links aren't decided
yet:

```swift
let manifest = App(
  name: "Acme",
  profile: .named("default"),
  platforms: [.iOS("27.2")]
)
```

A Swift package:

```swift
let manifest = Package(
  name: "Acme",
  platforms: [.iOS(), .macOS(), .visionOS()]
)
```

An open-source package that also builds with older Swift, on GitHub's runners:

```swift
let manifest = Package(
  name: "AcmeCharts",
  platforms: [.iOS(), .macOS()],
  swiftVersion: "6.1",
  includeNightly: true,
  github: .init(repository: "acme/AcmeCharts"),
  ci: .githubActions(runners: .githubHosted),
  license: .apache2
)
```

## App

| Field | Meaning | Default |
| --- | --- | --- |
| `name` | The app's name. It must be a valid Swift name. | Required |
| `profile` | The [profile](#profile) the app uses. | Required |
| `platforms` | The [platforms](#platforms) and their minimum versions. The app gets a target for each. | Required |
| `bundleID` | The app's bundle ID. | The profile's `bundleIDPrefix`, then the name: `com.acmecorp.Acme` |
| `appGroupID` | The app group. | `group.` followed by the bundle ID: `group.com.acmecorp.Acme` |
| `urls` | The app's [web links](#urls). | None: add them before you submit to the App Store |
| `packages` | The app's local [packages](#packages) and how they depend on each other. | `.appOnly` |
| `server` | Instead of `packages`: the [server](#server) package. Short for `packages: .withServer(server)`. | None: no server |
| `appStoreConnect` | The [App Store tools](#app-store-tools): `.fastlane`, or `nil` for none. | `.fastlane` |
| `screenshots` | How [App Store screenshots](#app-store-tools) are captured: `.fastlaneSnapshot`, or `nil` for none. | `.fastlaneSnapshot` with fastlane, otherwise `nil` |
| `distribution` | Where the app ships: `[.appStore]`, which includes TestFlight. | `[.appStore]` |
| `pressKit` | The [press kit](#press-kit) images made from the app icon: `.uv`, or `nil` for none. | `.uv` |
| `localizations` | The app's [languages](#localizations), as App Store locale codes. | `["en-US"]` |
| `crossPlatform` | Whether CI also builds the app's packages on Linux, Windows, Android and Wasm. See [CI](#ci). | `true` |
| `generator` | What generates the Xcode project: `.tuist`. | `.tuist` |
| `taylrVersion` | The taylr version the app was created with. | `"1.0.0"` |

An app also takes the [settings every project has](#settings-for-every-project): `github`, `ci`,
`swiftVersion`, `includeNightly`, `devcontainer`, `lint`, `header`, `license`, `gitLFS` and
`agents`. Its `license` defaults to `.proprietary` and `gitLFS` to `true`.

Override the bundle ID only when the app needs a specific one. The app group follows it:

```swift
bundleID: "com.acme.app"  // app group: group.com.acme.app
```

### Platforms

Each platform is written with its minimum version, like the supported platforms in SwiftPM's
`Package.swift`. Leave the version out to get the default, 27:

```swift
platforms: [
  .iOS(),          // iOS 27
  .macOS(.v27),    // macOS 27
  .visionOS("27.2"),
]
```

The platforms are `.iOS`, `.macOS`, `.tvOS`, `.watchOS` and `.visionOS`. The version is a
SwiftPM version such as `.v27`, or a string such as `"27.2"`.

### Profile

Name a [profile](/docs/cli/profile/) from `~/.taylr/profiles/`:

```swift
profile: .named("client-x")
```

Or spell it out, so the app doesn't depend on anyone's `~/.taylr/`. This suits a client's
repository that several people work on:

```swift
profile: .init(
  organization: "Client X Inc",
  bundleIDPrefix: "com.clientx",
  apple: .init(teamID: "FGHIJ67890", ascTeamID: "7654321"),
  signing: .init(storage: .git("git@github.com:clientx/certs.git")),
  github: .init(org: "clientx")
)
```

| Field | Meaning | Default |
| --- | --- | --- |
| `organization` | The organization's name, used in bundle IDs, the license and file headers. | Required |
| `bundleIDPrefix` | The start of the app's bundle ID. | `com.` and the organization's name, lowercased, without spaces or punctuation |
| `apple` | The Apple team: `teamID`, `appleID` and `ascTeamID`. | None |
| `signing` | Where the code-signing certificates are kept: `storage`. | None |
| `github` | The GitHub organization (`org`) and how CI secrets are shared (`ciSecrets`). | Your own account; `ciSecrets` none |
| `secrets` | Where the [secrets](#secrets) come from. | `.team()` |

These are the keys of a [profile file](/docs/cli/profile/#editing-a-profile), as Swift. An inline
profile has no `name`, `header` or `projects`: those only matter when a project is created.

| `apple` field | Meaning |
| --- | --- |
| `teamID` | Apple Developer Team ID. Needed to sign. |
| `appleID` | Apple ID for App Store Connect. Usually left out, so each person's own comes from their `config.yml`. |
| `ascTeamID` | App Store Connect team ID, if the Apple ID belongs to more than one team. |

| `signing.storage` | Certificates are kept in |
| --- | --- |
| `.git("git@github.com:clientx/certs.git")` | A Git repository |
| `.s3(bucket: "clientx-certs", region: "us-east-1")` | An Amazon S3 bucket |
| `.googleCloudStorage(bucket: "clientx-certs")` | A Google Cloud Storage bucket |
| `.gitlabSecureFiles(project: "clientx/certs")` | A GitLab project's secure files |

`github.ciSecrets` is `.organization`, `.repository` or `.skip`, as in
[Set up CI secrets](/docs/guides/ci-secrets/).

A key the inline profile leaves out comes from `profiles:` in your own
[`~/.taylr/config.yml`](/docs/cli/profile/#defaults), such as your Apple ID. If neither has it, a
command that needs it stops before doing anything and names the key to add to
`Manifest.swift`.

#### Secrets

Secrets are never in the manifest. They stay in your Keychain, filed under one of your named
profiles. An inline profile's `secrets` says which:

| `secrets` | Uses |
| --- | --- |
| `.team()` (default) | Your named profile with the same `apple.teamID`. |
| `.team("ABCDE12345")` | Your named profile for another team, such as an agency whose API key can reach the client's team. |
| `.profile("client-x")` | Your named profile `client-x`. Without it, commands stop and name the profile to add. |
| `.environment` | Environment variables only, named like the [CI secrets](/docs/guides/ci-secrets/). Nothing is read from the Keychain. For CI, or a `.env` file. |

With `.team`, more than one matching profile is an error: set `.profile(...)`, or pass
`--profile` to the command. With none, taylr names the command that adds one:

```text
$ taylr project beta
✗ No profile has the secrets for team FGHIJ67890.
  Add one with: taylr profile add --team-id FGHIJ67890
```

Commands that use secrets, such as [`beta`](/docs/cli/project/beta/) and
[`certs`](/docs/cli/project/certs/), take `--profile` to use another profile's secrets for one
run. Inside the project, [`taylr profile secrets`](/docs/cli/profile/secrets/) saves to the
profile the project resolves to, and shares its secrets with GitHub the way that profile does.

A named profile is only read by the commands that need Apple or GitHub access, such as
[`register`](/docs/cli/project/register/) and [`beta`](/docs/cli/project/beta/).
`validate` doesn't need it, or any secrets, so CI can run it without `~/.taylr/`.

### URLs

App Store Connect requires a privacy policy URL and a support URL for every app. The
marketing URL is optional.

Give each link in full:

```swift
urls: .init(
  privacy: "https://acme.example/privacy",
  support: "https://acme.example/support",
  marketing: "https://acme.example"
)
```

Or give your website and the path of each page:

```swift
urls: .base("https://acme.example", privacy: "/legal/privacy", support: "/help")
```

| Field | Meaning | Default |
| --- | --- | --- |
| `privacy` | Privacy policy. | Required. With `.base`: `/privacy` |
| `support` | Support page. | Required. With `.base`: `/support` |
| `marketing` | Marketing page. | None. With `.base`: `/` |

Leave out `urls` until you're ready to submit. The links are also in `fastlane/metadata/`,
which is what gets uploaded. `validate` checks that the two agree.

### Packages

An app's code lives in local packages under `Packages/`, named after the app:

| Package | Holds |
| --- | --- |
| `AcmeApp` | The client: your SwiftUI app. The app targets in `Project.swift` link it. |
| `AcmeKit` | Code with no UI that the app and the server share. It also builds on Linux, Windows and Android. |
| `AcmeServer` | The [server](#server), if you have one. |

`packages` says which there are and what each one depends on. Use one of the two presets, or
lay them out yourself.

| Packages | What you get |
| --- | --- |
| `.appOnly` (default) | `AcmeApp`, which depends on `AcmeKit`. |
| `.withServer(server)` | `AcmeApp` and the server, which both depend on `AcmeKit`. |

`.withServer` is what `server:` gives you, so these two are the same:

```swift
server: .server()
packages: .withServer(.server())
```

#### Your own packages

For any other layout, give the client and the server packages. taylr finds the rest by
following their dependencies.

A package you don't need to configure can be just its name: `"AcmeKit"` is
`Package(name: "AcmeKit")`.

```swift
packages: Packages(
  client: Package(name: "AcmeApp", dependencies: ["AcmeKit"]),
  server: .server(dependencies: ["AcmeKit"])
)
```

Packages with the same name are the same package. When a package has settings, or several
others use it, declare it as a constant and refer to that instead: a misspelled constant is a
compile error, while a misspelled name is only caught by `validate`.

```swift
let models = Package(name: "AcmeModels")
let kit = Package(name: "AcmeKit", dependencies: [models])
let app = Package(name: "AcmeApp", dependencies: [kit])
let server = Package.server(dependencies: [models])

let manifest = App(
  name: "Acme",
  profile: .named("default"),
  platforms: [.iOS(), .macOS()],
  packages: Packages(client: app, server: server)
)
```

Here `AcmeApp` uses `AcmeKit`, which uses `AcmeModels`. The server uses `AcmeModels` too, so
the client and the server share it. The packages are `AcmeApp`, `AcmeKit`, `AcmeModels` and
`AcmeServer`. taylr writes these dependencies into each package's `Package.swift`.

| Field | Meaning | Default |
| --- | --- | --- |
| `client` | The app package: the one the app targets link. | Required |
| `server` | The [server](#server) package. | None: no server |
| `others` | Packages nothing depends on yet, so taylr can't find them by following dependencies. | None |

```swift
packages: Packages(client: app, others: ["AcmeExperiments"])
```

Inside an app, a package's `swiftVersion` defaults to the app's, and its `taylrVersion` is
ignored. Its `platforms` are its own, as in any [package](#package).

A package can also depend on third-party packages. See [Dependencies](#dependencies).

[`taylr project validate`](/docs/cli/project/validate/) reports what the compiler can't:

- a package that isn't in `Packages/`, such as a misspelled name
- a dependency from the manifest that's missing in a package's `Package.swift`
- two packages with the same name but different settings
- a package in `others` that something does depend on (it can be removed from `others`)
- a cycle, such as `AcmeKit` and `AcmeModels` depending on each other
- the client depending on the server, directly or through another package
- a `Package.server` anywhere but `server`

#### Server

`Package.server(...)` creates the server package: a [`Package`](#package) with a server
framework.

```swift
let server = Package.server(
  name: "AcmeServer",
  dependencies: [models],
  framework: .hummingbird(routing: .openAPI)
)
```

| Field | Meaning | Default |
| --- | --- | --- |
| `name` | The package's name. | `AcmeServer` |
| `platforms` | Like every Swift package, it also builds on Linux, where it's deployed. | `[.macOS()]` |
| `dependencies` | The packages the server uses. | None |
| `framework` | The server framework and its routing. | `.hummingbird()`, with the built-in router |

`.hummingbird(routing:)` is a [Hummingbird](https://hummingbird.codes) server. With
`routing: .openAPI`, the API is described in `openapi.yaml` and its code is generated. With
`.builtIn` (default), you write the routes with Hummingbird's router.

### App Store tools

`appStoreConnect: .fastlane` (the default) signs, registers and uploads the app with
[fastlane](https://fastlane.tools): the project gets `fastlane/`, a `Gemfile` and Ruby in
`.mise.toml`. With `nil`, it has none of these. The [signing and release
commands](/docs/reference/project/#signing-and-release) then stop with a message, and CI only
builds and tests.

`screenshots: .fastlaneSnapshot` captures App Store screenshots with fastlane's `snapshot`,
driven by UI tests in `UITests/`. See [`taylr project screenshots`](/docs/cli/project/screenshots/).
With `nil`, there's no `UITests/` target. It needs `appStoreConnect: .fastlane`.

### Press kit

`pressKit: .uv` adds `Scripts/generate-icons.sh`, which exports your app icon into
`Marketing/icons/`: light, dark and tinted renditions, the 1024-pixel App Store icon, favicons
and an Open Graph image for your website. Run it with `make icons`. It uses
[uv](https://docs.astral.sh/uv/), which `.mise.toml` installs. With `nil`, the project has no
script, no `Marketing/` and no uv.

### Localizations

The languages the app is translated into, as App Store locale codes:

```swift
localizations: ["en-US", "fr-FR", "ja"]
```

The first is the development language. taylr adds each language to the app's String Catalog and
to Tuist's known regions, and creates a folder for it in `fastlane/metadata/`. `validate` checks
that the metadata folders match.

## Package

A Swift package: a project on its own, or one of an app's [packages](#packages). Its
products and targets stay in `Package.swift`. The manifest records what taylr set up, and the
[dependencies](#dependencies) taylr writes into `Package.swift`.

| Field | Meaning | Default |
| --- | --- | --- |
| `name` | The package's name. It must be a valid Swift name. | Required |
| `platforms` | Minimum versions, as in the `platforms` of `Package.swift`. As with SwiftPM, the package still builds for platforms you don't list, at SwiftPM's own minimums. Written like an app's [platforms](#platforms). | None: SwiftPM's minimums |
| `swiftVersion` | The Swift language version. | The Swift that comes with your selected Xcode. Inside an app: the app's |
| `dependencies` | The packages this one uses: third-party packages, and inside an app, the app's other packages. See [Dependencies](#dependencies). | None |
| `taylrVersion` | The taylr version the package was created with. Ignored inside an app. | `"1.0.0"` |

A package also takes the [settings every project has](#settings-for-every-project). Its
`license` defaults to `.mit` and `gitLFS` to `false`, and its workflows are `.ci`, `.cleanup`
and `.claude`.

Wherever a `Package` is expected, a string works too: `"AcmeKit"` is
`Package(name: "AcmeKit")`.

A Swift package project has no profile, bundle ID, web links, server, App Store tools, press kit
or localizations.

### Dependencies

`dependencies` takes the same kinds of package dependency as SwiftPM's `Package.swift`, plus,
inside an app, the app's own packages:

```swift
let kit = Package(
  name: "AcmeKit",
  dependencies: [
    models,                                                                    // one of the app's packages: linked
    "AcmeUtilities",                                                           // the same, by name
    .package(url: "https://github.com/apple/swift-collections", from: "1.1.0"),
    .package(url: "https://github.com/apple/swift-log", exact: "1.6.1"),
    .package(url: "https://github.com/acme/acme-design", branch: "main"),
    .package(path: "../SharedCode"),
  ]
)
```

taylr writes each one into the package's `Package.swift`, in two different ways:

- **The app's own packages** are linked for you. taylr creates each of them with one library
  named after the package, and links that library to the target. If you add more libraries to
  a package, link them yourself. A server package has no library, so nothing can depend on it.
- **Third-party packages** are only added to the `dependencies` of `Package.swift`. Their
  products and your targets stay in `Package.swift`, so add the product to the target that
  uses it, as you would with any Swift package:

```swift
// Package.swift
.target(name: "AcmeKit", dependencies: [
  .product(name: "AcmeModels", package: "AcmeModels"),         // written by taylr
  .product(name: "Collections", package: "swift-collections"), // written by you
])
```

You can also add dependencies to `Package.swift` directly. `validate` only checks that the
manifest's dependencies are there, and ignores any others.

A Swift package project has no other packages to depend on, so a name or a `Package` in its
`dependencies` is an error. `validate` reports it, because the compiler can't tell a package
name from any other string:

```swift
let manifest = Package(
  name: "Acme",
  platforms: [.iOS(), .macOS()],
  dependencies: [
    .package(url: "https://github.com/apple/swift-collections", from: "1.1.0"),  // ✓
    "AcmeModels",                                                                 // ✗ validate fails
  ]
)
```

`Package` here is taylr's type, not SwiftPM's `Package` from `Package.swift`. If you need to
tell them apart, write `TaylrDescription.Package`.

## Settings for every project

Apps and Swift packages both take these. Inside an app, a package ignores them, apart from
`swiftVersion`: there's one repository, so the app's settings count.

| Field | Meaning | Default |
| --- | --- | --- |
| `github` | The [GitHub](#github) repository. | None: no GitHub repository |
| `ci` | [CI](#ci): where it runs, its workflows and what it builds. `nil` for no CI. | `.githubActions()` |
| `swiftVersion` | The Swift language version, and the oldest [Swift](#swift-versions) CI tests. | The Swift that comes with your selected Xcode |
| `includeNightly` | Also test the next Swift's [nightly build](#swift-versions). | `false` |
| `devcontainer` | Add [dev containers](#swift-versions) in `.devcontainer/`. | `true` |
| `lint` | The [lint tools](#lint). | `[.swiftLint, .swiftFormat]` |
| `header` | The [file header](#file-header) template, or `nil` for none. | `.file("Scripts/header.mustache")` |
| `license` | The [license](#license). | `.proprietary` for an app, `.mit` for a package |
| `gitLFS` | Store images with Git LFS (`.gitattributes`). | `true` for an app, `false` for a package |
| `agents` | The [AI coding agents](#agents) to set up. | `[.claudeCode]` |

### GitHub

Where the project lives on GitHub:

```swift
github: .init(repository: "acme/Acme")
```

| Field | Meaning | Default |
| --- | --- | --- |
| `repository` | The repository, as `owner/name`. Commands that set up [CI secrets](/docs/guides/ci-secrets/) use it. | Required |

`create` fills it in from your [profile](/docs/cli/profile/#editing-a-profile): the profile's
`github.org` and the project's name. From then on the manifest is what counts, so changing the
profile doesn't change existing projects.

### CI

How CI runs, on GitHub Actions:

```swift
ci: .githubActions(
  runners: .githubHosted,
  workflows: [.ci, .appStoreMetadata, .appStoreSession]
)
```

| Field | Meaning | Default |
| --- | --- | --- |
| `runners` | Where the macOS jobs run. | `.selfHosted()` |
| `workflows` | The workflows in `.github/workflows/`. | All of them |
| `matrix` | What each kind of build adds or leaves out. See [Build matrix](#build-matrix). | None: the standard builds |

`ci: nil` leaves out `.github/workflows/` altogether.

`.selfHosted(labels:xcodes:)` runs the macOS jobs on your own Macs, picked by their runner
labels. The labels default to `["self-hosted", "macOS"]`. `xcodes` lists the Xcode apps
installed on them, by path, and defaults to `["/Applications/Xcode.app"]`. `.githubHosted` runs
them on GitHub's runners, which are free for public repositories. Linux, Windows and Android
jobs always run on GitHub's runners.

| Workflow | File | What it does |
| --- | --- | --- |
| `.ci` | `app.yml` (`package.yml` in a package) | Builds, lints and tests pull requests and `main`. In an app, uploads `main` to TestFlight. |
| `.appStoreMetadata` | `app-store-metadata.yml` | Uploads the App Store listing when you run it from the Actions tab. Apps with fastlane only. |
| `.appStoreSession` | `asc-session.yml` | Checks every week that the [App Store session](/docs/guides/ci-secrets/#keeping-the-app-store-session-fresh) hasn't expired. Apps with fastlane only. |
| `.cleanup` | `cleanup-caches.yml`, `cleanup-pr-caches.yml` | Deletes old GitHub Actions caches, and a pull request's caches when it closes. |
| `.claude` | `claude.yml`, `claude-code-review.yml` | Answers `@claude` in issues and pull requests, and reviews pull requests. Needs the `.claudeCode` [agent](#agents). See [AI tools](/docs/guides/ai/). |

The runners and workflows come from your
[project defaults](/docs/cli/profile/#project-defaults). Without `ci.runners` there, the runners
follow the repository: self-hosted for a private one, GitHub-hosted for a public one.

taylr writes the workflows when it creates the project. If you change `ci` later, edit
`.github/workflows/` to match. `validate` checks that the two agree.

#### Build matrix

`.ci` runs on pull requests, on pushes to `main` and version branches (such as `1.2.0`), and when
you run it from the Actions tab. Draft pull requests never run it. What it builds depends on
where the change is going:

| Build | When | Builds |
| --- | --- | --- |
| `feature` | A pull request into any other branch | The newest Swift on Ubuntu 24.04, and macOS for each platform |
| `version` | A pull request into, or a push to, a version branch | Everything: every [Swift version](#swift-versions) on Ubuntu 24.04 and 22.04, Wasm, Wasm Embedded, Windows, Android, and macOS for each platform |
| `main` | A pull request into, or a push to, `main`, or a run from the Actions tab | The same as `version` |

Every Swift package in the project is built on each of them. An app's packages are too, unless
`crossPlatform` is `false`: then they're only built on Apple platforms. taylr writes the app
package's SwiftUI code inside `#if canImport(SwiftUI)`, so it builds everywhere else as an
empty module.

`matrix` adds builds to these or leaves some out:

```swift
ci: .githubActions(
  runners: .selfHosted(xcodes: ["/Applications/Xcode.app", "/Applications/Xcode-26.4.app"]),
  matrix: .init(
    feature: .init(include: [.linux(.jammy)]),
    main: .init(include: [.xcode(path: "/Applications/Xcode-26.4.app")], exclude: [.android()])
  )
)
```

Something you include runs in that build and the bigger ones: included in `feature`, it also
runs in `version` and `main`. Something you exclude is only left out of the build you name.

| Entry | Builds |
| --- | --- |
| `.swift("6.1")` | A Swift version on Linux |
| `.linux(.noble)`, `.linux(.jammy)` | Ubuntu 24.04 or 22.04 |
| `.wasm`, `.wasmEmbedded` | WebAssembly, or Embedded Swift for WebAssembly |
| `.windows(.v2022)`, `.windows(.v2025)` | Windows Server |
| `.android(api: 34)` | Android, at an API level |
| `.xcode("26.4")` | An Xcode version on GitHub's runners |
| `.xcode(path:)` | One of your `xcodes`, on your own Macs |

Without an `.xcode` entry, the macOS jobs use the runner's selected Xcode. `validate` reports an
`.xcode(path:)` that isn't in `xcodes`.

### Swift versions

CI and the dev containers test every Swift release from `swiftVersion` to the newest one, as
of when the project was created:

```swift
swiftVersion: "6.2",
includeNightly: true
```

With Swift 6.4 the newest, this tests 6.2, 6.3 and 6.4. `swiftVersion` defaults to the Swift in
your selected Xcode, so a new project usually tests only that one.

`includeNightly: true` also tests the nightly build of the next version, 6.5 here, in the
`version` and `main` builds and in a dev container of its own. It's only added once Swift
publishes nightly builds for that version.

`devcontainer: true` adds `.devcontainer/`, for working on Linux from VS Code or GitHub
Codespaces. `devcontainer.json` uses the newest Swift, and each other version has a folder
of its own, such as `.devcontainer/swift-6.2/`.

### Lint

```swift
lint: [.swiftLint, .swiftFormat]
```

| Tool | Does | Configured in |
| --- | --- | --- |
| `.swiftLint` | Style and conventions, with [SwiftLint](https://github.com/realm/SwiftLint) | `.swiftlint.yml` |
| `.swiftFormat` | Formatting, with Apple's [swift-format](https://github.com/swiftlang/swift-format) | `.swift-format` |

[`taylr project lint`](/docs/cli/project/lint/), the build and CI run the ones you list. A tool
you leave out isn't installed and has no configuration file. `[]` turns linting off.

### File header

taylr adds a comment to the top of every Swift file when it lints. The template is
`Scripts/header.mustache`:

```text
//
//  {{file}}
//  {{project}}
//
//  Copyright (c) {{year}} {{organization}}.
//  All rights reserved.
//
```

| Placeholder | Becomes |
| --- | --- |
| `{{file}}` | The file's name |
| `{{project}}` | The project's name |
| `{{organization}}` | Your profile's organization |
| `{{year}}` | The current year |
| `{{license}}` | The [license](#license)'s SPDX identifier, such as `MIT` |

Every line must be `//` or start with `//` and two spaces, so taylr can find the header and
replace it next time. When the year changes, the next lint updates every header and says so,
so you can commit that on its own.

The template comes from your [profile](/docs/cli/profile/#file-header) when the project is
created, or else from taylr's template for the [license](#license). Point `header` at another
file, or turn headers off:

```swift
header: .file("Scripts/our-header.mustache")
header: nil
```

### License

```swift
license: .apache2
```

taylr writes the license text when it creates the project, with the year and your profile's
organization. It also picks the file header that suits the license: a copyright line and the
license's SPDX identifier, and the short notice Apache, GPL, LGPL, AGPL, MPL and EPL ask you to
put in each file.

| License | SPDX identifier | File |
| --- | --- | --- |
| `.proprietary` (default for apps) | `LicenseRef-Proprietary` | `LICENSE`: all rights reserved |
| `.mit` (default for packages) | `MIT` | `LICENSE` |
| `.apache2` | `Apache-2.0` | `LICENSE` |
| `.bsd2`, `.bsd3` | `BSD-2-Clause`, `BSD-3-Clause` | `LICENSE` |
| `.boost` | `BSL-1.0` | `LICENSE` |
| `.mpl2` | `MPL-2.0` | `LICENSE` |
| `.epl2` | `EPL-2.0` | `LICENSE` |
| `.gpl2`, `.gpl3` | `GPL-2.0`, `GPL-3.0` | `LICENSE`, `COPYING` for GPL 3 |
| `.lgpl21` | `LGPL-2.1` | `LICENSE` |
| `.agpl3` | `AGPL-3.0` | `LICENSE` |
| `.cc0` | `CC0-1.0` | `LICENSE`, with no copyright line in headers |
| `.unlicense` | `Unlicense` | `UNLICENSE`, with no copyright line in headers |

If you change the license later, update the license file and `Scripts/header.mustache` too.

### Agents

```swift
agents: [.claudeCode]
```

Every project has `AGENTS.md` and `.agents/`, which coding agents share. Each agent you list
adds its own files. `.claudeCode` adds the `CLAUDE.md` symlink, `.claude/` and the
`.claude` workflows. `[]` keeps only the shared files. See [AI tools](/docs/guides/ai/).
