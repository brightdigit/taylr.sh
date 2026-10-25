---
title: taylr project
description: Create an app, then build, test, sign and ship it.
---

`taylr project` commands act on one app. Except for `create`, run them inside the project.

For a Swift package on its own, use [`taylr package`](/docs/cli/package/).

## Subcommands

| Command | Description |
| --- | --- |
| [`taylr project create`](/docs/cli/project/create/) | Create a new app by answering a few questions. |
| [`taylr project generate`](/docs/cli/project/generate/) | Generate the Xcode project and open it. |
| [`taylr project test`](/docs/cli/project/test/) | Run the tests. |
| [`taylr project lint`](/docs/cli/project/lint/) | Check and fix code with SwiftLint and swift-format. |
| [`taylr project build`](/docs/cli/project/build/) | Build the app from the command line. |
| [`taylr project clean`](/docs/cli/project/clean/) | Remove build output and generated files. |
| [`taylr project register`](/docs/cli/project/register/) | Register the app and its app group with Apple. |
| [`taylr project certs`](/docs/cli/project/certs/) | Fetch signing certificates and provisioning profiles. |
| [`taylr project add-device`](/docs/cli/project/add-device/) | Register a test device. |
| [`taylr project beta`](/docs/cli/project/beta/) | Build and upload to TestFlight. |
| [`taylr project metadata`](/docs/cli/project/metadata/) | Upload the App Store listing. |
| [`taylr project privacy`](/docs/cli/project/privacy/) | Publish your App Privacy answers. |
| [`taylr project screenshots`](/docs/cli/project/screenshots/) | Capture and frame App Store screenshots. |
| [`taylr project validate`](/docs/cli/project/validate/) | Check that `Manifest.swift` and the project agree, and the agent files are linked. |
