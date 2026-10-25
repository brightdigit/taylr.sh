---
title: Introduction
description: taylr creates complete, ready-to-ship Swift apps and packages.
---

**taylr** is a command-line tool that creates a complete, ready-to-ship Swift app or Swift
package.

```sh
taylr project create     # answer a few questions, get a working app
taylr project generate   # generate the Xcode project and open it
```

:::note
taylr is in development. These docs describe version 1.0.
:::

## What you get

One `taylr project create` gives you an app that builds, tests and ships from day one:

- A **Tuist** project for any mix of iOS, macOS, tvOS, watchOS and visionOS, so the Xcode
  project is generated, never hand-edited.
- **Swift packages** for your app's logic, tested with **Swift Testing**.
- **fastlane** lanes for certificates, TestFlight and App Store releases.
- **GitHub Actions** CI that builds, lints, tests and uploads to TestFlight.
- An optional **Hummingbird server**, with its API described in **OpenAPI** if you like, and a Dockerfile.

Or make a **Swift package** on its own with
[`taylr package create`](/docs/cli/package/create/), with the same tests, linting and CI.

See [What's in your project](/docs/reference/project/) for the full tour.

## Answer once, reuse everywhere

Your Apple team, App Store Connect key and certificates are the same for every app you make.
[`taylr profile add`](/docs/cli/profile/add/) asks for them once and keeps secrets in your Keychain.
After that, `taylr project create` only asks about the app.

## Next steps

1. [Install taylr](/docs/getting-started/installation/)
2. [Create your first app](/docs/getting-started/quickstart/)
