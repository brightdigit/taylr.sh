---
title: taylr profile secrets
description: Manage how a profile's CI secrets reach GitHub, and keep the App Store session fresh.
---

Manages the secrets your projects' CI needs: your App Store Connect API key, your certificates
password and the App Store session. taylr keeps them in your macOS Keychain and copies them to
GitHub. See [Set up CI secrets](/docs/guides/ci-secrets/) for what they are and the ways taylr
can share them.

Every subcommand works on your [default profile](/docs/cli/profile/default/). Pick another with
`--profile`.

## Subcommands

| Command | Description |
| --- | --- |
| [`taylr profile secrets share`](/docs/cli/profile/secrets/share/) | Choose how secrets reach GitHub, or copy them all again. |
| [`taylr profile secrets set`](/docs/cli/profile/secrets/set/) | Add or replace the API key, the certificates password or its deploy key. |
| [`taylr profile secrets renew-session`](/docs/cli/profile/secrets/renew-session/) | Renew the App Store session. |
