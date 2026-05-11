# AKOÚŌ Skill Index

A quick-reference manifest of all portable listening skills in this repository.

## Version Notes

`v0.2` preserves the original skill names and schemas while refining each listening mode with clearer evidence discipline, mediation awareness, and public conceptual boundaries.

## Meta-Router

| Skill | Description |
|-------|-------------|
| [`akouo-router`](skills/akouo-router/SKILL.md) | Meta-router that analyzes the listening situation, evidence type, risk level, conceptual frame, and assigns primary, secondary, and corrective listening modes. Use this first before any specialized mode. |

## Listening Modes

| Skill | Description | When To Use |
|-------|-------------|-------------|
| [`signal-inspection-listening`](skills/signal-inspection-listening/SKILL.md) | Technical signal inspection ear. | Audio files, waveforms, spectrograms, metadata, dynamics, frequency, clipping, noise, codecs, compression, machine-listening outputs. |
| [`acoulogical-object-listening`](skills/acoulogical-object-listening/SKILL.md) | Perceptual object ear for sound-as-auditum. | Sound design, experimental music, Foley, synthetic sounds, ambiguous sources, acousmatic situations, texture-first listening. |
| [`embodied-affective-listening`](skills/embodied-affective-listening/SKILL.md) | Body and affect ear. | Bass/club music, noise, drone, ambient, ASMR, sirens, sonic weapons, accessibility, atmospheres of dread or euphoria. |
| [`transductive-media-listening`](skills/transductive-media-listening/SKILL.md) | Mediation and transduction ear. | Sonification, sensors, AI audio, voice cloning, ASR, neural codecs, compression artifacts, platform-mediated recordings. |
| [`forensic-archival-listening`](skills/forensic-archival-listening/SKILL.md) | Evidentiary and archival ear. | Recordings of violence, testimony, surveillance, protest recordings, archives, damaged tapes, legal or custody contexts. |
| [`ecological-posthuman-listening`](skills/ecological-posthuman-listening/SKILL.md) | More-than-human and ecological ear. | Field recordings, weather, hydrophones, animal sound, acoustic ecology, urban ecology, soundwalks, habitat and infrastructure listening. |
| [`critical-political-listening`](skills/critical-political-listening/SKILL.md) | Critical and political ear. | AI audio platforms, surveillance, colonial archives, acoustic justice, sonic policing, marginalized voices, platform critique. |
| [`symbolic-fictional-listening`](skills/symbolic-fictional-listening/SKILL.md) | Speculative and symbolic ear. | Sonic fiction, myth, ritual, hauntology, game audio, film worlds, ambient fantasy, creative worldbuilding. |

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
