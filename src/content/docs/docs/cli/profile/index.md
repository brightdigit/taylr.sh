---
title: taylr profile
description: Save your organization, Apple team and secrets once, and reuse them for every project.
---

A **profile** holds the details that belong to you, not to one project: your organization,
Apple team, App Store Connect access and code-signing certificates. Every project uses one.
Make one profile per team you build for, such as your own company and each client.
A project names its profile in [`Manifest.swift`](/docs/reference/manifest/#profile), or
spells it out there in full.

You rarely need to start here. [`taylr project create`](/docs/cli/project/create/) runs
[`taylr profile add`](/docs/cli/profile/add/) for you the first time.

## Subcommands

| Command | Description |
| --- | --- |
| [`taylr profile add`](/docs/cli/profile/add/) | Create a profile by answering a few questions. |
| [`taylr profile list`](/docs/cli/profile/list/) | Show your profiles and anything that needs attention. |
| [`taylr profile default`](/docs/cli/profile/default/) | Pick the profile new projects use. |
| [`taylr profile secrets`](/docs/cli/profile/secrets/) | Manage CI secrets and the App Store session: `share`, `set`, `renew-session`. |
| [`taylr profile remove`](/docs/cli/profile/remove/) | Delete a profile and its Keychain items. |

## Where things are stored

Everything taylr keeps about you is in `~/.taylr/`, except secrets.

| What | Where |
| --- | --- |
| Which profile is the default, and [defaults](#defaults) for every profile and new project | `~/.taylr/config.yml` |
| Organization, Apple team, certificates storage, GitHub settings | `~/.taylr/profiles/<name>/profile.yml`, one folder per profile |
| The [file header](#file-header) for new projects | `~/.taylr/profiles/<name>/header.mustache` |
| App Store Connect API key, certificates password, App Store session | Your **macOS Keychain** |

Secrets never go into a file or into your projects.

## Editing a profile

To change a profile, edit its file in `~/.taylr/profiles/` in any editor. For the `default`
profile, that's `~/.taylr/profiles/default/profile.yml`. Keys are grouped, like the
[manifest](/docs/reference/manifest/):

```yaml
name: default
organization: Acme Corp
bundleIDPrefix: com.acmecorp
apple:
  teamID: ABCDE12345
  appleID: dev@acme.com
  ascTeamID: "1234567"
signing:
  storage:
    git: git@github.com:acme/certs.git
github:
  org: acme
  ciSecrets: organization
projects:
  ci:
    runners: github-hosted
```

taylr reads every `.yml` file in `~/.taylr/profiles/` and its folders, so you can arrange them
as you like. A profile's name is its `name`, not its file name. Two profiles with the same
name are an error.

| Key | Meaning | If left out |
| --- | --- | --- |
| `name` | The profile's name, as projects and `--profile` refer to it. | Required |
| `organization` | Your organization's name. | Required |
| `bundleIDPrefix` | The start of every bundle ID, such as `com.acmecorp`. Apps get `com.acmecorp.<Name>`. | `com.` and your organization's name |
| `apple.teamID` | Apple Developer Team ID. | Needed to sign: `register`, `certs`, `add-device`, `beta`, `build --release` |
| `apple.appleID` | Apple ID for App Store Connect. | Needed by `register`, `privacy` and `secrets renew-session` |
| `apple.ascTeamID` | App Store Connect team ID. | Needed by `register` if you belong to more than one team |
| `signing.storage` | Where your code-signing certificates are kept. See [Certificates storage](#certificates-storage). | Needed to sign: `certs`, `beta`, `build --release` |
| `github.org` | GitHub organization that new repositories go to. | Your own GitHub account |
| `github.ciSecrets` | `organization`, `repository` or `skip`. Change it with [`taylr profile secrets share`](/docs/cli/profile/secrets/share/) so GitHub is updated too. | Needed by `create --github` and `secrets` |
| `header` | The [file header](#file-header) template, or `null` for none. | `header.mustache` next to the profile |
| `projects` | Defaults for new projects that use this profile. See [Project defaults](#project-defaults). | The ones in `config.yml` |

Keys with a default can be left out. For the others,
[`taylr profile add`](/docs/cli/profile/add/) helps you find each value. A command that needs a
missing one stops before doing anything and names the key to add:

```text
$ taylr project register
✗ Profile "default" has no apple.teamID.
  Add it to ~/.taylr/profiles/default/profile.yml, or to profiles: in ~/.taylr/config.yml:
    apple:
      teamID: ABCDE12345
```

Changes apply to projects you create afterwards. Existing projects keep the values they were
created with, in their own files.

### Certificates storage

[fastlane match](https://docs.fastlane.tools/actions/match/) keeps your encrypted certificates
in a Git repository, or in cloud storage:

```yaml
signing:
  storage:
    git: git@github.com:acme/certs.git      # or:
    # s3: { bucket: acme-certs, region: us-east-1 }
    # googleCloudStorage: { bucket: acme-certs }
    # gitlabSecureFiles: { project: acme/certs }
```

[`taylr profile add`](/docs/cli/profile/add/) can create a Git repository for you, with a
read-only deploy key for CI. For the other kinds, create the bucket or project yourself and add
its access key with [`taylr profile secrets set`](/docs/cli/profile/secrets/set/).

### File header

New projects get their [file header](/docs/reference/manifest/#file-header) from the profile.
taylr looks for, in order:

1. The file that `header` names, relative to the profile.
2. A `.mustache` file with the profile file's name next to it, such as `client-x.mustache` for
   `client-x.yml`.
3. `header.mustache` next to the profile.
4. taylr's own header for the project's license.

[`taylr profile add`](/docs/cli/profile/add/) writes taylr's header to
`~/.taylr/profiles/<name>/header.mustache`, so there's a file to edit. `header: null` gives new
projects no header. The project gets a copy, so editing the profile's header doesn't change
existing projects.

## Defaults

`~/.taylr/config.yml` names the default profile, and holds defaults for all your profiles and
for every new project:

```yaml
defaultProfile: default
profiles:
  apple:
    appleID: dev@acme.com
  github:
    ciSecrets: organization
projects:
  platforms: [iOS, macOS@27.2]
  server: none
  license:
    app: proprietary
    package: mit
  lint: [swiftLint, swiftFormat]
  git:
    layout: worktrees
  github:
    create: true
    visibility: private
  ci:
    workflows: [ci, appStoreMetadata, appStoreSession, cleanup, claude]
```

| Key | Meaning | If left out |
| --- | --- | --- |
| `defaultProfile` | The profile new projects use. Same as [`taylr profile default`](/docs/cli/profile/default/). | Your only profile, if you have one |
| `profiles` | Values for any profile that doesn't set them, such as an Apple ID you use for every team. Takes every [profile key](#editing-a-profile) except `organization`. | None |
| `projects` | Defaults for every new project, whatever its profile. See [Project defaults](#project-defaults). | taylr's own defaults |

Profiles read `profiles:` whenever a command runs, so changing it changes every profile that
doesn't set the key itself.

### Project defaults

`projects:` can go in `config.yml`, in a profile, or both. They set what
[`taylr project create`](/docs/cli/project/create/) and
[`taylr package create`](/docs/cli/package/create/) suggest, or use with `--no-interactive`.
Each value comes from the first place that has it:

1. An argument, or your answer.
2. `projects:` in the project's profile.
3. `projects:` in `config.yml`.
4. taylr's default.

| Key | Meaning | Default |
| --- | --- | --- |
| `platforms` | Platforms preselected, with minimum versions, written like [`--platform`](/docs/cli/project/create/#platform-): `iOS`, `macOS@27.2`. | None: you pick them, and `--no-interactive` needs `--platform` |
| `server` | `none`, `builtIn` (a Hummingbird server with its built-in router) or `openAPI` (routes from `openapi.yaml`). Apps only. | `none` |
| `git.layout` | `worktrees` or `single`: the [git layout](/docs/reference/project/#git-layout). | `worktrees` |
| `github.create` | Whether to create a GitHub repository, as with `--github` or `--no-github`. | `true` |
| `github.visibility` | `private` or `public`. | `private` |
| `ci.create` | Whether to add CI, as with `--no-ci`. | `true` |
| `ci.runners` | Where macOS CI jobs run: `github-hosted` or `self-hosted`. Projects on GitHub-hosted runners record it in their [manifest](/docs/reference/manifest/#ci). | Self-hosted for private repositories, GitHub-hosted for public ones |
| `ci.workflows` | The [workflows](/docs/reference/manifest/#ci) to add: `ci`, `appStoreMetadata`, `appStoreSession`, `cleanup`, `claude`. Packages only get `ci`, `cleanup` and `claude`. | All that apply |
| `license.app`, `license.package` | The [license](/docs/reference/manifest/#license) for new apps and packages: `proprietary`, or a GitHub license key such as `mit` or `apache-2.0`. | `proprietary` for apps, `mit` for packages |
| `lint` | The [lint tools](/docs/reference/manifest/#lint): `swiftLint`, `swiftFormat`, `periphery`. | `[swiftLint, swiftFormat]` |
| `localizations` | The [languages](/docs/reference/manifest/#localizations) of new apps. | `[en-US]` |
| `appStoreConnect` | `fastlane` or `null`. Apps only. | `fastlane` |
| `screenshots` | `fastlaneSnapshot` or `null`. Apps only. | `fastlaneSnapshot` with fastlane |
| `pressKit` | `uv` or `null`. Apps only. | `uv` |
| `crossPlatform` | Build an app's packages on Linux, Windows, Android and Wasm too. Apps only. | `true` |
| `gitLFS` | Store images with Git LFS. | `true` for apps, `false` for packages |
| `devcontainer` | Add dev containers. | `true` |
| `includeNightly` | Also test the next Swift's nightly build. | `false` |
| `agents` | The [AI agents](/docs/reference/manifest/#agents) to set up: `claudeCode`. | `[claudeCode]` |
