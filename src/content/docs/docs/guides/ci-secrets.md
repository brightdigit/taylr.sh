---
title: Set up CI secrets
description: How taylr gets your App Store Connect key and certificates password into GitHub Actions.
---

Your project's CI needs these GitHub secrets to sign and upload builds:

| Secret | What it is |
| --- | --- |
| `APP_STORE_CONNECT_API_KEY_ISSUER_ID` | From App Store Connect → Users and Access → Integrations |
| `APP_STORE_CONNECT_API_KEY_KEY_ID` | The key's ID |
| `APP_STORE_CONNECT_API_KEY_KEY` | The `.p8` key file, base64-encoded |
| `MATCH_PASSWORD` | Password that encrypts your certificates repository |
| `MATCH_GIT_BASIC_AUTHORIZATION` | Only if your certificates repo uses HTTPS |
| `MATCH_GIT_PRIVATE_KEY` | Only on GitHub's runners, if your certificates repo uses SSH: a read-only deploy key for it, which taylr creates. Your own Macs use their own SSH access. |
| `MATCH_S3_ACCESS_KEY`, `MATCH_S3_SECRET_ACCESS_KEY` | Only if your [certificates are in S3](/docs/cli/profile/#certificates-storage) |
| `MATCH_GOOGLE_CLOUD_KEYS` | Only if your certificates are in Google Cloud Storage: the service account's JSON key. CI writes it to a file for match. |
| `MATCH_GITLAB_PRIVATE_TOKEN` | Only if your certificates are in GitLab secure files: an access token. CI passes it to match as `PRIVATE_TOKEN`. |
| `FASTLANE_SESSION` | Only for publishing App Privacy answers. Expires about monthly. |
| `CLAUDE_CODE_OAUTH_TOKEN` | Only for the [Claude Code workflows](/docs/guides/ai/). Run `/install-github-app` in Claude Code to set it. |

Apart from the Claude Code token, taylr keeps these in your Keychain, from
[`taylr profile add`](/docs/cli/profile/add/) and
[`taylr profile secrets set`](/docs/cli/profile/secrets/set/). It
shares them with GitHub in one of three ways, which you pick when you add the profile.
Change it any time with [`taylr profile secrets share`](/docs/cli/profile/secrets/share/), and
add or rotate a secret with [`taylr profile secrets set`](/docs/cli/profile/secrets/set/).

## Organization secrets (recommended)

taylr stores the secrets **once** on your GitHub organization. Each new app's repository is
then given access. Rotating a key means updating it in one place.

You need to be an admin of the organization. Personal accounts can't use this.

## Per-repository secrets

taylr sets the secrets on each new repository as `taylr project create` creates it. Use this for
personal accounts, or organizations you don't administer.

## Do it yourself

Without the [GitHub CLI](https://cli.github.com), or with `--no-interactive`, taylr prints the
list above and the commands to set them.

## Keeping the App Store session fresh

`FASTLANE_SESSION` expires about once a month. A weekly workflow in your project warns you
when it has expired, and [`taylr profile list`](/docs/cli/profile/list/) shows when it is close. To renew it:

```sh
taylr profile secrets renew-session
```
