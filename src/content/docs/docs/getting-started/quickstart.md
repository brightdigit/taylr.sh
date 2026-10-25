---
title: Quickstart
description: Create and generate your first taylr app.
---

## 1. Create the app

```sh
taylr project create
```

The first time, taylr runs [`taylr profile add`](/docs/cli/profile/add/) to learn about you: your
organization, Apple team and App Store Connect key. Skip anything you don't have yet.

Then it asks about the app:

```text
◆ Name       How would you like to name it?          Acme
◆ Platforms  Which platforms?                        iOS, macOS
◆ Server     Include a Hummingbird server?           No
◆ Bundle ID  com.acmecorp.Acme                       ✓
◆ GitHub     Create a private GitHub repository?     Yes
◆ Repository acme/Acme                               ✓
◆ Git        Worktrees or a single checkout?         Worktrees
◆ Summary    Create Acme? [Y/n]
```

taylr creates `Acme/`, commits it, and pushes it to GitHub with CI ready to run.

## 2. Generate the Xcode project

```sh
cd Acme/main
taylr project generate
```

The project is in `Acme/main/`, one folder per branch. With a
[single checkout](/docs/reference/project/#git-layout), it's in `Acme/`.

taylr installs the tool versions the project pins, generates the Xcode project with Tuist and
opens it. Build and run from Xcode, or run the tests from the command line with
[`taylr project test`](/docs/cli/project/test/).
See [`taylr project generate`](/docs/cli/project/generate/).

Making a Swift package instead? Run [`taylr package create`](/docs/cli/package/create/) and
open `Package.swift` in Xcode; there's nothing to generate.

## 3. Make it yours

Edit anything. Every file is yours.

