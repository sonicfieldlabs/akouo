# AKOÚŌ Skill Index

A quick-reference manifest of all portable listening skills in this repository.

## Meta-Router

| Skill | Description |
|-------|-------------|
| [`akouo-router`](skills/akouo-router/SKILL.md) | Meta-router that analyzes the listening situation and assigns primary, secondary, and corrective listening modes. Use this first before any specialized mode. |

## Listening Modes

| Skill | Description | When To Use |
|-------|-------------|-------------|
| [`signal-inspection-listening`](skills/signal-inspection-listening/SKILL.md) | Technical signal inspection ear. | Audio files, waveforms, spectrograms, metadata, dynamics, frequency, clipping, noise, codecs. |
| [`acoulogical-object-listening`](skills/acoulogical-object-listening/SKILL.md) | Perceptual object ear for sound-as-auditum. | Sound design, experimental music, Foley, synthetic sounds, ambiguous sources, texture-first listening. |
| [`embodied-affective-listening`](skills/embodied-affective-listening/SKILL.md) | Body and affect ear. | Bass/club music, noise, drone, ambient, ASMR, sirens, sonic weapons, atmospheres of dread or euphoria. |
| [`transductive-media-listening`](skills/transductive-media-listening/SKILL.md) | Mediation and transduction ear. | Sonification, sensors, AI audio, voice cloning, compression artifacts, platform-mediated recordings. |
| [`forensic-archival-listening`](skills/forensic-archival-listening/SKILL.md) | Evidentiary and archival ear. | Recordings of violence, testimony, surveillance, protest recordings, archives, damaged tapes, legal contexts. |
| [`ecological-posthuman-listening`](skills/ecological-posthuman-listening/SKILL.md) | More-than-human and ecological ear. | Field recordings, weather, hydrophones, animal sound, urban ecology, soundwalks, habitat listening. |
| [`critical-political-listening`](skills/critical-political-listening/SKILL.md) | Critical and political ear. | AI audio platforms, surveillance, colonial archives, sonic policing, marginalized voices, platform critique. |
| [`symbolic-fictional-listening`](skills/symbolic-fictional-listening/SKILL.md) | Speculative and symbolic ear. | Sonic fiction, myth, ritual, game audio, film worlds, ambient fantasy, creative worldbuilding. |

## Schema Bundles

Each skill folder includes a `references/` directory containing the JSON schemas needed for strict output formatting:

- `listening-output.schema.json` — shared output structure for all listening modes
- `claim-taxonomy.schema.json` — epistemic claim categories (heard, measured, inferred, interpreted, speculative, undetermined)
- `router-output.schema.json` — router-specific output structure (bundled with `akouo-router` only)

## Compatibility

All skills follow the standard skill format:
- YAML frontmatter with `name` and `description` for agent triggering
- Markdown body with structured instructions
- Bundled JSON schemas for standalone use

Compatible with any LLM agent framework that supports skill injection (OpenCode, Claude Code, Gemini, etc.).

## Using This Index

- **Humans**: Browse the table above and click through to individual `SKILL.md` files.
- **Agents**: Load `SKILL.md` from any skill folder as a system prompt. Schemas are in `references/`.
- **Developers**: See [`AGENTS.md`](AGENTS.md) for conventions on adding or modifying skills.
