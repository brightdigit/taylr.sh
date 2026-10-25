---
title: taylr package
description: Create a Swift package, then build, test and lint it.
---

`taylr package` commands act on one Swift package. Except for `create`, run them inside the
package.

A Swift package has no Xcode project, signing or App Store, so there's nothing to generate or
ship to TestFlight. For an app, use [`taylr project`](/docs/cli/project/).

## Subcommands

| Command | Description |
| --- | --- |
| [`taylr package create`](/docs/cli/package/create/) | Create a new Swift package by answering a few questions. |
| [`taylr package test`](/docs/cli/package/test/) | Run the tests. |
| [`taylr package lint`](/docs/cli/package/lint/) | Check and fix code with SwiftLint and swift-format. |
| [`taylr package build`](/docs/cli/package/build/) | Build the package from the command line. |
| [`taylr package clean`](/docs/cli/package/clean/) | Remove build output. |
| [`taylr package validate`](/docs/cli/package/validate/) | Check that `Manifest.swift` and `Package.swift` agree, and the agent files are linked. |
