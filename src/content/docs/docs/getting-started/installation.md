---
title: Installation
description: Install taylr with Homebrew or mise.
---

## Requirements

| Tool | Why taylr needs it |
| --- | --- |
| macOS 26 or later, with Xcode | taylr generates and builds Xcode projects. |
| [mise](https://mise.jdx.dev) | Installs the exact tool versions your project pins (Tuist, SwiftLint, fastlane's Ruby). Xcode builds run linting through it, so every project needs it. |
| [GitHub CLI](https://cli.github.com) (`gh`), signed in | Creates your GitHub repository and sets up CI secrets. Only needed for GitHub features, which are on by default. Without it, use `--no-github` and set CI secrets yourself. |

## Homebrew

```sh
brew install brightdigit/tap/taylr
```

Homebrew also installs mise and the GitHub CLI if you don't have them.

## mise

```sh
mise use -g spm:brightdigit/taylr
mise use -g gh
```

The second line installs the GitHub CLI, if you don't have it yet.

## Sign in to GitHub

```sh
gh auth login
```

To share [CI secrets](/docs/guides/ci-secrets/) with a whole organization, also allow
access to its secrets:

```sh
gh auth refresh -s admin:org
```

You don't have to do this now:
[`taylr profile add`](/docs/cli/profile/add/#before-the-questions) checks both tools and
offers to install them or sign you in.

## Check it works

```sh
taylr --version
```

Next: [create your first app](/docs/getting-started/quickstart/).
