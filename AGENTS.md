# AGENTS.md — AKOÚŌ

## What This Project Is

AKOÚŌ is a multimodal listening system and portable skill library for AI agents. It gives agents accountable, switchable, operational ears for analyzing sound, audio, music, and sonic concepts across nine distinct epistemic modes.

It is NOT a generic audio-analysis tool. It is a framework for *how* agents should listen, what each mode reveals, what it hides, and what must remain unknown.

## Core Principles

1. **Claim Taxonomy is sacred.** Every output must separate findings into:
   - `heard` — directly present in the input
   - `measured` — produced by technical inspection
   - `inferred` — plausible logical deductions only (not theory/culture)
   - `interpreted` — cultural, theoretical, affective, or contextual readings
   - `speculative` — declared fictional or imaginative readings
   - `undetermined` — what cannot be responsibly claimed

2. **Listening modes are mutually corrective.** No single mode has the final word.

3. **The router decides.** `akouo-router` analyzes the listening situation and assigns primary, secondary, and corrective modes.

4. **Agents do not hear like humans.** The system does not pretend otherwise.

5. **Public release hygiene governs all edits.** Do not add private paths, unpublished research directories, personal data, local notes, credentials, private recordings, or non-public source maps to the portable release.

## Repository Structure

```
akouo/
  skills/              # Portable agent skills, one per folder
    <mode>/
      SKILL.md         # Skill instructions with YAML frontmatter
      references/      # Bundled JSON schemas for strict output
  schemas/             # Canonical JSON schemas (shared source of truth)
  commands/            # Command definitions that chain skills
  examples/            # Example outputs and reference maps
  README.md
  LICENSE
  .gitignore
```

## Skill Format

Each skill must follow this structure:

```
skill-name/
  SKILL.md             # Required. YAML frontmatter + markdown body
  references/          # Required for AKOÚŌ core skills; enables standalone use
    *.schema.json
```

### SKILL.md requirements

- **YAML frontmatter** at the very top:
  - `name`: kebab-case identifier matching the folder name
  - `description`: A "pushy" paragraph telling agents WHEN to trigger this skill. Include concrete use cases. Combat undertriggering by being explicit and generous with triggering conditions.
  - `compatibility`: Brief note about agent framework support and schema dependencies.
- **Body**: Markdown sections for Purpose, When To Use, Core Question, Input Assumptions, Listening Procedure, Output Structure, Guardrails, Recommended Next Modes, and Examples.
- **Output fields**: Must document every field of the shared listening output.
- **Schema references**: Point to `references/*.schema.json` for standalone portability. The canonical schemas live in `schemas/`.

### Schema bundling rules

- Every listening mode bundles `listening-output.schema.json` and `claim-taxonomy.schema.json` in `references/`.
- The router bundles `router-output.schema.json`, `listening-output.schema.json`, and `claim-taxonomy.schema.json`.
- Do NOT modify schema contents when copying. Keep them identical to `schemas/`.
- If you update a canonical schema in `schemas/`, you MUST re-copy it to all affected `references/` folders.

## When Modifying Skills

1. **Preserve the name field.** Do not change skill identifiers unless you are renaming the entire mode.
2. **Keep descriptions pushy.** The description is the primary trigger mechanism. If a skill is not being invoked when it should, expand the description with more triggering conditions.
3. **Do not add personal data.** No names, addresses, API keys, private recordings, or local paths.
4. **Maintain epistemic consistency.** The claim taxonomy (`heard`/`measured`/`inferred`/`interpreted`/`speculative`/`undetermined`) must be respected uniformly across all skills.
5. **Update examples if you change behavior.** Examples are the fastest way for agents to understand a skill.
6. **Update the README** if you add, remove, or rename skills or commands.
7. **Keep conceptual refinements portable.** Public theory and generic terminology are fine; private project names, local provenance, and local file paths are not.
8. **Model claim objects in examples.** Claim lists should show objects with `statement`, `confidence`, and optional `basis`, not bare strings.

## Versioning And Release Workflow

- Public release baseline: `v0.1`.
- Conceptually refreshed release: `v0.2`.
- Musical/aesthetic listening integration target: `v0.3`.
- Use a release branch for v0.3 work and tag the improved commit as `v0.3` only when explicitly instructed to commit/tag/push.
- Keep the repository remote unchanged unless explicitly instructed.
- Use the public GitHub username `emezzzzz` for release commits and tags; do not expose local Git identity or local network email.
- Do not commit untracked app prototypes, generated outputs, local caches, or private research material into the public portable-skills release.

## When Adding a New Listening Mode

1. Create a new folder under `skills/`.
2. Write `SKILL.md` with full frontmatter.
3. Add `references/listening-output.schema.json` and `references/claim-taxonomy.schema.json`.
4. Update `akouo-router/SKILL.md` to include the new mode in its "Recommended Next Modes" list.
5. Update the README "Core Architecture" section.
6. Update `schemas/listening-output.schema.json` `listening_mode` enum if the mode is part of the core system.
7. Add at least one example showing the mode in action.

## Commands vs Skills

- **Skills** (`skills/`) are agent instructions that define *how* to listen. They are injected as system prompts.
- **Commands** (`commands/`) are user-facing instructions that chain skills into workflows (e.g., `/full-ear`, `/forensic`).
- If you add a command, document which skills it calls and in what order.

## Testing and Validation

- Before releasing skills, verify:
  - No `.md` files remain directly in `skills/` (only folders)
  - Every skill folder contains exactly one `SKILL.md`
  - YAML frontmatter parses correctly
  - Schema references point to existing files
  - No personal data, emails, private network addresses, secrets, or local paths appear in any project file
  - `node_modules/`, build outputs, and `.env` files are gitignored

## Release Hygiene

- This repo is designed for public release.
- This public release is skill-only; do not add `app/` unless the release scope changes.
- All skills are framework-agnostic.
- All schemas use standard JSON Schema Draft 2020-12.
- The MIT license applies to all code, skills, and schemas.
- Never commit private recordings, credentials, or personal data.
