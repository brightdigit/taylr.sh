---
title: Working with AI tools
description: Use Claude Code and Xcode's agents with a taylr project.
---

Every taylr project is ready for AI coding tools.

## Built into your project

- **`AGENTS.md`** describes your project's layout, commands and conventions to any coding
  agent that reads it (Codex, Cursor, Gemini CLI, Xcode's agents and others). `CLAUDE.md` is a
  symlink to it, so Claude Code reads the same file. Edit `AGENTS.md`.
- **`.agents/`** holds what every agent shares: `notes.md`, a running log of corrections
  you've given your agents, and `skills/` for skills of your own. Codex reads skills from
  `.agents/skills/`; `.claude/skills` links to it for Claude Code.
- **`.claude/`** holds Claude Code's project settings.
- **CI** includes Claude Code workflows: mention `@claude` in an issue or pull request, and
  pull requests get an automatic review.

The Claude Code files come from the manifest's [`agents`](/docs/reference/manifest/#agents),
which is `[.claudeCode]` unless you choose otherwise. With `agents: []`, or `--no-agents` when
you create the project, it keeps only `AGENTS.md` and `.agents/`.

## The taylr plugin for Claude Code

The plugin adds skills, agents and slash commands tuned for taylr projects.

Your project's `.claude/settings.json` already lists it, so Claude Code offers to install it
the first time you, or a teammate, open the project. To install it yourself:

```text
/plugin marketplace add brightdigit/claude-plugins
/plugin install taylr@brightdigit
```

**Slash commands** run [`taylr project`](/docs/cli/project/) commands:

| Command | Runs |
| --- | --- |
| `/generate` | `taylr project generate` |
| `/lint` | `taylr project lint` |
| `/test` | `taylr project test` |
| `/beta` | `taylr project beta` |
| `/certs` | `taylr project certs` |

**Skills** teach the agent your project's conventions:

- **swift-testing**: writing tests the way your project does.
- **swift-feature**: adding a feature across Kit and App.
- **tuist-project**: changing targets and settings in `Project.swift`.

**Agents** handle focused jobs: writing tests, reviewing Swift changes, and diagnosing
failed CI runs.

The plugin is versioned separately from taylr, so you get improvements with
`/plugin update`.

## Xcode

Skills are standard `SKILL.md` files, so Xcode's coding agent can use them too. The plugin
doesn't repeat skills Xcode already has built in.
